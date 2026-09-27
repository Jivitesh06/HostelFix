const prisma = require('../config/prisma');
const {
  sendSuccess,
  sendCreated,
  sendError,
  sendNotFound,
} = require('../utils/response');
const { uploadToCloudinary } = require('../config/cloudinary');
const { extractMenuFromImage, getDefaultEmptyMenu } = require('../services/menuOcr.service');

const VALID_MEAL_TYPES = ['BREAKFAST', 'LUNCH', 'SNACKS', 'DINNER'];
const VALID_DAYS = [
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
  'Sunday',
];

/**
 * GET /api/mess
 * Returns weekly mess schedule with student ratings.
 * Accessible to all authenticated users.
 */
const getMenu = async (req, res, next) => {
  try {
    const menu = await prisma.messMenu.findMany({
      include: {
        feedbacks: {
          select: {
            id: true,
            rating: true,
            comment: true,
            createdAt: true,
            student: {
              select: {
                id: true,
                name: true,
              },
            },
          },
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    // Sort order helper for days and meals
    const dayOrder = {
      Monday: 1,
      Tuesday: 2,
      Wednesday: 3,
      Thursday: 4,
      Friday: 5,
      Saturday: 6,
      Sunday: 7,
    };
    const mealOrder = {
      BREAKFAST: 1,
      LUNCH: 2,
      SNACKS: 3,
      DINNER: 4,
    };

    menu.sort((a, b) => {
      const dayDiff = (dayOrder[a.dayOfWeek] || 99) - (dayOrder[b.dayOfWeek] || 99);
      if (dayDiff !== 0) return dayDiff;
      return (mealOrder[a.mealType] || 99) - (mealOrder[b.mealType] || 99);
    });

    // Compute average ratings
    const formattedMenu = menu.map((m) => {
      const ratings = m.feedbacks.map((f) => f.rating);
      const avgRating =
        ratings.length > 0
          ? Number((ratings.reduce((a, b) => a + b, 0) / ratings.length).toFixed(1))
          : null;

      return {
        ...m,
        averageRating: avgRating,
        feedbackCount: ratings.length,
      };
    });

    return sendSuccess(res, formattedMenu);
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/mess
 * Warden adds a new meal entry to the schedule.
 * Role: WARDEN
 */
const createMenuItem = async (req, res, next) => {
  try {
    const { dayOfWeek, mealType, items, weekOf } = req.body;

    if (!dayOfWeek || !mealType || !items) {
      return sendError(res, 'Day of week, meal type, and items are required', 400);
    }

    if (!VALID_MEAL_TYPES.includes(mealType)) {
      return sendError(
        res,
        `Invalid meal type. Allowed: ${VALID_MEAL_TYPES.join(', ')}`,
        400
      );
    }

    const cleanItems = typeof items === 'string' ? items.trim() : '';
    if (!cleanItems) {
      return sendError(res, 'Meal items cannot be empty', 400);
    }

    // Default weekOf to current week Monday if omitted
    let weekDate;
    if (weekOf) {
      weekDate = new Date(weekOf);
    } else {
      const today = new Date();
      const day = today.getDay();
      const diff = today.getDate() - day + (day === 0 ? -6 : 1);
      weekDate = new Date(today.setDate(diff));
      weekDate.setHours(0, 0, 0, 0);
    }

    const newItem = await prisma.messMenu.create({
      data: {
        dayOfWeek: dayOfWeek.trim(),
        mealType,
        items: cleanItems,
        weekOf: weekDate,
      },
    });

    return sendCreated(res, newItem);
  } catch (error) {
    next(error);
  }
};

/**
 * PUT /api/mess/:id
 * Warden updates meal items or details.
 * Role: WARDEN
 */
const updateMenuItem = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { items, dayOfWeek, mealType } = req.body;

    const existing = await prisma.messMenu.findUnique({ where: { id } });
    if (!existing) {
      return sendNotFound(res, 'Menu entry not found');
    }

    const updateData = {};
    if (items !== undefined) {
      if (typeof items !== 'string' || !items.trim()) {
        return sendError(res, 'Meal items cannot be empty', 400);
      }
      updateData.items = items.trim();
    }

    if (dayOfWeek) updateData.dayOfWeek = dayOfWeek.trim();
    if (mealType) {
      if (!VALID_MEAL_TYPES.includes(mealType)) {
        return sendError(res, `Invalid meal type: ${mealType}`, 400);
      }
      updateData.mealType = mealType;
    }

    const updated = await prisma.messMenu.update({
      where: { id },
      data: updateData,
    });

    return sendSuccess(res, updated);
  } catch (error) {
    next(error);
  }
};

/**
 * DELETE /api/mess/:id
 * Warden deletes a mess menu entry.
 * Role: WARDEN
 */
const deleteMenuItem = async (req, res, next) => {
  try {
    const { id } = req.params;

    const existing = await prisma.messMenu.findUnique({ where: { id } });
    if (!existing) {
      return sendNotFound(res, 'Menu entry not found');
    }

    // Delete feedbacks first (if any) then delete menu entry in transaction
    await prisma.$transaction([
      prisma.menuFeedback.deleteMany({ where: { messMenuId: id } }),
      prisma.messMenu.delete({ where: { id } }),
    ]);

    return sendSuccess(res, { message: 'Menu entry deleted' });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/mess/:id/feedback
 * Student submits rating (1-5) and optional comment for a meal.
 * Role: STUDENT
 */
const submitFeedback = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { rating, comment } = req.body;

    if (rating === undefined || rating === null) {
      return sendError(res, 'Rating is required', 400);
    }

    const numRating = Number(rating);
    if (!Number.isInteger(numRating) || numRating < 1 || numRating > 5) {
      return sendError(res, 'Rating must be an integer between 1 and 5', 400);
    }

    const menu = await prisma.messMenu.findUnique({ where: { id } });
    if (!menu) {
      return sendNotFound(res, 'Menu entry not found');
    }

    const feedback = await prisma.menuFeedback.create({
      data: {
        messMenuId: id,
        studentId: req.user.id,
        rating: numRating,
        comment: comment && typeof comment === 'string' ? comment.trim() : null,
      },
      include: {
        student: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    return sendCreated(res, feedback);
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/mess/feedback
 * Warden retrieves student feedback list.
 * Role: WARDEN
 */
const getFeedback = async (req, res, next) => {
  try {
    const feedbacks = await prisma.menuFeedback.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        student: {
          select: {
            id: true,
            name: true,
            roomNumber: true,
            hostelName: true,
          },
        },
        messMenu: {
          select: {
            id: true,
            dayOfWeek: true,
            mealType: true,
            items: true,
          },
        },
      },
    });

    return sendSuccess(res, feedbacks);
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/mess/extract-menu-photo
 * Warden uploads a photo/screenshot of the weekly mess menu.
 * Cloudinary stores image, Tesseract extracts text and structures into 28 slots.
 * Does NOT publish to production. Returns editable preview structure.
 * Role: WARDEN
 */
const extractMenuFromPhoto = async (req, res, next) => {
  try {
    if (!req.file) {
      return sendError(res, 'Please upload a menu image file (JPG, PNG, or WEBP)', 400);
    }

    // 1. Upload to Cloudinary for reference storage
    let uploadResult;
    try {
      uploadResult = await uploadToCloudinary(req.file.buffer, {
        folder: 'mess_menus',
        mimeType: req.file.mimetype,
      });
    } catch (uploadErr) {
      console.warn('[MessController] Cloudinary upload error:', uploadErr.message);
      uploadResult = {
        url: `data:${req.file.mimetype};base64,${req.file.buffer.toString('base64')}`,
      };
    }

    // 2. Perform OCR on image buffer
    const ocrResult = await extractMenuFromImage(req.file.buffer);

    // 3. Compute week of current Monday
    const today = new Date();
    const day = today.getDay();
    const diff = today.getDate() - day + (day === 0 ? -6 : 1);
    const monday = new Date(today.setDate(diff));
    monday.setHours(0, 0, 0, 0);

    return sendSuccess(res, {
      imageUrl: uploadResult.url,
      menu: ocrResult.menu, // 28 slots
      uncertainCount: ocrResult.uncertainCount,
      rawText: ocrResult.rawText,
      weekOf: monday.toISOString().split('T')[0],
      ocrSuccess: ocrResult.success,
      warning: ocrResult.success ? null : ocrResult.error,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/mess/publish-weekly-menu
 * Warden confirms and publishes the reviewed 28-slot weekly menu.
 * Role: WARDEN
 */
const publishWeeklyMenu = async (req, res, next) => {
  try {
    const { menu, weekOf, imageUrl } = req.body;

    if (!Array.isArray(menu) || menu.length !== 28) {
      return sendError(res, 'A complete weekly menu of exactly 28 meal entries (7 days × 4 meals) is required', 400);
    }

    // Server-side validation of every slot
    const coveredSlots = new Set();
    const validatedMenu = [];

    for (let i = 0; i < menu.length; i++) {
      const slot = menu[i];
      if (!slot || typeof slot !== 'object') {
        return sendError(res, `Invalid slot at index ${i}`, 400);
      }

      const day = typeof slot.dayOfWeek === 'string' ? slot.dayOfWeek.trim() : '';
      const meal = typeof slot.mealType === 'string' ? slot.mealType.trim().toUpperCase() : '';
      const items = typeof slot.items === 'string' ? slot.items.trim() : '';

      if (!VALID_DAYS.includes(day)) {
        return sendError(res, `Invalid day "${day}" at entry ${i + 1}. Allowed: ${VALID_DAYS.join(', ')}`, 400);
      }

      if (!VALID_MEAL_TYPES.includes(meal)) {
        return sendError(res, `Invalid meal type "${meal}" at entry ${i + 1}. Allowed: ${VALID_MEAL_TYPES.join(', ')}`, 400);
      }

      if (!items || items.length < 2) {
        return sendError(res, `Meal items cannot be empty for ${day} ${meal}`, 400);
      }

      if (items.length > 500) {
        return sendError(res, `Meal items text too long for ${day} ${meal} (max 500 characters)`, 400);
      }

      const key = `${day}:${meal}`;
      if (coveredSlots.has(key)) {
        return sendError(res, `Duplicate meal entry detected for ${day} ${meal}`, 400);
      }
      coveredSlots.add(key);

      validatedMenu.push({
        dayOfWeek: day,
        mealType: meal,
        items,
      });
    }

    // Verify all 7 days x 4 meals are present
    for (const d of VALID_DAYS) {
      for (const m of VALID_MEAL_TYPES) {
        if (!coveredSlots.has(`${d}:${m}`)) {
          return sendError(res, `Missing meal slot for ${d} ${m}`, 400);
        }
      }
    }

    // Determine weekOf Monday date
    let targetWeekDate;
    if (weekOf) {
      const parsedDate = new Date(weekOf);
      if (isNaN(parsedDate.getTime())) {
        return sendError(res, 'Invalid weekOf date format', 400);
      }
      const day = parsedDate.getDay();
      const diff = parsedDate.getDate() - day + (day === 0 ? -6 : 1);
      targetWeekDate = new Date(parsedDate.setDate(diff));
      targetWeekDate.setHours(0, 0, 0, 0);
    } else {
      const today = new Date();
      const day = today.getDay();
      const diff = today.getDate() - day + (day === 0 ? -6 : 1);
      targetWeekDate = new Date(today.setDate(diff));
      targetWeekDate.setHours(0, 0, 0, 0);
    }

    // Perform idempotent database upsert across all 28 slots
    let updatedCount = 0;
    let createdCount = 0;

    for (const slot of validatedMenu) {
      const existingRecords = await prisma.messMenu.findMany({
        where: {
          dayOfWeek: slot.dayOfWeek,
          mealType: slot.mealType,
        },
        orderBy: { weekOf: 'desc' },
      });

      if (existingRecords.length > 0) {
        const primary = existingRecords[0];
        await prisma.messMenu.update({
          where: { id: primary.id },
          data: {
            items: slot.items,
            weekOf: targetWeekDate,
          },
        });
        updatedCount++;

        // Clean up any extra duplicates, safely re-linking feedback to primary slot
        if (existingRecords.length > 1) {
          for (let k = 1; k < existingRecords.length; k++) {
            const dup = existingRecords[k];
            await prisma.menuFeedback.updateMany({
              where: { messMenuId: dup.id },
              data: { messMenuId: primary.id },
            });
            await prisma.messMenu.delete({
              where: { id: dup.id },
            });
          }
        }
      } else {
        await prisma.messMenu.create({
          data: {
            dayOfWeek: slot.dayOfWeek,
            mealType: slot.mealType,
            items: slot.items,
            weekOf: targetWeekDate,
          },
        });
        createdCount++;
      }
    }

    const totalSlots = await prisma.messMenu.count();

    return sendSuccess(res, {
      message: 'Weekly mess menu published successfully',
      updatedCount,
      createdCount,
      totalSlots,
      weekOf: targetWeekDate.toISOString(),
      imageUrl: imageUrl || null,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getMenu,
  createMenuItem,
  updateMenuItem,
  deleteMenuItem,
  submitFeedback,
  getFeedback,
  extractMenuFromPhoto,
  publishWeeklyMenu,
};
