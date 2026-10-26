import mongoose, { Document, Schema } from 'mongoose';
import { AreaType } from '../types';

export interface INoiseReading extends Document {
  stationId: string;
  noiseLevel: number;
  timestamp: Date;
  areaType: AreaType;
}

const NoiseReadingSchema = new Schema<INoiseReading>(
  {
    stationId: {
      type: String,
      required: true,
      ref: 'MonitoringStation',
      index: true,
    },
    noiseLevel: {
      type: Number,
      required: true,
      min: 20,
      max: 150,
    },
    timestamp: {
      type: Date,
      default: Date.now,
      index: true,
    },
    areaType: {
      type: String,
      required: true,
      enum: ['Residential', 'Commercial', 'Industrial', 'Silent Zone', 'Mixed Zone'],
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

// Compound indexes for time-series analytics and station queries
NoiseReadingSchema.index({ stationId: 1, timestamp: -1 });
NoiseReadingSchema.index({ areaType: 1, timestamp: -1 });

export const NoiseReading = mongoose.model<INoiseReading>(
  'NoiseReading',
  NoiseReadingSchema
);
