// tesseract.js is lazy-loaded inside extractMenuFromImage() to prevent server crash
// if the module is unavailable (e.g. during Render cold start before npm install completes).
// All other exports (parseMenuText, getDefaultEmptyMenu, DAYS, MEALS) work without Tesseract.

const path = require('path');
const os = require('os');
const fs = require('fs');

// Path to bundled language models directory (contains eng.traineddata.gz)
const TESSDATA_DIR = path.resolve(__dirname, '../../tessdata');

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
const MEALS = ['BREAKFAST', 'LUNCH', 'SNACKS', 'DINNER'];

const DAY_PATTERNS = [
  { day: 'Monday', regex: /(?:^|\b|\n)(?:MONDAY|MON|MOND)\b/i },
  { day: 'Tuesday', regex: /(?:^|\b|\n)(?:TUESDAY|TUE|TUES|TURSDAY|TUESD)\b/i },
  { day: 'Wednesday', regex: /(?:^|\b|\n)(?:WEDNESDAY|WED|WEDS|WEDNES|WENSDAY|WEONESOAY|WENES|WEDN)\b/i },
  { day: 'Thursday', regex: /(?:^|\b|\n)(?:THURSDAY|THU|THUR|THURS|RHURSDAY|rHURSDAY)\b/i },
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
 * Clean up extracted meal text.
 */
function sanitizeMealText(text) {
  if (!text) return '';
  return text
    .replace(/^[:\-\–\—\s|•*~\[\]()/\\{}0-9.,]+/, '') // leading punctuation/delimiters
    .replace(/[:\-\–\—\s|•*~\[\]()/\\{}0-9.,]+$/, '') // trailing punctuation/delimiters
    .replace(/\s+/g, ' ')                             // collapse whitespace
    .trim();
}

/**
 * Helper to test if a short string is merely a day name label.
 */
function isDayLabel(text) {
  for (const dp of DAY_PATTERNS) {
    if (dp.regex.test(text) && text.length <= 15) return true;
  }
  return false;
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

  // Sort by position in text
  dayMatches.sort((a, b) => a.index - b.index);

  // Group text under each unique day
  const dayBlocks = {};
  for (let i = 0; i < dayMatches.length; i++) {
    const current = dayMatches[i];
    // Next day match or end of text
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

            if (inlineText.length >= 3) {
              dayMealSlots[meal] = { items: inlineText, confidence: 90 };
            } else {
              const subsequent = [];
              for (let k = li + 1; k < lines.length; k++) {
                const nextLine = lines[k];
                const isAnotherMeal = MEAL_PATTERNS.some((mp) => mp.regex.test(nextLine));
                const isAnotherDay = DAY_PATTERNS.some((dp) => dp.regex.test(nextLine));
                if (isAnotherMeal || isAnotherDay) break;
                subsequent.push(nextLine);
              }
              if (subsequent.length > 0) {
                dayMealSlots[meal] = { items: sanitizeMealText(subsequent.join(', ')), confidence: 85 };
              }
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
      // Clean leading day name if present
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
 * Uses local bundled traineddata to avoid network calls and timeouts on Render.
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

    // Use local bundled traineddata if present to prevent any remote CDN fetch
    if (fs.existsSync(TESSDATA_DIR)) {
      tessOptions.langPath = TESSDATA_DIR;
    }

    worker = await Tesseract.createWorker('eng', 1, tessOptions);
    const ocrResult = await worker.recognize(imageSource);
    const rawText = ocrResult.data?.text || '';
    const parsed = parseMenuText(rawText);

    return {
      success: true,
      menu: parsed.menu,
      rawText: parsed.rawText,
      uncertainCount: parsed.uncertainCount,
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
  getDefaultEmptyMenu,
  DAYS,
  MEALS,
};

