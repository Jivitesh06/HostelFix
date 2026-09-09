const prisma = require('../config/prisma');
const {
  sendSuccess,
  sendCreated,
  sendError,
  sendForbidden,
  sendNotFound,
} = require('../utils/response');
const {
  COMPLAINT_CATEGORIES,
  COMPLAINT_STATUSES,
  isValidTransition,
} = require('../utils/complaintWorkflow');

/**
 * POST /api/complaints
 * Creates a new complaint for the authenticated student.
 * Role: STUDENT
 */
const createComplaint = async (req, res, next) => {
  try {
    const { category, description, imageUrl } = req.body;

    // Validate category
    if (!category || !COMPLAINT_CATEGORIES.includes(category)) {
      return sendError(
        res,
        `Invalid category. Allowed categories: ${COMPLAINT_CATEGORIES.join(', ')}`,
        400
      );
    }

    // Validate description
    if (!description || typeof description !== 'string' || !description.trim()) {
      return sendError(res, 'Complaint description is required', 400);
    }

    if (description.trim().length < 5) {
      return sendError(res, 'Description must be at least 5 characters long', 400);
    }

    // Atomic transaction: create complaint and initial StatusLog
    const result = await prisma.$transaction(async (tx) => {
      const complaint = await tx.complaint.create({
        data: {
          studentId: req.user.id,
          category,
          description: description.trim(),
          imageUrl: imageUrl && typeof imageUrl === 'string' ? imageUrl.trim() : null,
          status: 'PENDING',
        },
      });

      const statusLog = await tx.statusLog.create({
        data: {
          complaintId: complaint.id,
          oldStatus: null,
          newStatus: 'PENDING',
          changedById: req.user.id,
          note: 'Complaint submitted by student',
        },
      });

      return { complaint, statusLog };
    });

    return sendCreated(res, result.complaint);
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/complaints
 * Returns complaints filtered by role and optional status query.
 * Roles:
 *   - STUDENT: own complaints
 *   - STAFF: complaints assigned to them
 *   - WARDEN: all complaints
 */
const getComplaints = async (req, res, next) => {
  try {
    const { status, category } = req.query;

    const where = {};

    // Role-based scope enforcement
    if (req.user.role === 'STUDENT') {
      where.studentId = req.user.id;
    } else if (req.user.role === 'STAFF') {
      where.assignedStaffId = req.user.id;
    } else if (req.user.role === 'WARDEN') {
      // If warden has an assigned hostel, filter to complaints from students in that hostel
      if (req.user.hostelName) {
        where.student = {
          hostelName: req.user.hostelName,
        };
      }
    }

    // Optional status filter
    if (status) {
      if (!COMPLAINT_STATUSES.includes(status)) {
        return sendError(
          res,
          `Invalid status filter. Allowed values: ${COMPLAINT_STATUSES.join(', ')}`,
          400
        );
      }
      where.status = status;
    }

    // Optional category filter
    if (category) {
      if (!COMPLAINT_CATEGORIES.includes(category)) {
        return sendError(
          res,
          `Invalid category filter. Allowed values: ${COMPLAINT_CATEGORIES.join(', ')}`,
          400
        );
      }
      where.category = category;
    }

    const complaints = await prisma.complaint.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        student: {
          select: {
            id: true,
            name: true,
            email: true,
            roomNumber: true,
            hostelBlock: true,
            hostelName: true,
            gender: true,
            mobileNumber: true,
            universityRollNumber: true,
            branch: true,
            year: true,
          },
        },
        assignedStaff: {
          select: {
            id: true,
            name: true,
            email: true,
            staffCategory: true,
          },
        },
      },
    });

    return sendSuccess(res, complaints);
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/complaints/:id
 * Returns a single complaint with full details and audit timeline.
 * Role-checked:
 *   - STUDENT: only own complaint
 *   - STAFF: only assigned complaint
 *   - WARDEN: any complaint
 */
const getComplaintById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const complaint = await prisma.complaint.findUnique({
      where: { id },
      include: {
        student: {
          select: {
            id: true,
            name: true,
            email: true,
            roomNumber: true,
            hostelBlock: true,
            hostelName: true,
            gender: true,
            mobileNumber: true,
            universityRollNumber: true,
            branch: true,
            year: true,
          },
        },
        assignedStaff: {
          select: {
            id: true,
            name: true,
            email: true,
            staffCategory: true,
          },
        },
        statusLogs: {
          orderBy: { timestamp: 'asc' },
          include: {
            changedBy: {
              select: {
                id: true,
                name: true,
                role: true,
              },
            },
          },
        },
      },
    });

    if (!complaint) {
      return sendNotFound(res, 'Complaint not found');
    }

    // Authorization check
    if (req.user.role === 'STUDENT' && complaint.studentId !== req.user.id) {
      return sendForbidden(res, 'Access denied. You can only view your own complaints');
    }

    if (req.user.role === 'STAFF' && complaint.assignedStaffId !== req.user.id) {
      return sendForbidden(res, 'Access denied. You can only view complaints assigned to you');
    }

    if (req.user.role === 'WARDEN' && req.user.hostelName) {
      if (complaint.student?.hostelName && complaint.student.hostelName !== req.user.hostelName) {
        return sendForbidden(
          res,
          `Access denied. This complaint belongs to ${complaint.student.hostelName}. You are assigned to ${req.user.hostelName}.`
        );
      }
    }

    return sendSuccess(res, complaint);
  } catch (error) {
    next(error);
  }
};

/**
 * PATCH /api/complaints/:id/approve
 * Approves a PENDING complaint.
 * Role: WARDEN
 * Transition: PENDING -> APPROVED
 */
const approveComplaint = async (req, res, next) => {
  try {
    const { id } = req.params;

    const complaint = await prisma.complaint.findUnique({ where: { id } });
    if (!complaint) {
      return sendNotFound(res, 'Complaint not found');
    }

    // Validate transition
    if (!isValidTransition(complaint.status, 'APPROVED')) {
      return sendError(
        res,
        `Invalid status transition from ${complaint.status} to APPROVED. Only PENDING complaints can be approved.`,
        400
      );
    }

    // Atomic transaction
    const updated = await prisma.$transaction(async (tx) => {
      const updatedComplaint = await tx.complaint.update({
        where: { id },
        data: { status: 'APPROVED' },
      });

      await tx.statusLog.create({
        data: {
          complaintId: id,
          oldStatus: complaint.status,
          newStatus: 'APPROVED',
          changedById: req.user.id,
          note: 'Complaint approved by warden',
        },
      });

      return updatedComplaint;
    });

    return sendSuccess(res, updated);
  } catch (error) {
    next(error);
  }
};

/**
 * PATCH /api/complaints/:id/reject
 * Rejects a PENDING complaint with a mandatory reason.
 * Role: WARDEN
 * Transition: PENDING -> REJECTED
 */
const rejectComplaint = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { rejectionReason } = req.body;

    if (!rejectionReason || typeof rejectionReason !== 'string' || !rejectionReason.trim()) {
      return sendError(res, 'A rejection reason is required', 400);
    }

    const complaint = await prisma.complaint.findUnique({ where: { id } });
    if (!complaint) {
      return sendNotFound(res, 'Complaint not found');
    }

    // Validate transition
    if (!isValidTransition(complaint.status, 'REJECTED')) {
      return sendError(
        res,
        `Invalid status transition from ${complaint.status} to REJECTED. Only PENDING complaints can be rejected.`,
        400
      );
    }

    const reason = rejectionReason.trim();

    // Atomic transaction
    const updated = await prisma.$transaction(async (tx) => {
      const updatedComplaint = await tx.complaint.update({
        where: { id },
        data: {
          status: 'REJECTED',
          rejectionReason: reason,
        },
      });

      await tx.statusLog.create({
        data: {
          complaintId: id,
          oldStatus: complaint.status,
          newStatus: 'REJECTED',
          changedById: req.user.id,
          note: reason,
        },
      });

      return updatedComplaint;
    });

    return sendSuccess(res, updated);
  } catch (error) {
    next(error);
  }
};

/**
 * PATCH /api/complaints/:id/assign
 * Assigns an APPROVED complaint to a staff member.
 * Role: WARDEN
 * Transition: APPROVED -> ASSIGNED
 */
const assignComplaint = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { staffId } = req.body;

    if (!staffId || typeof staffId !== 'string') {
      return sendError(res, 'Staff ID is required', 400);
    }

    // Verify staff user exists and has role STAFF
    const staff = await prisma.user.findUnique({
      where: { id: staffId },
    });

    if (!staff || staff.role !== 'STAFF') {
      return sendError(
        res,
        'Invalid staff member. Selected user must be an existing staff member',
        400
      );
    }

    const complaint = await prisma.complaint.findUnique({ where: { id } });
    if (!complaint) {
      return sendNotFound(res, 'Complaint not found');
    }

    // Validate transition
    if (!isValidTransition(complaint.status, 'ASSIGNED')) {
      return sendError(
        res,
        `Invalid status transition from ${complaint.status} to ASSIGNED. Only APPROVED complaints can be assigned to staff.`,
        400
      );
    }

    // Atomic transaction
    const updated = await prisma.$transaction(async (tx) => {
      const updatedComplaint = await tx.complaint.update({
        where: { id },
        data: {
          status: 'ASSIGNED',
          assignedStaffId: staff.id,
        },
      });

      await tx.statusLog.create({
        data: {
          complaintId: id,
          oldStatus: complaint.status,
          newStatus: 'ASSIGNED',
          changedById: req.user.id,
          note: `Assigned to staff member: ${staff.name} (${staff.staffCategory || 'General'})`,
        },
      });

      return updatedComplaint;
    });

    return sendSuccess(res, updated);
  } catch (error) {
    next(error);
  }
};

/**
 * PATCH /api/complaints/:id/status
 * Updates an assigned complaint status to IN_PROGRESS or RESOLVED.
 * Role: STAFF (must be the assigned staff member)
 * Valid transitions:
 *   ASSIGNED -> IN_PROGRESS
 *   IN_PROGRESS -> RESOLVED
 */
const updateComplaintStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!status || !['IN_PROGRESS', 'RESOLVED'].includes(status)) {
      return sendError(
        res,
        'Staff can only update complaint status to IN_PROGRESS or RESOLVED',
        400
      );
    }

    const complaint = await prisma.complaint.findUnique({ where: { id } });
    if (!complaint) {
      return sendNotFound(res, 'Complaint not found');
    }

    // Ownership check: must be assigned to the authenticated staff
    if (complaint.assignedStaffId !== req.user.id) {
      return sendForbidden(res, 'This complaint is not assigned to you');
    }

    // Validate transition
    if (!isValidTransition(complaint.status, status)) {
      return sendError(
        res,
        `Invalid status transition from ${complaint.status} to ${status}.`,
        400
      );
    }

    // Atomic transaction
    const updated = await prisma.$transaction(async (tx) => {
      const updatedComplaint = await tx.complaint.update({
        where: { id },
        data: { status },
      });

      await tx.statusLog.create({
        data: {
          complaintId: id,
          oldStatus: complaint.status,
          newStatus: status,
          changedById: req.user.id,
          note: `Status updated to ${status} by staff member: ${req.user.name}`,
        },
      });

      return updatedComplaint;
    });

    return sendSuccess(res, updated);
  } catch (error) {
    next(error);
  }
};

/**
 * PATCH /api/complaints/:id/close
 * Closes a RESOLVED complaint after verification.
 * Role: WARDEN
 * Transition: RESOLVED -> CLOSED
 */
const closeComplaint = async (req, res, next) => {
  try {
    const { id } = req.params;

    const complaint = await prisma.complaint.findUnique({ where: { id } });
    if (!complaint) {
      return sendNotFound(res, 'Complaint not found');
    }

    // Validate transition
    if (!isValidTransition(complaint.status, 'CLOSED')) {
      return sendError(
        res,
        `Invalid status transition from ${complaint.status} to CLOSED. Only RESOLVED complaints can be closed.`,
        400
      );
    }

    // Atomic transaction
    const updated = await prisma.$transaction(async (tx) => {
      const updatedComplaint = await tx.complaint.update({
        where: { id },
        data: { status: 'CLOSED' },
      });

      await tx.statusLog.create({
        data: {
          complaintId: id,
          oldStatus: complaint.status,
          newStatus: 'CLOSED',
          changedById: req.user.id,
          note: 'Complaint verified and closed by warden',
        },
      });

      return updatedComplaint;
    });

    return sendSuccess(res, updated);
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/complaints/staff-list
 * Returns available staff members for warden assignment dropdown.
 * Role: WARDEN
 */
const getStaffList = async (req, res, next) => {
  try {
    const staffMembers = await prisma.user.findMany({
      where: { role: 'STAFF' },
      select: {
        id: true,
        name: true,
        email: true,
        staffCategory: true,
      },
      orderBy: { name: 'asc' },
    });

    return sendSuccess(res, staffMembers);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createComplaint,
  getComplaints,
  getComplaintById,
  approveComplaint,
  rejectComplaint,
  assignComplaint,
  updateComplaintStatus,
  closeComplaint,
  getStaffList,
};
