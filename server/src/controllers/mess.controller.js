const prisma = require('../config/prisma');
const {
  sendSuccess,
  sendCreated,
  sendError,
  sendNotFound,
} = require('../utils/response');

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
            hostelBlock: true,
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

module.exports = {
  getMenu,
  createMenuItem,
  updateMenuItem,
  deleteMenuItem,
  submitFeedback,
  getFeedback,
};
