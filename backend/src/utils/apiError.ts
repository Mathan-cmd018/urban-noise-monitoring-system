export class ApiError extends Error {
  public statusCode: number;
  public isOperational: boolean;
  public details?: any;

  constructor(statusCode: number, message: string, details?: any, isOperational = true) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    this.details = details;
    Error.captureStackTrace(this, this.constructor);
  }
}
