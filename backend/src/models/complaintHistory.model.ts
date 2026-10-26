import mongoose, { Document, Schema } from 'mongoose';
import { ComplaintStatus } from '../types';

export interface IComplaintHistory extends Document {
  complaintId: string;
  status: ComplaintStatus;
  notes: string;
  updatedBy: mongoose.Types.ObjectId;
  timestamp: Date;
}

const ComplaintHistorySchema = new Schema<IComplaintHistory>(
  {
    complaintId: {
      type: String,
      required: true,
      ref: 'Complaint',
      index: true,
    },
    status: {
      type: String,
      required: true,
      enum: ['Submitted', 'Under Review', 'Assigned', 'In Progress', 'Resolved', 'Rejected'],
    },
    notes: {
      type: String,
      required: true,
      maxlength: 1000,
    },
    updatedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    timestamp: {
      type: Date,
      default: Date.now,
      index: true,
    },
  },
  {
    timestamps: false,
    toJSON: {
      transform(_doc, ret: any) {
        ret.id = ret._id;
        delete ret._id;
        delete ret.__v;
        return ret;
      },
    },
  }
);

ComplaintHistorySchema.index({ complaintId: 1, timestamp: 1 });

export const ComplaintHistory = mongoose.model<IComplaintHistory>(
  'ComplaintHistory',
  ComplaintHistorySchema
);
