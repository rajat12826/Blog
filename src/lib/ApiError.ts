// utils/ApiError.ts
export class ApiError extends Error {
    statusCode: number;
    constructor(statusCode: number, message: string) {
      super(message);
      this.statusCode = statusCode;
  
      // Maintains proper stack trace for where error was thrown (only on V8 engines)
      if (Error.captureStackTrace) {
        Error.captureStackTrace(this, this.constructor);
      }
  
      this.name = this.constructor.name;
    }
  }
  