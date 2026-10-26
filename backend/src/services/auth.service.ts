import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { User, IUser } from '../models/user.model';
import { config } from '../config/env';
import { ApiError } from '../utils/apiError';
import { AuthUserPayload, UserRole } from '../types';

export class AuthService {
  static async register(userData: {
    name: string;
    email: string;
    password: string;
    phone?: string;
    role?: UserRole;
  }) {
    const existing = await User.findOne({ email: userData.email.toLowerCase() });
    if (existing) {
      throw new ApiError(409, 'User with this email already exists');
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(userData.password, salt);

    const user = await User.create({
      name: userData.name,
      email: userData.email.toLowerCase(),
      phone: userData.phone,
      passwordHash,
      role: userData.role || 'Citizen',
    });

    const token = this.generateToken(user);

    return {
      user: {
        id: user._id.toString(),
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        createdAt: user.createdAt,
      },
      token,
    };
  }

  static async login(credentials: { email: string; password: string }) {
    const user = await User.findOne({ email: credentials.email.toLowerCase() }).select(
      '+passwordHash'
    );
    if (!user) {
      throw new ApiError(401, 'Invalid email or password');
    }

    const isMatch = await bcrypt.compare(credentials.password, user.passwordHash);
    if (!isMatch) {
      throw new ApiError(401, 'Invalid email or password');
    }

    const token = this.generateToken(user);

    return {
      user: {
        id: user._id.toString(),
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        createdAt: user.createdAt,
      },
      token,
    };
  }

  static async getCurrentUser(userId: string) {
    const user = await User.findById(userId);
    if (!user) {
      throw new ApiError(404, 'User not found');
    }
    return user;
  }

  static generateToken(user: IUser): string {
    const payload: AuthUserPayload = {
      userId: user._id.toString(),
      email: user.email,
      role: user.role,
      name: user.name,
    };

    return jwt.sign(payload, config.jwtSecret, {
      expiresIn: config.jwtExpiresIn as any,
    });
  }
}
