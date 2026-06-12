import { Request, Response, NextFunction } from "express";

/**
 * Express error handler middleware to intercept unhandled exceptions and format them nicely
 */
export function errorHandler(
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
): void {
  console.error("🔥 App Server Error:", err);

  const statusCode = err.status || err.statusCode || 500;
  const message = err.message || "An unexpected server error occurred.";

  res.status(statusCode).json({
    message,
    stack: process.env.NODE_ENV === "production" ? null : err.stack,
  });
}
