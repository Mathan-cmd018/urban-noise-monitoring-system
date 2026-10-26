import mongoose from 'mongoose';
import { Complaint, IComplaint } from '../models/complaint.model';
import { ComplaintHistory } from '../models/complaintHistory.model';
import { ApiError } from '../utils/apiError';
import { ComplaintStatus, UserRole } from '../types';
import { RedisService } from './redis.service';

export class ComplaintService {
  /**
   * Create a new citizen complaint & generate initial history timeline entry
   */
  static async createComplaint(
    userId: string,
    data: {
      category: any;
      description: string;
      location: string;
      latitude?: number;
      longitude?: number;
      reportedNoiseLevel?: number;
      evidence?: string;
      priority?: any;
    }
  ) {
    // Generate unique complaint ID: CMP-YYYYMMDD-XXXX
    const count = await Complaint.countDocuments();
    const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    const complaintId = `CMP-${dateStr}-${String(count + 1).padStart(4, '0')}`;

    const complaint = await Complaint.create({
      complaintId,
      userId: new mongoose.Types.ObjectId(userId),
      ...data,
      status: 'Submitted',
    });

    // Create initial timeline record
    await ComplaintHistory.create({
      complaintId,
      status: 'Submitted',
      notes: 'Complaint submitted by citizen and logged in municipal tracking queue.',
      updatedBy: new mongoose.Types.ObjectId(userId),
      timestamp: new Date(),
    });

    // Invalidate dashboard and analytics cache
    await RedisService.del('dashboard:overview');
    await RedisService.del('hotspots:current');

    return complaint;
  }

  /**
   * Retrieve complaints with role filtering
   */
  static async getComplaints(
    user: { userId: string; role: UserRole },
    filter: {
      status?: string;
      category?: string;
      priority?: string;
      search?: string;
    } = {}
  ) {
    const query: any = {};

    // Citizens can only view their own complaints
    if (user.role === 'Citizen') {
      query.userId = new mongoose.Types.ObjectId(user.userId);
    }

    if (filter.status) query.status = filter.status;
    if (filter.category) query.category = filter.category;
    if (filter.priority) query.priority = filter.priority;
    if (filter.search) {
      query.$or = [
        { complaintId: { $regex: filter.search, $options: 'i' } },
        { location: { $regex: filter.search, $options: 'i' } },
        { description: { $regex: filter.search, $options: 'i' } },
      ];
    }

    return Complaint.find(query)
      .populate('userId', 'name email phone')
      .populate('assignedTo', 'name email')
      .sort({ createdAt: -1 });
  }

  /**
   * Get single complaint with full timeline history
   */
  static async getComplaintById(id: string, user: { userId: string; role: UserRole }) {
    const complaint = await Complaint.findOne({
      $or: [{ _id: id.match(/^[0-9a-fA-F]{24}$/) ? id : null }, { complaintId: id }],
    })
      .populate('userId', 'name email phone')
      .populate('assignedTo', 'name email');

    if (!complaint) {
      throw new ApiError(404, 'Complaint not found');
    }

    // Role check: Citizen cannot view other citizens' complaints
    if (user.role === 'Citizen' && complaint.userId._id.toString() !== user.userId) {
      throw new ApiError(403, 'Forbidden: You can only view your own complaints');
    }

    // Fetch audit timeline
    const history = await ComplaintHistory.find({ complaintId: complaint.complaintId })
      .populate('updatedBy', 'name role')
      .sort({ timestamp: 1 });

    return {
      complaint,
      history,
    };
  }

  /**
   * Update complaint status, assign officer, and append timeline event
   */
  static async updateComplaintStatus(
    id: string,
    updaterUserId: string,
    updateData: {
      status: ComplaintStatus;
      notes: string;
      assignedTo?: string;
      resolutionNotes?: string;
    }
  ) {
    const complaint = await Complaint.findOne({
      $or: [{ _id: id.match(/^[0-9a-fA-F]{24}$/) ? id : null }, { complaintId: id }],
    });

    if (!complaint) {
      throw new ApiError(404, 'Complaint not found');
    }

    complaint.status = updateData.status;
    if (updateData.assignedTo) {
      complaint.assignedTo = new mongoose.Types.ObjectId(updateData.assignedTo);
    }
    if (updateData.resolutionNotes) {
      complaint.resolutionNotes = updateData.resolutionNotes;
    }

    await complaint.save();

    // Log history
    const historyEntry = await ComplaintHistory.create({
      complaintId: complaint.complaintId,
      status: updateData.status,
      notes: updateData.notes,
      updatedBy: new mongoose.Types.ObjectId(updaterUserId),
      timestamp: new Date(),
    });

    await RedisService.del('dashboard:overview');

    return {
      complaint,
      historyEntry,
    };
  }

  /**
   * Update complaint general fields
   */
  static async updateComplaint(id: string, updateData: Partial<IComplaint>) {
    const complaint = await Complaint.findOneAndUpdate(
      { $or: [{ _id: id.match(/^[0-9a-fA-F]{24}$/) ? id : null }, { complaintId: id }] },
      updateData,
      { new: true }
    );
    if (!complaint) throw new ApiError(404, 'Complaint not found');
    return complaint;
  }
}
