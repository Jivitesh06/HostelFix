// tesseract.js is lazy-loaded inside extractMenuFromImage() to prevent server crash
// if the module is unavailable (e.g. during Render cold start before npm install completes).
// All other exports (parseMenuText, normalizeDayName, getDefaultEmptyMenu, DAYS, MEALS) work without Tesseract.

const path = require('path');
const os = require('os');
const fs = require('fs');

// Path to bundled language models directory (contains eng.traineddata.gz)
const TESSDATA_DIR = path.resolve(__dirname, '../../tessdata');

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
const MEALS = ['BREAKFAST', 'LUNCH', 'SNACKS', 'DINNER'];

/**
 * Robust fuzzy day name normalizer.
 * Handles common OCR character drops and misrecognitions:
 * - TURSDAY, URSDAY, 'URSDAY, RHURSDAY -> Thursday
 * - RIDAY, IRIDAY -> Friday
 * - JATURDAY -> Saturday
 * - WEONESOAY, WENSDAY -> Wednesday
 * - TUESDAY -> Tuesday
 * - MONDAY -> Monday
 * - SUNDAY -> Sunday
 */
function normalizeDayName(raw) {
  if (!raw || typeof raw !== 'string') return null;
  const s = raw.toUpperCase().replace(/[^A-Z]/g, '');

  if (/MON/.test(s)) return 'Monday';
  if (/WED|WEN|WEON/.test(s)) return 'Wednesday';
  if (/FRI|RID/.test(s)) return 'Friday';
  if (/SAT|JAT/.test(s)) return 'Saturday';
  if (/SUN|UND/.test(s)) return 'Sunday';

  // Distinguish Thursday vs Tuesday
  if (/THUR|RHUR|URS/.test(s)) return 'Thursday';
  if (/TUES/.test(s)) return 'Tuesday';
  if (/TUR/.test(s)) return 'Thursday'; // Common OCR misread of Thursday in tables

  return null;
}

const DAY_PATTERNS = [
  { day: 'Monday', regex: /(?:^|\b|\n)(?:MONDAY|MON|MOND)\b/i },
  { day: 'Tuesday', regex: /(?:^|\b|\n)(?:TUESDAY|TUE|TUES|TURSDAY|TUESD)\b/i },
  { day: 'Wednesday', regex: /(?:^|\b|\n)(?:WEDNESDAY|WED|WEDS|WEDNES|WENSDAY|WEONESOAY|WENES|WEDN)\b/i },
  { day: 'Thursday', regex: /(?:^|\b|\n)(?:THURSDAY|THU|THUR|THURS|RHURSDAY|rHURSDAY|'URSDAY|URSDAY)\b/i },
  { day: 'Friday', regex: /(?:^|\b|\n)(?:FRIDAY|FRI|RIDAY|IRIDAY)\b/i },
  { day: 'Saturday', regex: /(?:^|\b|\n)(?:SATURDAY|SAT|SATUR|JATURDAY)\b/i },
  { day: 'Sunday', regex: /(?:^|\b|\n)(?:SUNDAY|SUN|SUNDA|UNDAY)\b/i },
];

const MEAL_PATTERNS = [
  { type: 'BREAKFAST', regex: /(?:BREAKFAST|B['’]?FAST|BREAK\s*FAST|MORNING\s*MEAL|MORNING)/i },
  { type: 'LUNCH', regex: /(?:LUNCH|AFTERNOON\s*MEAL|MID\s*DAY)/i },
  { type: 'SNACKS', regex: /(?:EVENING\s*TEA\s*(?:&|\+)?\s*SNACKS|EVENING\s*SNACKS|TEA\s*&?\s*SNACKS|HIGH\s*TEA|SNACKS|SNACK|TEA\s*TIME)/i },
  { type: 'DINNER', regex: /(?:DINNER|NIGHT\s*MEAL|SUPPER)/i },
];

/**
 * Inspect image buffer headers to extract pixel width and height in pure JS.
 */
function getImageDimensions(buffer) {
  if (!buffer || !Buffer.isBuffer(buffer)) {
    return { width: 1024, height: 768 };
  }
  // Check PNG
  if (buffer.length > 24 && buffer[0] === 0x89 && buffer[1] === 0x50 && buffer[2] === 0x4E && buffer[3] === 0x47) {
    return { width: buffer.readUInt32BE(16), height: buffer.readUInt32BE(20) };
  }
  // Check JPEG
  let offset = 2;
  while (offset + 9 < buffer.length) {
    if (buffer[offset] !== 0xFF) break;
    const marker = buffer[offset + 1];
    if (marker === 0xC0 || marker === 0xC2) {
      return { width: buffer.readUInt16BE(offset + 7), height: buffer.readUInt16BE(offset + 5) };
    }
    const len = buffer.readUInt16BE(offset + 2);
    offset += 2 + len;
  }
  return { width: 1024, height: 768 };
}

/**
 * Clean up extracted meal text: strips table-line artifacts and collapses spaces.
 */
function sanitizeMealText(text) {
  if (!text) return '';
  return text
    .replace(/^[:\-\–\—\s|•*~\[\]()/\\{}0-9.,_]+/, '') // leading punctuation/delimiters
    .replace(/[:\-\–\—\s|•*~\[\]()/\\{}0-9.,_]+$/, '') // trailing punctuation/delimiters
    .replace(/,\s*,+/g, ', ')                         // clean duplicate commas
    .replace(/\s+/g, ' ')                             // collapse whitespace
    .trim();
}

/**
 * Cleans multi-line cell text and merges lines into a single coherent meal entry.
 */
function cleanCellText(text) {
  if (!text) return '';
  const lines = text.split(/\r?\n/)
    .map(l => l.replace(/^(?:DAYS?|BREAK\s*FAST|LUNCH|SNACKS?|DINNER)\b/i, ''))
    .map(sanitizeMealText)
    .filter(l => l.length >= 3 && !isDayLabel(l));
  
  if (lines.length === 0) return '';
  return sanitizeMealText(lines.join(', '));
}

/**
 * Helper to test if a short string is merely a day name label.
 */
function isDayLabel(text) {
  if (!text) return false;
  return Boolean(normalizeDayName(text)) && text.length <= 15;
}

/**
 * Parses raw OCR text into standard 28-slot weekly menu structure.
 * Supports both label-based lists and grid/table-based layouts.
 * 
 * @param {string} text - Raw OCR text
 * @returns {{ menu: Array, uncertainCount: number, rawText: string }}
 */
function parseMenuText(text) {
  if (!text || typeof text !== 'string') {
    return {
      menu: getDefaultEmptyMenu(),
      uncertainCount: 28,
      rawText: '',
    };
  }

  // 1. Identify day occurrences and split into day blocks
  const dayMatches = [];
  for (const dp of DAY_PATTERNS) {
    let match;
    const globalRegex = new RegExp(dp.regex.source, 'gi');
    while ((match = globalRegex.exec(text)) !== null) {
      dayMatches.push({ day: dp.day, index: match.index });
    }
  }

  dayMatches.sort((a, b) => a.index - b.index);

  // Group text under each unique day
  const dayBlocks = {};
  for (let i = 0; i < dayMatches.length; i++) {
    const current = dayMatches[i];
    let nextIndex = text.length;
    for (let j = i + 1; j < dayMatches.length; j++) {
      if (dayMatches[j].day !== current.day) {
        nextIndex = dayMatches[j].index;
        break;
      }
    }
    const chunk = text.substring(current.index, nextIndex);
    if (!dayBlocks[current.day] || chunk.length > dayBlocks[current.day].length) {
      dayBlocks[current.day] = chunk;
    }
  }

  const result = [];
  let uncertainCount = 0;

  for (const day of DAYS) {
    const block = dayBlocks[day] || '';
    const lines = block ? block.split(/\r?\n/).map((l) => l.trim()).filter(Boolean) : [];
    const dayMealSlots = {};

    // Strategy 1: Label-based extraction (Breakfast: ..., Lunch: ...)
    for (const meal of MEALS) {
      const mealPattern = MEAL_PATTERNS.find((m) => m.type === meal);
      if (block && mealPattern) {
        for (let li = 0; li < lines.length; li++) {
          const line = lines[li];
          if (mealPattern.regex.test(line)) {
            let inlineText = line.replace(mealPattern.regex, '');
            inlineText = sanitizeMealText(inlineText);

            // Collect subsequent line(s) belonging to this meal until next meal or day
            const subsequent = [];
            for (let k = li + 1; k < lines.length; k++) {
              const nextLine = lines[k];
              const isAnotherMeal = MEAL_PATTERNS.some((mp) => mp.regex.test(nextLine));
              const isAnotherDay = DAY_PATTERNS.some((dp) => dp.regex.test(nextLine));
              if (isAnotherMeal || isAnotherDay) break;
              subsequent.push(nextLine);
            }

            const allLines = [inlineText, ...subsequent].filter(Boolean);
            const combined = sanitizeMealText(allLines.join(', '));
            if (combined.length >= 3) {
              dayMealSlots[meal] = { items: combined, confidence: 90 };
            }
            break;
          }
        }
      }
    }

    // Strategy 2: Table / Grid fallback
    // If fewer than 2 meals were found via explicit labels, extract cells partitioned by delimiters
    const matchedCount = Object.keys(dayMealSlots).length;
    if (matchedCount < 2 && block) {
      const cleanBlock = block.replace(/^(?:MONDAY|TUESDAY|WEDNESDAY|THURSDAY|FRIDAY|SATURDAY|SUNDAY|MON|TUE|WED|THU|FRI|SAT|SUN|RIDAY|TURSDAY|JATURDAY|rHURSDAY|UNDA)\b/i, '');
      const cells = cleanBlock
        .split(/[|\[\]\t;/\n]+/)
        .map(sanitizeMealText)
        .filter((c) => c.length >= 3 && !isDayLabel(c) && !/^(?:DAYS?|BREAK\s*FAST|LUNCH|SNACKS?|DINNER)$/i.test(c));

      const emptyMeals = MEALS.filter((m) => !dayMealSlots[m]);
      for (let ci = 0; ci < Math.min(cells.length, emptyMeals.length); ci++) {
        dayMealSlots[emptyMeals[ci]] = {
          items: cells[ci],
          confidence: 70,
        };
      }
    }

    // Assemble final 4 meal slots for this day
    for (const meal of MEALS) {
      const slot = dayMealSlots[meal];
      const items = slot ? slot.items : '';
      const isUncertain = !items || items.length < 3;
      if (isUncertain) {
        uncertainCount++;
      }

      result.push({
        dayOfWeek: day,
        mealType: meal,
        items: items || '',
        isUncertain,
        confidence: isUncertain ? (items ? 40 : 0) : slot.confidence,
      });
    }
  }

  return {
    menu: result,
    uncertainCount,
    rawText: text,
  };
}

/**
 * Returns default empty 28-slot menu.
 */
function getDefaultEmptyMenu() {
  const slots = [];
  for (const day of DAYS) {
    for (const meal of MEALS) {
      slots.push({
        dayOfWeek: day,
        mealType: meal,
        items: '',
        isUncertain: true,
        confidence: 0,
      });
    }
  }
  return slots;
}

/**
 * Runs OCR on an image buffer or file path and extracts the weekly mess menu.
 * Uses a hybrid approach:
 * 1. Whole-image OCR (fast pass for structured list menus)
 * 2. Table-grid region extraction (slices individual cells to prevent adjacent column merging)
 * 3. Preserves multi-line cell items within each meal
 * 
 * @param {Buffer|string} imageSource - Image buffer or path
 * @returns {Promise<{ success: boolean, menu: Array, rawText: string, uncertainCount: number, error?: string }>}
 */
async function extractMenuFromImage(imageSource) {
  let Tesseract;
  try {
    Tesseract = require('tesseract.js');
  } catch (loadErr) {
    console.error('[MenuOCR] tesseract.js module not found:', loadErr.message);
    return {
      success: false,
      error: 'OCR engine not available. Please contact the administrator.',
      menu: getDefaultEmptyMenu(),
      rawText: '',
      uncertainCount: 28,
    };
  }

  let worker = null;
  try {
    const tessOptions = {
      gzip: true,
      cachePath: os.tmpdir(),
    };

    // Use local bundled traineddata if present to prevent remote CDN fetch
    if (fs.existsSync(TESSDATA_DIR)) {
      tessOptions.langPath = TESSDATA_DIR;
    }

    worker = await Tesseract.createWorker('eng', 1, tessOptions);

    // Read buffer if imageSource is path or already buffer
    let imgBuffer = null;
    if (Buffer.isBuffer(imageSource)) {
      imgBuffer = imageSource;
    } else if (typeof imageSource === 'string' && fs.existsSync(imageSource)) {
      imgBuffer = fs.readFileSync(imageSource);
    }

    // ── PASS 1: Whole image OCR ──────────────────────────────────────────────
    const ocrResult = await worker.recognize(imageSource);
    const rawText = ocrResult.data?.text || '';
    const parsedWhole = parseMenuText(rawText);

    const dims = getImageDimensions(imgBuffer);
    const W = dims.width;
    const H = dims.height;
    const recognizedCount = parsedWhole.menu.filter((s) => !s.isUncertain).length;

    // If whole-image pass recognized 20+ slots or image is too small to be a table grid, return whole-image result
    if (recognizedCount >= 20 || !imgBuffer || W < 300 || H < 300) {
      return {
        success: true,
        menu: parsedWhole.menu,
        rawText: parsedWhole.rawText,
        uncertainCount: parsedWhole.uncertainCount,
      };
    }

    // ── PASS 2: Table / Grid Region Extraction ────────────────────────────────
    // When dealing with grid menus (like Chitkara), whole-page OCR merges adjacent columns.
    // We slice the table into 7 day rows and 4 meal columns to read each cell independently.
    // Standard university schedule layout: table spans ~24% to 85% vertically
    const tableTop = Math.round(0.24 * H);
    const tableBottom = Math.round(0.85 * H);
    const rowH = (tableBottom - tableTop) / 7;

    // 4 Meal columns (excluding day column on left)
    const colBboxes = [
      { meal: 'BREAKFAST', x0: 0.17, x1: 0.38 },
      { meal: 'LUNCH', x0: 0.38, x1: 0.62 },
      { meal: 'SNACKS', x0: 0.62, x1: 0.79 },
      { meal: 'DINNER', x0: 0.79, x1: 0.98 },
    ];

    const mergedMenu = JSON.parse(JSON.stringify(parsedWhole.menu));

    for (let r = 0; r < 7; r++) {
      const dayName = DAYS[r];
      const y0 = Math.max(0, Math.min(H - 10, Math.round(tableTop + (r * rowH))));
      const h = Math.max(10, Math.min(H - y0, Math.round(rowH)));

      for (const col of colBboxes) {
        const targetSlot = mergedMenu.find((s) => s.dayOfWeek === dayName && s.mealType === col.meal);
        if (!targetSlot) continue;

        const x0 = Math.max(0, Math.min(W - 10, Math.round(col.x0 * W)));
        const w = Math.max(10, Math.min(W - x0, Math.round((col.x1 - col.x0) * W)));

        try {
          const cellRet = await worker.recognize(imgBuffer, {
            rectangle: { left: x0, top: y0, width: w, height: h },
          });

          const cleaned = cleanCellText(cellRet.data?.text || '');
          if (cleaned.length >= 3) {
            // Take cell result if whole-image had nothing or if cell result is cleaner/longer
            if (targetSlot.isUncertain || cleaned.length > targetSlot.items.length) {
              targetSlot.items = cleaned;
              targetSlot.confidence = Math.max(cellRet.data?.confidence || 0, 75);
              targetSlot.isUncertain = targetSlot.confidence < 50 || cleaned.length < 4;
            }
          }
        } catch (_) {
          // Keep existing slot value if single-cell recognize fails
        }
      }
    }

    // Recompute uncertain count
    let uncertainCount = 0;
    for (const slot of mergedMenu) {
      if (slot.isUncertain || !slot.items || slot.items.length < 3) {
        slot.isUncertain = true;
        uncertainCount++;
      }
    }

    return {
      success: true,
      menu: mergedMenu,
      rawText: parsedWhole.rawText,
      uncertainCount,
    };
  } catch (error) {
    console.error('[MenuOCR] OCR extraction error:', error);
    return {
      success: false,
      error: error.message || 'OCR processing failed',
      menu: getDefaultEmptyMenu(),
      rawText: '',
      uncertainCount: 28,
    };
  } finally {
    if (worker) {
      try {
        await worker.terminate();
      } catch (_) {}
    }
  }
}

module.exports = {
  extractMenuFromImage,
  parseMenuText,
  normalizeDayName,
  getDefaultEmptyMenu,
  DAYS,
  MEALS,
};


