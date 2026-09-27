// tesseract.js is lazy-loaded inside extractMenuFromImage() to prevent server crash
// if the module is unavailable (e.g. during Render cold start before npm install completes).
// All other exports (parseMenuText, getDefaultEmptyMenu, DAYS, MEALS) work without Tesseract.

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
const MEALS = ['BREAKFAST', 'LUNCH', 'SNACKS', 'DINNER'];

const DAY_PATTERNS = [
  { day: 'Monday', regex: /(?:^|\b|\n)(?:MONDAY|MON)\b/i },
  { day: 'Tuesday', regex: /(?:^|\b|\n)(?:TUESDAY|TUE|TUES)\b/i },
  { day: 'Wednesday', regex: /(?:^|\b|\n)(?:WEDNESDAY|WED)\b/i },
  { day: 'Thursday', regex: /(?:^|\b|\n)(?:THURSDAY|THU|THUR|THURS)\b/i },
  { day: 'Friday', regex: /(?:^|\b|\n)(?:FRIDAY|FRI)\b/i },
  { day: 'Saturday', regex: /(?:^|\b|\n)(?:SATURDAY|SAT)\b/i },
  { day: 'Sunday', regex: /(?:^|\b|\n)(?:SUNDAY|SUN)\b/i },
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
    .replace(/^[:\-\–\—\s|•*~]+/, '') // leading punctuation
    .replace(/[:\-\–\—\s|•*~]+$/, '') // trailing punctuation
    .replace(/\s+/g, ' ')             // collapse whitespace
    .trim();
}

/**
 * Parses raw OCR text into standard 28-slot weekly menu structure.
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

    for (const meal of MEALS) {
      const mealPattern = MEAL_PATTERNS.find((m) => m.type === meal);
      let items = '';
      let confidence = 0;

      if (block && mealPattern) {
        // Find line matching meal label
        for (let li = 0; li < lines.length; li++) {
          const line = lines[li];
          if (mealPattern.regex.test(line)) {
            // Option A: items on same line after meal label (e.g. "Breakfast: Aloo Paratha, Curd")
            let inlineText = line.replace(mealPattern.regex, '');
            inlineText = sanitizeMealText(inlineText);

            if (inlineText.length >= 3) {
              items = inlineText;
              confidence = 90;
            } else {
              // Option B: items on subsequent line(s) until next meal label or day label
              const subsequent = [];
              for (let k = li + 1; k < lines.length; k++) {
                const nextLine = lines[k];
                const isAnotherMeal = MEAL_PATTERNS.some((mp) => mp.regex.test(nextLine));
                const isAnotherDay = DAY_PATTERNS.some((dp) => dp.regex.test(nextLine));
                if (isAnotherMeal || isAnotherDay) break;
                subsequent.push(nextLine);
              }
              if (subsequent.length > 0) {
                items = sanitizeMealText(subsequent.join(', '));
                confidence = 85;
              }
            }
            break;
          }
        }
      }

      // Check if text is valid or uncertain
      const isUncertain = !items || items.length < 3;
      if (isUncertain) {
        uncertainCount++;
      }

      result.push({
        dayOfWeek: day,
        mealType: meal,
        items: items || '',
        isUncertain,
        confidence: isUncertain ? (items ? 40 : 0) : confidence,
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

  try {
    const ocrResult = await Tesseract.recognize(imageSource, 'eng');
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
  }
}

module.exports = {
  extractMenuFromImage,
  parseMenuText,
  getDefaultEmptyMenu,
  DAYS,
  MEALS,
};
