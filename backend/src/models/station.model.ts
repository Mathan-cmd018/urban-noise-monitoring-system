import mongoose, { Document, Schema } from 'mongoose';
import { AreaType } from '../types';

export interface IMonitoringStation extends Document {
  stationId: string;
  name: string;
  location: string;
  latitude: number;
  longitude: number;
  areaType: AreaType;
  status: 'Active' | 'Maintenance' | 'Offline';
  currentNoiseLevel: number;
  lastUpdated: Date;
  createdAt: Date;
  updatedAt: Date;
}

const MonitoringStationSchema = new Schema<IMonitoringStation>(
  {
    stationId: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      uppercase: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    location: {
      type: String,
      required: true,
      trim: true,
    },
    latitude: {
      type: Number,
      required: true,
    },
    longitude: {
      type: Number,
      required: true,
    },
    areaType: {
      type: String,
      required: true,
      enum: ['Residential', 'Commercial', 'Industrial', 'Silent Zone', 'Mixed Zone'],
      default: 'Residential',
    },
    status: {
      type: String,
      enum: ['Active', 'Maintenance', 'Offline'],
      default: 'Active',
    },
    currentNoiseLevel: {
      type: Number,
      default: 45.0,
      min: 20,
      max: 140,
    },
    lastUpdated: {
      type: Date,
      default: Date.now,
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

MonitoringStationSchema.index({ areaType: 1 });
MonitoringStationSchema.index({ latitude: 1, longitude: 1 });

export const MonitoringStation = mongoose.model<IMonitoringStation>(
  'MonitoringStation',
  MonitoringStationSchema
);
