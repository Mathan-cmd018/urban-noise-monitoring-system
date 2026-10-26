import mongoose, { Document, Schema } from 'mongoose';
import { AreaType } from '../types';

export interface IRegulation extends Document {
  areaType: AreaType;
  dayLimit: number; // in dB (e.g. 55)
  nightLimit: number; // in dB (e.g. 45)
  effectiveFrom: Date;
  updatedBy?: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const RegulationSchema = new Schema<IRegulation>(
  {
    areaType: {
      type: String,
      required: true,
      unique: true,
      enum: ['Residential', 'Commercial', 'Industrial', 'Silent Zone', 'Mixed Zone'],
    },
    dayLimit: {
      type: Number,
      required: true,
      min: 30,
      max: 120,
    },
    nightLimit: {
      type: Number,
      required: true,
      min: 30,
      max: 120,
    },
    effectiveFrom: {
      type: Date,
      default: Date.now,
    },
    updatedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
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

export const Regulation = mongoose.model<IRegulation>('Regulation', RegulationSchema);
