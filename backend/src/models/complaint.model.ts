import mongoose, { Document, Schema } from 'mongoose';
import { ComplaintCategory, ComplaintPriority, ComplaintStatus } from '../types';

export interface IComplaint extends Document {
  complaintId: string;
  userId: mongoose.Types.ObjectId;
  category: ComplaintCategory;
  description: string;
  location: string;
  latitude?: number;
  longitude?: number;
  reportedNoiseLevel?: number;
  evidence?: string;
  priority: ComplaintPriority;
  status: ComplaintStatus;
  assignedTo?: mongoose.Types.ObjectId;
  resolutionNotes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const ComplaintSchema = new Schema<IComplaint>(
  {
    complaintId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    category: {
      type: String,
      required: true,
      enum: [
        'Loud Music',
        'Construction Noise',
        'Traffic Noise',
        'Industrial Noise',
        'Event Noise',
        'Vehicle Horn',
        'Other',
      ],
    },
    description: {
      type: String,
      required: true,
      maxlength: 1500,
    },
    location: {
      type: String,
      required: true,
    },
    latitude: {
      type: Number,
    },
    longitude: {
      type: Number,
    },
    reportedNoiseLevel: {
      type: Number,
      min: 20,
      max: 150,
    },
    evidence: {
      type: String,
    },
    priority: {
      type: String,
      enum: ['Low', 'Medium', 'High', 'Critical'],
      default: 'Medium',
    },
    status: {
      type: String,
      enum: ['Submitted', 'Under Review', 'Assigned', 'In Progress', 'Resolved', 'Rejected'],
      default: 'Submitted',
      index: true,
    },
    assignedTo: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
    resolutionNotes: {
      type: String,
      maxlength: 1000,
    },
  },
  {
    timestamps: true,
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

ComplaintSchema.index({ status: 1, createdAt: -1 });
ComplaintSchema.index({ userId: 1, createdAt: -1 });

export const Complaint = mongoose.model<IComplaint>('Complaint', ComplaintSchema);
