import { NextFunction, Request, Response } from "express";
import { JWT_SECRET } from '@repo/backend-common';
import jwt from "jsonwebtoken";

export function middleware(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers["authorization"] ?? "";
  
  // strip "Bearer " prefix
  const token = authHeader.startsWith("Bearer ")
    ? authHeader.slice(7)
    : authHeader;

  if (!token) {
    res.status(403).json({ message: "Unauthorized - no token" });
    return;
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    if (decoded) {
      //@ts-ignore
      req.userId = (decoded as any).userId;
      next();
    }
  } catch (e) {
    res.status(403).json({ message: "Unauthorized - invalid token" });
  }
}