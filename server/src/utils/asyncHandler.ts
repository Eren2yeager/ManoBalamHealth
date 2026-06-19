import { Request, Response, NextFunction } from "express";

// Express 5 natively catches async errors, but this wrapper is kept for
// backwards compatibility and to make async intent explicit in route files.
type AsyncRequestHandler = (req: Request, res: Response, next: NextFunction) => Promise<unknown>;

export const asyncHandler =
  (fn: AsyncRequestHandler) =>
  (req: Request, res: Response, next: NextFunction): void => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
