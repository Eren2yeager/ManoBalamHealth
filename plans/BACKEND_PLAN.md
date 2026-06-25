# ManoBalamHealthCare — Backend Plan (Server)

Stack: Node.js + Express + TypeScript + MongoDB (Mongoose) + Socket.io + WebRTC (signaling only) + Cloudinary + Razorpay + Resend + BullMQ + Redis + Zod + JWT + bcrypt

Module system: CommonJS (compiled from TypeScript)
Dev runner: `ts-node-dev`

This document is written so an AI coding agent can implement it with minimal guessing. Every endpoint has an exact request/response contract. Every shared file has its actual expected content, not just a filename. Where a decision is genuinely open, it is marked `DECISION NEEDED` instead of left implicit — the agent must stop and ask, not assume.

---

## 0. Project Initialization (do this before anything else)

### 0.1 Commands
```bash
mkdir server && cd server
npm init -y
npm install express mongoose socket.io cors cookie-parser dotenv zod bcrypt jsonwebtoken cloudinary multer razorpay resend bullmq ioredis luxon winston express-rate-limit helmet compression
npm install -D typescript ts-node-dev @types/express @types/node @types/cors @types/cookie-parser @types/bcrypt @types/jsonwebtoken @types/multer tsconfig-paths
npx tsc --init
```

### 0.2 `tsconfig.json` (exact content — replace generated default)
```json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "commonjs",
    "moduleResolution": "node",
    "lib": ["ES2020"],
    "outDir": "./dist",
    "rootDir": "./src",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true,
    "declaration": false,
    "sourceMap": true,
    "baseUrl": "./src",
    "paths": {
      "@/*": ["*"]
    },
    "typeRoots": ["./node_modules/@types", "./src/types"]
  },
  "include": ["src/**/*.ts"],
  "exclude": ["node_modules", "dist"]
}
```

### 0.3 `package.json` scripts (exact content)
```json
{
  "scripts": {
    "dev": "ts-node-dev --respawn --transpile-only -r tsconfig-paths/register src/server.ts",
    "build": "tsc",
    "start": "node -r tsconfig-paths/register dist/server.js",
    "lint": "eslint src --ext .ts",
    "test": "jest"
  }
}
```

### 0.4 `.gitignore`
```
node_modules
dist
.env
*.log
```

---

## 1. Folder Structure

```
server/
├── src/
│   ├── config/
│   │   ├── env.ts
│   │   ├── db.ts
│   │   ├── redis.ts
│   │   ├── cloudinary.ts
│   │   └── razorpay.ts
│   │
│   ├── constants/
│   │   ├── roles.constant.ts
│   │   ├── statusCodes.constant.ts
│   │   └── errorCodes.constant.ts
│   │
│   ├── modules/
│   │   ├── auth/
│   │   │   ├── auth.routes.ts
│   │   │   ├── auth.controller.ts
│   │   │   ├── auth.service.ts
│   │   │   ├── auth.validation.ts
│   │   │   └── auth.types.ts
│   │   ├── user/
│   │   │   ├── user.model.ts
│   │   │   ├── user.routes.ts
│   │   │   ├── user.controller.ts
│   │   │   ├── user.service.ts
│   │   │   ├── user.validation.ts
│   │   │   └── user.types.ts
│   │   ├── psychologist/
│   │   │   ├── psychologist.model.ts
│   │   │   ├── psychologist.routes.ts
│   │   │   ├── psychologist.controller.ts
│   │   │   ├── psychologist.service.ts
│   │   │   ├── psychologist.validation.ts
│   │   │   └── psychologist.types.ts
│   │   ├── availability/
│   │   │   ├── availabilityRule.model.ts
│   │   │   ├── availabilitySlot.model.ts
│   │   │   ├── availability.routes.ts
│   │   │   ├── availability.controller.ts
│   │   │   ├── availability.service.ts
│   │   │   ├── availability.validation.ts
│   │   │   └── availability.types.ts
│   │   ├── appointment/
│   │   │   ├── appointment.model.ts
│   │   │   ├── appointment.routes.ts
│   │   │   ├── appointment.controller.ts
│   │   │   ├── appointment.service.ts
│   │   │   ├── appointment.validation.ts
│   │   │   └── appointment.types.ts
│   │   ├── payment/
│   │   │   ├── payment.model.ts
│   │   │   ├── payment.routes.ts
│   │   │   ├── payment.controller.ts
│   │   │   ├── payment.service.ts
│   │   │   ├── payment.validation.ts
│   │   │   ├── providers/
│   │   │   │   ├── paymentProvider.interface.ts
│   │   │   │   └── razorpay.provider.ts
│   │   │   └── payment.types.ts
│   │   ├── session/
│   │   │   ├── session.model.ts
│   │   │   ├── session.routes.ts
│   │   │   ├── session.controller.ts
│   │   │   ├── session.service.ts
│   │   │   ├── session.validation.ts
│   │   │   └── session.types.ts
│   │   ├── chat/
│   │   │   ├── message.model.ts
│   │   │   ├── chat.routes.ts
│   │   │   ├── chat.controller.ts
│   │   │   ├── chat.service.ts
│   │   │   ├── chat.validation.ts
│   │   │   └── chat.types.ts
│   │   ├── feedback/
│   │   │   ├── feedback.model.ts
│   │   │   ├── feedback.routes.ts
│   │   │   ├── feedback.controller.ts
│   │   │   ├── feedback.service.ts
│   │   │   ├── feedback.validation.ts
│   │   │   └── feedback.types.ts
│   │   ├── assessment/
│   │   │   ├── assessmentTemplate.model.ts
│   │   │   ├── assessmentResult.model.ts
│   │   │   ├── assessment.routes.ts
│   │   │   ├── assessment.controller.ts
│   │   │   ├── assessment.service.ts
│   │   │   ├── assessment.validation.ts
│   │   │   └── assessment.types.ts
│   │   ├── crisis/
│   │   │   ├── crisisResource.model.ts
│   │   │   ├── crisis.routes.ts
│   │   │   ├── crisis.controller.ts
│   │   │   ├── crisis.service.ts
│   │   │   ├── crisis.validation.ts
│   │   │   └── crisis.types.ts
│   │   ├── notification/
│   │   │   ├── notification.model.ts
│   │   │   ├── notification.service.ts
│   │   │   ├── notification.types.ts
│   │   │   └── channels/
│   │   │       ├── email.channel.ts
│   │   │       └── push.channel.ts
│   │   └── admin/
│   │       ├── admin.routes.ts
│   │       ├── admin.controller.ts
│   │       ├── admin.service.ts
│   │       ├── admin.validation.ts
│   │       └── admin.types.ts
│   │
│   ├── sockets/
│   │   ├── index.ts
│   │   ├── middleware/
│   │   │   └── socketAuth.middleware.ts
│   │   ├── handlers/
│   │   │   ├── chat.handler.ts
│   │   │   ├── presence.handler.ts
│   │   │   ├── emergency.handler.ts
│   │   │   └── webrtcSignaling.handler.ts
│   │   └── events.ts
│   │
│   ├── jobs/
│   │   ├── queues/
│   │   │   ├── reminder.queue.ts
│   │   │   ├── notification.queue.ts
│   │   │   └── slotGeneration.queue.ts
│   │   └── workers/
│   │       ├── reminder.worker.ts
│   │       ├── notification.worker.ts
│   │       └── slotGeneration.worker.ts
│   │
│   ├── middlewares/
│   │   ├── auth.middleware.ts
│   │   ├── error.middleware.ts
│   │   ├── notFound.middleware.ts
│   │   ├── rateLimit.middleware.ts
│   │   ├── validate.middleware.ts
│   │   └── upload.middleware.ts
│   │
│   ├── utils/
│   │   ├── ApiError.ts
│   │   ├── ApiResponse.ts
│   │   ├── asyncHandler.ts
│   │   ├── logger.ts
│   │   ├── timezone.ts
│   │   ├── generateSlots.ts
│   │   └── otp.ts
│   │
│   ├── types/
│   │   └── express.d.ts
│   │
│   ├── routes/
│   │   └── index.ts
│   │
│   ├── app.ts
│   └── server.ts
│
├── postman/
│   └── ManoBalam.postman_collection.json
│
├── .env
├── .env.example
├── tsconfig.json
├── package.json
└── .gitignore
```

---

## 2. Core Shared Files — Exact Content

These are written in full because every other module depends on them. The agent should create these verbatim (adjusting only if a genuinely better pattern is requested), not reinvent their shape per-module.

### 2.1 `src/constants/statusCodes.constant.ts`
```ts
export const StatusCodes = {
  OK: 200,
  CREATED: 201,
  NO_CONTENT: 204,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  UNPROCESSABLE_ENTITY: 422,
  TOO_MANY_REQUESTS: 429,
  INTERNAL_SERVER_ERROR: 500,
} as const;
```

### 2.2 `src/constants/errorCodes.constant.ts`
```ts
// Machine-readable error codes returned in ApiError.code — frontend can switch on these
// instead of parsing human-readable messages.
export const ErrorCodes = {
  VALIDATION_ERROR: "VALIDATION_ERROR",
  UNAUTHORIZED: "UNAUTHORIZED",
  INVALID_CREDENTIALS: "INVALID_CREDENTIALS",
  TOKEN_EXPIRED: "TOKEN_EXPIRED",
  TOKEN_INVALID: "TOKEN_INVALID",
  FORBIDDEN_ROLE: "FORBIDDEN_ROLE",
  NOT_FOUND: "NOT_FOUND",
  DUPLICATE_EMAIL: "DUPLICATE_EMAIL",
  DUPLICATE_PHONE: "DUPLICATE_PHONE",
  OTP_INVALID: "OTP_INVALID",
  OTP_EXPIRED: "OTP_EXPIRED",
  SLOT_ALREADY_BOOKED: "SLOT_ALREADY_BOOKED",
  PAYMENT_FAILED: "PAYMENT_FAILED",
  PAYMENT_SIGNATURE_INVALID: "PAYMENT_SIGNATURE_INVALID",
  PSYCHOLOGIST_NOT_VERIFIED: "PSYCHOLOGIST_NOT_VERIFIED",
  NO_PSYCHOLOGIST_AVAILABLE: "NO_PSYCHOLOGIST_AVAILABLE",
  EMERGENCY_REQUEST_TIMEOUT: "EMERGENCY_REQUEST_TIMEOUT",
  RATE_LIMITED: "RATE_LIMITED",
  INTERNAL_ERROR: "INTERNAL_ERROR",
} as const;

export type ErrorCode = (typeof ErrorCodes)[keyof typeof ErrorCodes];
```

### 2.3 `src/constants/roles.constant.ts`
```ts
export const Roles = {
  PATIENT: "patient",
  PSYCHOLOGIST: "psychologist",
  ADMIN: "admin",
} as const;

export type Role = (typeof Roles)[keyof typeof Roles];
```

### 2.4 `src/utils/ApiError.ts`
```ts
import { ErrorCode } from "@/constants/errorCodes.constant";

export class ApiError extends Error {
  public readonly statusCode: number;
  public readonly code: ErrorCode;
  public readonly details?: unknown;

  constructor(statusCode: number, code: ErrorCode, message: string, details?: unknown) {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
    this.details = details;
    Object.setPrototypeOf(this, ApiError.prototype);
  }
}
```

### 2.5 `src/utils/ApiResponse.ts`
This defines the **single response envelope every endpoint must use.** No endpoint returns a bare object or array — always wrapped like this, so the frontend's Axios layer can rely on one shape everywhere.

```ts
export interface ApiSuccessResponse<T> {
  success: true;
  message: string;
  data: T;
  meta?: {
    page?: number;
    limit?: number;
    total?: number;
    totalPages?: number;
  };
}

export interface ApiErrorResponse {
  success: false;
  message: string;
  code: string;
  details?: unknown;
}

export class ApiResponse {
  static success<T>(
    data: T,
    message = "Success",
    meta?: ApiSuccessResponse<T>["meta"]
  ): ApiSuccessResponse<T> {
    return { success: true, message, data, ...(meta && { meta }) };
  }
}
```
**Every list endpoint** (psychologist list, appointments list, admin reports list) returns `meta.page/limit/total/totalPages`. Query params for these endpoints are always `?page=1&limit=20` (defaults: page=1, limit=20, max limit=100).

### 2.6 `src/utils/asyncHandler.ts`
```ts
import { Request, Response, NextFunction, RequestHandler } from "express";

export const asyncHandler = (fn: RequestHandler): RequestHandler =>
  (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
```

### 2.7 `src/middlewares/error.middleware.ts`
```ts
import { Request, Response, NextFunction } from "express";
import { ApiError } from "@/utils/ApiError";
import { StatusCodes } from "@/constants/statusCodes.constant";
import { ErrorCodes } from "@/constants/errorCodes.constant";
import { logger } from "@/utils/logger";

export const errorMiddleware = (
  err: unknown,
  req: Request,
  res: Response,
  _next: NextFunction
) => {
  if (err instanceof ApiError) {
    return res.status(err.statusCode).json({
      success: false,
      message: err.message,
      code: err.code,
      ...(err.details ? { details: err.details } : {}),
    });
  }

  logger.error("Unhandled error", { error: err });
  return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
    success: false,
    message: "Something went wrong",
    code: ErrorCodes.INTERNAL_ERROR,
  });
};
```

### 2.8 `src/middlewares/validate.middleware.ts`
```ts
import { Request, Response, NextFunction } from "express";
import { ZodSchema } from "zod";
import { ApiError } from "@/utils/ApiError";
import { StatusCodes } from "@/constants/statusCodes.constant";
import { ErrorCodes } from "@/constants/errorCodes.constant";

type ValidationTarget = "body" | "query" | "params";

export const validate = (schema: ZodSchema, target: ValidationTarget = "body") =>
  (req: Request, _res: Response, next: NextFunction) => {
    const result = schema.safeParse(req[target]);
    if (!result.success) {
      return next(
        new ApiError(
          StatusCodes.BAD_REQUEST,
          ErrorCodes.VALIDATION_ERROR,
          "Validation failed",
          result.error.flatten()
        )
      );
    }
    req[target] = result.data;
    next();
  };
```
Usage in routes: `router.post("/register", validate(registerSchema), authController.register)`. Every route file must import `validate` and attach it — the agent must never skip this on a route just because the schema "looks simple."

### 2.9 `src/middlewares/auth.middleware.ts`
```ts
import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { ApiError } from "@/utils/ApiError";
import { StatusCodes } from "@/constants/statusCodes.constant";
import { ErrorCodes } from "@/constants/errorCodes.constant";
import { env } from "@/config/env";
import { Role } from "@/constants/roles.constant";

interface AccessTokenPayload {
  userId: string;
  role: Role;
}

export const requireAuth = (req: Request, _res: Response, next: NextFunction) => {
  const header = req.headers.authorization;
  if (!header?.startsWith("Bearer ")) {
    return next(new ApiError(StatusCodes.UNAUTHORIZED, ErrorCodes.UNAUTHORIZED, "Missing token"));
  }
  const token = header.split(" ")[1];
  try {
    const payload = jwt.verify(token, env.JWT_ACCESS_SECRET) as AccessTokenPayload;
    req.user = payload;
    next();
  } catch (err) {
    if (err instanceof jwt.TokenExpiredError) {
      return next(new ApiError(StatusCodes.UNAUTHORIZED, ErrorCodes.TOKEN_EXPIRED, "Token expired"));
    }
    return next(new ApiError(StatusCodes.UNAUTHORIZED, ErrorCodes.TOKEN_INVALID, "Invalid token"));
  }
};

export const requireRole = (...roles: Role[]) =>
  (req: Request, _res: Response, next: NextFunction) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return next(
        new ApiError(StatusCodes.FORBIDDEN, ErrorCodes.FORBIDDEN_ROLE, "Insufficient permissions")
      );
    }
    next();
  };
```

### 2.10 `src/types/express.d.ts`
```ts
import { Role } from "@/constants/roles.constant";

declare global {
  namespace Express {
    interface Request {
      user?: {
        userId: string;
        role: Role;
      };
    }
  }
}
```

### 2.11 `src/config/env.ts`
```ts
import { z } from "zod";
import dotenv from "dotenv";
dotenv.config();

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
  PORT: z.string().default("5000"),
  MONGO_URI: z.string().min(1),
  JWT_ACCESS_SECRET: z.string().min(32),
  JWT_REFRESH_SECRET: z.string().min(32),
  REDIS_URL: z.string().min(1),
  CLOUDINARY_CLOUD_NAME: z.string().min(1),
  CLOUDINARY_API_KEY: z.string().min(1),
  CLOUDINARY_API_SECRET: z.string().min(1),
  RAZORPAY_KEY_ID: z.string().min(1),
  RAZORPAY_KEY_SECRET: z.string().min(1),
  RAZORPAY_WEBHOOK_SECRET: z.string().min(1),
  RESEND_API_KEY: z.string().min(1),
  MSG91_API_KEY: z.string().optional(),
  TURN_SERVER_URL: z.string().min(1),
  TURN_SERVER_USERNAME: z.string().min(1),
  TURN_SERVER_CREDENTIAL: z.string().min(1),
  CLIENT_ORIGIN: z.string().min(1),
});

const parsed = envSchema.safeParse(process.env);
if (!parsed.success) {
  console.error("Invalid environment variables:", parsed.error.flatten().fieldErrors);
  process.exit(1);
}

export const env = parsed.data;
```
This means the server **refuses to boot** if any required env var is missing/malformed — fail fast at startup, not at first use three modules deep.

### 2.12 `src/app.ts`
```ts
import express, { Application } from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import helmet from "helmet";
import compression from "compression";
import { env } from "@/config/env";
import routes from "@/routes/index";
import { errorMiddleware } from "@/middlewares/error.middleware";
import { notFoundMiddleware } from "@/middlewares/notFound.middleware";

export const createApp = (): Application => {
  const app = express();

  app.use(helmet());
  app.use(compression());
  app.use(cors({ origin: env.CLIENT_ORIGIN, credentials: true }));
  app.use(cookieParser());

  // Razorpay webhook needs raw body for signature verification — mounted BEFORE json parser
  // for that specific route. See payment.routes.ts for the raw-body handling detail.
  app.use(express.json({ limit: "10mb" }));
  app.use(express.urlencoded({ extended: true }));

  app.use("/api", routes);

  app.use(notFoundMiddleware);
  app.use(errorMiddleware);

  return app;
};
```

### 2.13 `src/server.ts`
```ts
import http from "http";
import { createApp } from "@/app";
import { connectDB } from "@/config/db";
import { initSocket } from "@/sockets/index";
import { env } from "@/config/env";
import { logger } from "@/utils/logger";

const bootstrap = async () => {
  await connectDB();

  const app = createApp();
  const server = http.createServer(app);

  initSocket(server);

  server.listen(env.PORT, () => {
    logger.info(`Server running on port ${env.PORT} [${env.NODE_ENV}]`);
  });
};

bootstrap().catch((err) => {
  logger.error("Failed to start server", { error: err });
  process.exit(1);
});
```

### 2.14 `src/routes/index.ts`
```ts
import { Router } from "express";
import authRoutes from "@/modules/auth/auth.routes";
import userRoutes from "@/modules/user/user.routes";
import psychologistRoutes from "@/modules/psychologist/psychologist.routes";
import availabilityRoutes from "@/modules/availability/availability.routes";
import appointmentRoutes from "@/modules/appointment/appointment.routes";
import paymentRoutes from "@/modules/payment/payment.routes";
import sessionRoutes from "@/modules/session/session.routes";
import chatRoutes from "@/modules/chat/chat.routes";
import feedbackRoutes from "@/modules/feedback/feedback.routes";
import assessmentRoutes from "@/modules/assessment/assessment.routes";
import crisisRoutes from "@/modules/crisis/crisis.routes";
import adminRoutes from "@/modules/admin/admin.routes";

const router = Router();

router.use("/auth", authRoutes);
router.use("/users", userRoutes);
router.use("/psychologists", psychologistRoutes);
router.use("/availability", availabilityRoutes);
router.use("/appointments", appointmentRoutes);
router.use("/payments", paymentRoutes);
router.use("/sessions", sessionRoutes);
router.use("/chat", chatRoutes);
router.use("/feedback", feedbackRoutes);
router.use("/assessments", assessmentRoutes);
router.use("/crisis", crisisRoutes);
router.use("/admin", adminRoutes);

export default router;
```

This is part 1 of the expanded backend plan (setup + shared core files). Part 2 covers the full per-endpoint request/response contract for every route, part 3 covers models in full Mongoose syntax, and part 4 covers the granular build order + Postman collection. Continuing in the next file section.

---

## 3. Full Endpoint Contracts

Every endpoint below specifies: method + path, auth requirement, request shape, success response shape (the `data` field — it's always wrapped in the `ApiResponse.success()` envelope from section 2.5), and error cases. Frontend types in FRONTEND_PLAN.md are written to match these exactly — if either side changes, both files must be updated together.

Convention: `:id` style path params are MongoDB ObjectId strings. All dates in requests/responses are ISO 8601 UTC strings (e.g. `"2026-06-20T10:30:00.000Z"`). All money amounts are integers in the smallest currency unit (paise for INR, cents for USD) to avoid floating point issues — convert to display units only in the frontend.

### 3.1 Auth Module (`/api/auth`)

#### `POST /api/auth/register`
Auth: none
```ts
// Request body
{
  name: string;          // 2-50 chars
  email?: string;        // required if phone absent
  phone?: string;         // required if email absent, E.164 format e.g. "+919876543210"
  password: string;       // min 8 chars, 1 uppercase, 1 number
  role: "patient" | "psychologist"; // admin accounts are never self-registered
  country: string;        // ISO 3166-1 alpha-2, e.g. "IN"
  timezone: string;       // IANA, e.g. "Asia/Kolkata" — frontend detects via Intl.DateTimeFormat().resolvedOptions().timeZone
}

// Success 201
data: {
  userId: string;
  email?: string;
  phone?: string;
  otpSentTo: "email" | "phone";
}

// Errors
400 VALIDATION_ERROR        - schema fail
409 DUPLICATE_EMAIL         - email already registered
409 DUPLICATE_PHONE         - phone already registered
```

#### `POST /api/auth/verify-otp`
Auth: none
```ts
// Request body
{
  userId: string;
  otp: string;             // 6 digits
}

// Success 200
data: {
  accessToken: string;
  user: {
    id: string;
    name: string;
    email?: string;
    phone?: string;
    role: "patient" | "psychologist" | "admin";
    isVerified: true;
  };
}
// Refresh token is set as httpOnly cookie in the same response, not in the JSON body.

// Errors
400 OTP_INVALID
410 OTP_EXPIRED            (use 410 Gone for expired tokens/codes)
404 NOT_FOUND              - userId doesn't exist
```

#### `POST /api/auth/login`
Auth: none
```ts
// Request body
{
  emailOrPhone: string;
  password: string;
}

// Success 200 — same shape as verify-otp success
data: {
  accessToken: string;
  user: { id, name, email?, phone?, role, isVerified };
}

// Errors
401 INVALID_CREDENTIALS
403 FORBIDDEN_ROLE          - if isVerified is false, must verify-otp first (code distinguishes this case — message should say "account not verified")
```

#### `POST /api/auth/refresh-token`
Auth: refresh token via httpOnly cookie (no Authorization header needed)
```ts
// Request body: none

// Success 200
data: { accessToken: string; }
// New refresh token also rotated into httpOnly cookie.

// Errors
401 TOKEN_INVALID
401 TOKEN_EXPIRED           - refresh expired, frontend must force full re-login
```

#### `POST /api/auth/logout`
Auth: required (Bearer)
```ts
// Request body: none
// Success 200
data: null
// Clears refresh cookie server-side.
```

---

### 3.2 User Module (`/api/users`)

#### `GET /api/users/me`
Auth: required (any role)
```ts
// Success 200
data: {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  role: "patient" | "psychologist" | "admin";
  age?: number;
  gender?: "male" | "female" | "other" | "prefer_not_to_say";
  emergencyContact?: { name: string; phone: string };
  country: string;
  timezone: string;
  avatarUrl?: string;
  isVerified: boolean;
  createdAt: string;
}
```

#### `PATCH /api/users/me`
Auth: required
```ts
// Request body (all optional, partial update)
{
  name?: string;
  age?: number;
  gender?: "male" | "female" | "other" | "prefer_not_to_say";
  emergencyContact?: { name: string; phone: string };
  timezone?: string;
}
// Note: email, phone, role, country are NOT editable here — require separate verified-change flow (out of v1 scope, flag if requested).

// Success 200 — returns updated user, same shape as GET /me

// Errors
400 VALIDATION_ERROR
```

#### `POST /api/users/me/avatar`
Auth: required
Content-Type: `multipart/form-data`, field name `avatar` (image, max 5MB, jpg/png/webp)
```ts
// Success 200
data: { avatarUrl: string; }

// Errors
400 VALIDATION_ERROR        - wrong file type/size
```

---

### 3.3 Psychologist Module (`/api/psychologists`)

#### `GET /api/psychologists`
Auth: optional (public browsing allowed, but auth narrows jurisdiction matching if present)
```ts
// Query params
{
  page?: number;            // default 1
  limit?: number;            // default 20, max 100
  specialization?: string;   // comma-separated, e.g. "anxiety,depression"
  language?: string;
  country?: string;          // filters by licensedCountries — defaults to requester's country if authenticated
  minRating?: number;
  sortBy?: "rating" | "experience" | "fee_asc" | "fee_desc"; // default "rating"
}

// Success 200
data: Array<{
  id: string;
  name: string;
  avatarUrl?: string;
  specialization: string[];
  languages: string[];
  experienceYears: number;
  consultationFee: { amount: number; currency: string };
  rating: { average: number; count: number };
  isOnline: boolean;
  bio: string;
}>
meta: { page, limit, total, totalPages }
```

#### `GET /api/psychologists/:id`
Auth: optional
```ts
// Success 200
data: {
  id: string;
  name: string;
  avatarUrl?: string;
  specialization: string[];
  languages: string[];
  experienceYears: number;
  consultationFee: { amount: number; currency: string };
  bio: string;
  rating: { average: number; count: number };
  isOnline: boolean;
  licensedCountries: string[];
  verificationStatus: "pending" | "approved" | "rejected"; // only included if requester is the psychologist themself or an admin
}

// Errors
404 NOT_FOUND
```

#### `POST /api/psychologists/credentials`
Auth: required, role=psychologist
Content-Type: `multipart/form-data`, field name `documents` (array of files, max 5, pdf/jpg/png, max 10MB each)
```ts
// Request body (alongside files)
{
  type: "license" | "degree" | "id_proof";
}

// Success 201
data: {
  credentials: Array<{ docUrl: string; type: string; verified: false }>;
}
```

#### `PATCH /api/psychologists/me/profile`
Auth: required, role=psychologist
```ts
// Request body (partial)
{
  specialization?: string[];
  languages?: string[];
  experienceYears?: number;
  consultationFee?: { amount: number; currency: string };
  bio?: string;
  licensedCountries?: string[];
  isAcceptingEmergency?: boolean;
}

// Success 200 — returns updated profile (same shape as GET /:id with full fields)
```

---

### 3.4 Availability Module (`/api/availability`)

#### `PATCH /api/availability/me/rules`
Auth: required, role=psychologist
```ts
// Request body — recurring weekly pattern
{
  rules: Array<{
    dayOfWeek: 0 | 1 | 2 | 3 | 4 | 5 | 6; // 0 = Sunday
    startTime: string;   // "HH:mm" in psychologist's own timezone
    endTime: string;     // "HH:mm"
    slotDurationMinutes: 30 | 45 | 60;
    modes: Array<"chat" | "audio" | "video">;
  }>;
}

// Success 200
data: { rulesUpdated: number; }
// Actual AvailabilitySlot documents are materialized asynchronously by slotGeneration.worker — not generated synchronously in this request.
```

#### `GET /api/availability/:psychologistId/slots`
Auth: optional
```ts
// Query params
{
  from: string;   // ISO date, required
  to: string;     // ISO date, required, max 30 days range from `from`
  mode?: "chat" | "audio" | "video";
}

// Success 200
data: Array<{
  slotId: string;
  startTime: string;  // ISO UTC
  endTime: string;
  mode: "chat" | "audio" | "video";
  isBooked: boolean;
}>
// Frontend converts startTime/endTime to viewer's local timezone for display — backend always returns UTC.
```

#### `PATCH /api/availability/slots/:slotId/block`
Auth: required, role=psychologist (must own the slot)
```ts
// Request body: none
// Success 200
data: { slotId: string; isBlocked: true; }

// Errors
403 FORBIDDEN_ROLE          - slot doesn't belong to this psychologist
409 SLOT_ALREADY_BOOKED     - can't block a slot a patient already booked
```

---

### 3.5 Appointment Module (`/api/appointments`)

#### `POST /api/appointments`
Auth: required, role=patient
```ts
// Request body — discriminated union on allocationMode
{
  allocationMode: "manual";
  slotId: string;
  mode: "chat" | "audio" | "video";
  concernDescription?: string;
}
// OR
{
  allocationMode: "auto";
  preferredFrom: string;     // ISO datetime, window start
  preferredTo: string;       // ISO datetime, window end
  mode: "chat" | "audio" | "video";
  specialization?: string;
  concernDescription?: string;
}

// Success 201 (manual mode)
data: {
  appointmentId: string;
  status: "pending_payment";
  psychologistId: string;
  scheduledAt: string;
  mode: string;
  fee: { amount: number; currency: string };
}

// Success 201 (auto mode) — same shape, psychologistId is system-assigned

// Errors
400 VALIDATION_ERROR
404 NOT_FOUND               - slotId doesn't exist (manual mode)
409 SLOT_ALREADY_BOOKED      - race condition, someone else booked it first (manual mode)
404 NO_PSYCHOLOGIST_AVAILABLE - no eligible match in window (auto mode)
403 PSYCHOLOGIST_NOT_VERIFIED - target psychologist not yet admin-approved
```
Note: creating an appointment reserves the slot (`isBooked: true`) immediately but appointment stays `pending_payment` until payment confirms — reserved slots auto-release after a 10-minute hold if payment isn't completed (implement via a delayed BullMQ job that flips `isBooked` back to false and cancels the appointment if still `pending_payment`).

#### `GET /api/appointments/me`
Auth: required (patient sees own as patient, psychologist sees own as psychologist)
```ts
// Query params
{
  page?: number;
  limit?: number;
  status?: "pending_payment" | "confirmed" | "in_progress" | "completed" | "cancelled" | "no_show";
  upcoming?: boolean;   // if true, filters scheduledAt >= now
}

// Success 200
data: Array<{
  id: string;
  otherParty: { id: string; name: string; avatarUrl?: string }; // psychologist if requester is patient, vice versa
  mode: "chat" | "audio" | "video";
  status: string;
  scheduledAt: string;
  allocationMode: "manual" | "auto" | "emergency";
}>
meta: { page, limit, total, totalPages }
```

#### `GET /api/appointments/:id`
Auth: required (must be a participant or admin)
```ts
// Success 200
data: {
  id: string;
  patient: { id, name, avatarUrl? };
  psychologist: { id, name, avatarUrl? };
  mode: "chat" | "audio" | "video";
  status: string;
  scheduledAt: string;
  concernDescription?: string;
  allocationMode: string;
  payment: { status: string; amount: number; currency: string } | null;
}

// Errors
403 FORBIDDEN_ROLE     - not a participant
404 NOT_FOUND
```

#### `PATCH /api/appointments/:id/cancel`
Auth: required (must be a participant)
```ts
// Request body
{ reason?: string; }

// Success 200
data: { id: string; status: "cancelled"; }

// Errors
409 - cannot cancel a completed/in_progress appointment (use VALIDATION_ERROR code with a clear message)
```

---

### 3.6 Payment Module (`/api/payments`)

#### `POST /api/payments/create-order`
Auth: required, role=patient
```ts
// Request body
{ appointmentId: string; }

// Success 200
data: {
  razorpayOrderId: string;
  amount: number;          // smallest currency unit
  currency: string;
  razorpayKeyId: string;   // public key, safe to expose, frontend needs it for checkout widget
}

// Errors
404 NOT_FOUND               - appointment doesn't exist or doesn't belong to requester
409 - appointment not in pending_payment state
```

#### `POST /api/payments/verify`
Auth: required, role=patient
```ts
// Request body — fields returned by Razorpay checkout widget on the frontend
{
  appointmentId: string;
  razorpayOrderId: string;
  razorpayPaymentId: string;
  razorpaySignature: string;
}

// Success 200
data: {
  appointmentId: string;
  status: "confirmed";
  paymentId: string;
}

// Errors
400 PAYMENT_SIGNATURE_INVALID   - signature check failed, do NOT mark as paid
```
Note: this endpoint is a client-side confirmation convenience for immediate UI feedback. The webhook (`3.6 below`) is the source of truth — if the two ever disagree, the webhook wins. Never mark an appointment `confirmed` based on this endpoint alone without the signature check passing.

#### `POST /api/payments/webhook/razorpay`
Auth: none (verified via Razorpay webhook signature header `x-razorpay-signature` instead)
This route must be mounted with `express.raw({ type: "application/json" })` body parsing, NOT the global `express.json()` — signature verification needs the raw byte body, not the parsed object.
```ts
// Request body: raw Razorpay webhook payload (their format, not ours — see Razorpay docs for exact shape)

// Success 200 (always respond 200 quickly to acknowledge receipt, even if internal processing is async)
data: null

// Internal: verify x-razorpay-signature against RAZORPAY_WEBHOOK_SECRET before trusting payload contents.
```

---

### 3.7 Session Module (`/api/sessions`)

#### `GET /api/sessions/:appointmentId`
Auth: required (must be a participant)
```ts
// Success 200
data: {
  sessionId: string;
  appointmentId: string;
  mode: "chat" | "audio" | "video";
  roomId: string;
  status: "not_started" | "active" | "ended";
  startedAt?: string;
  iceServers: Array<{ urls: string; username?: string; credential?: string }>;
  // iceServers includes both STUN (no credentials) and TURN (with credentials) entries
}

// Errors
403 - appointment not confirmed yet, or requester not a participant
404 NOT_FOUND
```

#### `PATCH /api/sessions/:id/notes`
Auth: required, role=psychologist (must be the session's psychologist)
```ts
// Request body
{ notes: string; }

// Success 200
data: { id: string; notesUpdated: true; }
// This field is NEVER included in any patient-facing response — enforce at the service layer, not just by frontend omission.
```

---

### 3.8 Chat Module (`/api/chat`)

#### `GET /api/chat/:sessionId/history`
Auth: required (must be a participant)
```ts
// Query params
{ page?: number; limit?: number; } // default limit 50, sorted newest-first then reversed for display

// Success 200
data: Array<{
  id: string;
  senderId: string;
  content: string;
  attachmentUrl?: string;
  sentAt: string;
  readAt?: string;
}>
meta: { page, limit, total, totalPages }
```

---

### 3.9 Feedback Module (`/api/feedback`)

#### `POST /api/feedback`
Auth: required, role=patient
```ts
// Request body
{
  appointmentId: string;
  rating: number;             // 1-5 integer
  comment?: string;
  continueWithSamePsychologist?: boolean;
}

// Success 201
data: { id: string; }

// Errors
409 - feedback already submitted for this appointment (one per appointment)
403 - appointment not completed yet
```

#### `GET /api/feedback/psychologist/:id`
Auth: optional
```ts
// Query params: { page?, limit? }
// Success 200
data: Array<{
  rating: number;
  comment?: string;
  patientName: string;     // first name only or "Anonymous" per privacy setting — DECISION NEEDED on display policy
  createdAt: string;
}>
meta: { page, limit, total, totalPages }
```

---

### 3.10 Assessment Module (`/api/assessments`)

#### `GET /api/assessments/templates/:type`
Auth: required
```ts
// :type = "anxiety" | "stress" | "depression"
// Success 200
data: {
  templateId: string;
  type: string;
  title: string;
  questions: Array<{
    id: string;
    text: string;
    options: Array<{ text: string; score: number }>;
  }>;
}
```

#### `POST /api/assessments/submit`
Auth: required
```ts
// Request body
{
  templateId: string;
  answers: Array<{ questionId: string; selectedScore: number }>;
}

// Success 201
data: {
  resultId: string;
  totalScore: number;
  riskLevel: "low" | "moderate" | "high" | "severe";
  triggeredCrisisFlow: boolean;
  crisisResources?: Array<{      // present only if triggeredCrisisFlow is true
    helplineName: string;
    phoneNumber: string;
    availableHours: string;
    website?: string;
  }>;
}
```

---

### 3.11 Crisis Module (`/api/crisis`)

#### `GET /api/crisis/resources`
Auth: optional
```ts
// Query params: { country: string; }  // ISO code, required
// Success 200
data: Array<{
  helplineName: string;
  phoneNumber: string;
  availableHours: string;
  website?: string;
}>
```

---

### 3.12 Admin Module (`/api/admin`)

#### `GET /api/admin/psychologists/pending`
Auth: required, role=admin
```ts
// Query params: { page?, limit? }
// Success 200
data: Array<{
  id: string;
  name: string;
  email?: string;
  credentials: Array<{ docUrl: string; type: string }>;
  submittedAt: string;
}>
meta: { page, limit, total, totalPages }
```

#### `PATCH /api/admin/psychologists/:id/verify`
Auth: required, role=admin
```ts
// Request body
{
  decision: "approved" | "rejected";
  rejectionReason?: string;   // required if decision is "rejected"
}

// Success 200
data: { id: string; verificationStatus: "approved" | "rejected"; }
```

#### `GET /api/admin/appointments`
Auth: required, role=admin
```ts
// Query params: { page?, limit?, status? }
// Success 200 — same shape as patient's GET /appointments/me but across all users, with patient+psychologist both shown
data: Array<{
  id: string;
  patient: { id, name };
  psychologist: { id, name };
  status: string;
  scheduledAt: string;
}>
meta: { page, limit, total, totalPages }
```

#### `GET /api/admin/reports`
Auth: required, role=admin
```ts
// Query params: { from: string; to: string; } // ISO dates
// Success 200
data: {
  totalAppointments: number;
  totalRevenue: { amount: number; currency: string };
  newUsers: number;
  appointmentsByStatus: Record<string, number>;
  topSpecializations: Array<{ specialization: string; count: number }>;
}
```

#### `PATCH /api/admin/payments/:id/refund`
Auth: required, role=admin
```ts
// Request body
{ reason: string; amount?: number; } // amount omitted = full refund

// Success 200
data: { paymentId: string; status: "refunded"; refundedAmount: number; }

// Errors
409 - payment not in a refundable state
```

---

## 4. Mongoose Models — Full Schema Definitions

Pattern every model file follows: define an `IXxx` TypeScript interface first, then the Mongoose schema typed against it, then export `Model<IXxx>`. Always include `timestamps: true` unless explicitly not needed.

### 4.1 `src/modules/user/user.model.ts`
```ts
import { Schema, model, Document, Types } from "mongoose";
import { Role } from "@/constants/roles.constant";

export interface IUser extends Document {
  name: string;
  email?: string;
  phone?: string;
  passwordHash: string;
  role: Role;
  age?: number;
  gender?: "male" | "female" | "other" | "prefer_not_to_say";
  emergencyContact?: { name: string; phone: string };
  country: string;
  timezone: string;
  isVerified: boolean;
  isActive: boolean;
  avatarUrl?: string;
  createdAt: Date;
  updatedAt: Date;
}

const userSchema = new Schema<IUser>(
  {
    name: { type: String, required: true, trim: true, minlength: 2, maxlength: 50 },
    email: { type: String, unique: true, sparse: true, lowercase: true, trim: true },
    phone: { type: String, unique: true, sparse: true, trim: true },
    passwordHash: { type: String, required: true },
    role: { type: String, enum: ["patient", "psychologist", "admin"], required: true },
    age: { type: Number, min: 13, max: 120 },
    gender: { type: String, enum: ["male", "female", "other", "prefer_not_to_say"] },
    emergencyContact: {
      name: { type: String },
      phone: { type: String },
    },
    country: { type: String, required: true },
    timezone: { type: String, required: true },
    isVerified: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true },
    avatarUrl: { type: String },
  },
  { timestamps: true }
);

export const UserModel = model<IUser>("User", userSchema);
```

### 4.2 `src/modules/psychologist/psychologist.model.ts`
```ts
import { Schema, model, Document, Types } from "mongoose";

export interface IPsychologistProfile extends Document {
  userId: Types.ObjectId;
  specialization: string[];
  languages: string[];
  experienceYears: number;
  consultationFee: { amount: number; currency: string };
  bio: string;
  credentials: Array<{ docUrl: string; type: string; verified: boolean }>;
  licensedCountries: string[];
  verificationStatus: "pending" | "approved" | "rejected";
  rejectionReason?: string;
  rating: { average: number; count: number };
  isOnline: boolean;
  isAcceptingEmergency: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const psychologistSchema = new Schema<IPsychologistProfile>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, unique: true },
    specialization: [{ type: String }],
    languages: [{ type: String }],
    experienceYears: { type: Number, default: 0, min: 0 },
    consultationFee: {
      amount: { type: Number, required: true, min: 0 },
      currency: { type: String, required: true, default: "INR" },
    },
    bio: { type: String, default: "" },
    credentials: [
      {
        docUrl: { type: String, required: true },
        type: { type: String, enum: ["license", "degree", "id_proof"], required: true },
        verified: { type: Boolean, default: false },
      },
    ],
    licensedCountries: [{ type: String }],
    verificationStatus: { type: String, enum: ["pending", "approved", "rejected"], default: "pending" },
    rejectionReason: { type: String },
    rating: {
      average: { type: Number, default: 0 },
      count: { type: Number, default: 0 },
    },
    isOnline: { type: Boolean, default: false },
    isAcceptingEmergency: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export const PsychologistModel = model<IPsychologistProfile>("PsychologistProfile", psychologistSchema);
```

### 4.3 `src/modules/availability/availabilityRule.model.ts`
```ts
import { Schema, model, Document, Types } from "mongoose";

export interface IAvailabilityRule extends Document {
  psychologistId: Types.ObjectId;
  dayOfWeek: number; // 0-6
  startTime: string; // "HH:mm"
  endTime: string;
  slotDurationMinutes: number;
  modes: Array<"chat" | "audio" | "video">;
  isActive: boolean;
}

const ruleSchema = new Schema<IAvailabilityRule>(
  {
    psychologistId: { type: Schema.Types.ObjectId, ref: "PsychologistProfile", required: true },
    dayOfWeek: { type: Number, min: 0, max: 6, required: true },
    startTime: { type: String, required: true },
    endTime: { type: String, required: true },
    slotDurationMinutes: { type: Number, enum: [30, 45, 60], required: true },
    modes: [{ type: String, enum: ["chat", "audio", "video"] }],
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export const AvailabilityRuleModel = model<IAvailabilityRule>("AvailabilityRule", ruleSchema);
```

### 4.4 `src/modules/availability/availabilitySlot.model.ts`
```ts
import { Schema, model, Document, Types } from "mongoose";

export interface IAvailabilitySlot extends Document {
  psychologistId: Types.ObjectId;
  startTime: Date;
  endTime: Date;
  mode: "chat" | "audio" | "video";
  isBooked: boolean;
  isBlocked: boolean;
  holdExpiresAt?: Date; // set when reserved pending payment
}

const slotSchema = new Schema<IAvailabilitySlot>(
  {
    psychologistId: { type: Schema.Types.ObjectId, ref: "PsychologistProfile", required: true, index: true },
    startTime: { type: Date, required: true, index: true },
    endTime: { type: Date, required: true },
    mode: { type: String, enum: ["chat", "audio", "video"], required: true },
    isBooked: { type: Boolean, default: false },
    isBlocked: { type: Boolean, default: false },
    holdExpiresAt: { type: Date },
  },
  { timestamps: true }
);

slotSchema.index({ psychologistId: 1, startTime: 1 });

export const AvailabilitySlotModel = model<IAvailabilitySlot>("AvailabilitySlot", slotSchema);
```

### 4.5 `src/modules/appointment/appointment.model.ts`
```ts
import { Schema, model, Document, Types } from "mongoose";

export interface IAppointment extends Document {
  patientId: Types.ObjectId;
  psychologistId: Types.ObjectId;
  slotId?: Types.ObjectId;
  allocationMode: "manual" | "auto" | "emergency";
  mode: "chat" | "audio" | "video";
  concernDescription?: string;
  status: "pending_payment" | "confirmed" | "in_progress" | "completed" | "cancelled" | "no_show";
  scheduledAt: Date;
  startedAt?: Date;
  endedAt?: Date;
  paymentId?: Types.ObjectId;
  cancellationReason?: string;
  createdAt: Date;
  updatedAt: Date;
}

const appointmentSchema = new Schema<IAppointment>(
  {
    patientId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    psychologistId: { type: Schema.Types.ObjectId, ref: "PsychologistProfile", required: true, index: true },
    slotId: { type: Schema.Types.ObjectId, ref: "AvailabilitySlot" },
    allocationMode: { type: String, enum: ["manual", "auto", "emergency"], required: true },
    mode: { type: String, enum: ["chat", "audio", "video"], required: true },
    concernDescription: { type: String },
    status: {
      type: String,
      enum: ["pending_payment", "confirmed", "in_progress", "completed", "cancelled", "no_show"],
      default: "pending_payment",
      index: true,
    },
    scheduledAt: { type: Date, required: true },
    startedAt: { type: Date },
    endedAt: { type: Date },
    paymentId: { type: Schema.Types.ObjectId, ref: "Payment" },
    cancellationReason: { type: String },
  },
  { timestamps: true }
);

export const AppointmentModel = model<IAppointment>("Appointment", appointmentSchema);
```

### 4.6 `src/modules/payment/payment.model.ts`
```ts
import { Schema, model, Document, Types } from "mongoose";

export interface IPayment extends Document {
  appointmentId: Types.ObjectId;
  patientId: Types.ObjectId;
  provider: "razorpay";
  providerOrderId: string;
  providerPaymentId?: string;
  amount: number;
  currency: string;
  status: "created" | "paid" | "failed" | "refunded";
  refundReason?: string;
  refundedAmount?: number;
  createdAt: Date;
  updatedAt: Date;
}

const paymentSchema = new Schema<IPayment>(
  {
    appointmentId: { type: Schema.Types.ObjectId, ref: "Appointment", required: true, index: true },
    patientId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    provider: { type: String, enum: ["razorpay"], default: "razorpay" },
    providerOrderId: { type: String, required: true },
    providerPaymentId: { type: String },
    amount: { type: Number, required: true },
    currency: { type: String, required: true },
    status: { type: String, enum: ["created", "paid", "failed", "refunded"], default: "created" },
    refundReason: { type: String },
    refundedAmount: { type: Number },
  },
  { timestamps: true }
);

export const PaymentModel = model<IPayment>("Payment", paymentSchema);
```

### 4.7 `src/modules/session/session.model.ts`
```ts
import { Schema, model, Document, Types } from "mongoose";

export interface ISession extends Document {
  appointmentId: Types.ObjectId;
  roomId: string;
  mode: "chat" | "audio" | "video";
  status: "not_started" | "active" | "ended";
  startedAt?: Date;
  endedAt?: Date;
  durationSeconds?: number;
  psychologistNotes?: string;
  recordingUrl?: string;
}

const sessionSchema = new Schema<ISession>(
  {
    appointmentId: { type: Schema.Types.ObjectId, ref: "Appointment", required: true, unique: true },
    roomId: { type: String, required: true, unique: true },
    mode: { type: String, enum: ["chat", "audio", "video"], required: true },
    status: { type: String, enum: ["not_started", "active", "ended"], default: "not_started" },
    startedAt: { type: Date },
    endedAt: { type: Date },
    durationSeconds: { type: Number },
    psychologistNotes: { type: String },
    recordingUrl: { type: String },
  },
  { timestamps: true }
);

export const SessionModel = model<ISession>("Session", sessionSchema);
```

### 4.8 `src/modules/chat/message.model.ts`
```ts
import { Schema, model, Document, Types } from "mongoose";

export interface IMessage extends Document {
  sessionId: Types.ObjectId;
  senderId: Types.ObjectId;
  content: string;
  attachmentUrl?: string;
  sentAt: Date;
  readAt?: Date;
}

const messageSchema = new Schema<IMessage>({
  sessionId: { type: Schema.Types.ObjectId, ref: "Session", required: true, index: true },
  senderId: { type: Schema.Types.ObjectId, ref: "User", required: true },
  content: { type: String, required: true },
  attachmentUrl: { type: String },
  sentAt: { type: Date, default: Date.now },
  readAt: { type: Date },
});

export const MessageModel = model<IMessage>("Message", messageSchema);
```

### 4.9 `src/modules/feedback/feedback.model.ts`
```ts
import { Schema, model, Document, Types } from "mongoose";

export interface IFeedback extends Document {
  appointmentId: Types.ObjectId;
  patientId: Types.ObjectId;
  psychologistId: Types.ObjectId;
  rating: number;
  comment?: string;
  continueWithSamePsychologist?: boolean;
  createdAt: Date;
}

const feedbackSchema = new Schema<IFeedback>(
  {
    appointmentId: { type: Schema.Types.ObjectId, ref: "Appointment", required: true, unique: true },
    patientId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    psychologistId: { type: Schema.Types.ObjectId, ref: "PsychologistProfile", required: true, index: true },
    rating: { type: Number, min: 1, max: 5, required: true },
    comment: { type: String },
    continueWithSamePsychologist: { type: Boolean },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

export const FeedbackModel = model<IFeedback>("Feedback", feedbackSchema);
```

### 4.10 `src/modules/assessment/assessmentTemplate.model.ts`
```ts
import { Schema, model, Document } from "mongoose";

export interface IAssessmentTemplate extends Document {
  type: "anxiety" | "stress" | "depression";
  title: string;
  questions: Array<{
    id: string;
    text: string;
    options: Array<{ text: string; score: number }>;
    isHighRiskIndicator?: boolean; // e.g. suicidal ideation question — flags crisis regardless of total score
  }>;
  scoringRanges: Array<{
    min: number;
    max: number;
    label: string;
    riskLevel: "low" | "moderate" | "high" | "severe";
  }>;
}

const templateSchema = new Schema<IAssessmentTemplate>(
  {
    type: { type: String, enum: ["anxiety", "stress", "depression"], required: true },
    title: { type: String, required: true },
    questions: [
      {
        id: { type: String, required: true },
        text: { type: String, required: true },
        options: [{ text: String, score: Number }],
        isHighRiskIndicator: { type: Boolean, default: false },
      },
    ],
    scoringRanges: [
      {
        min: Number,
        max: Number,
        label: String,
        riskLevel: { type: String, enum: ["low", "moderate", "high", "severe"] },
      },
    ],
  },
  { timestamps: true }
);

export const AssessmentTemplateModel = model<IAssessmentTemplate>("AssessmentTemplate", templateSchema);
```

### 4.11 `src/modules/assessment/assessmentResult.model.ts`
```ts
import { Schema, model, Document, Types } from "mongoose";

export interface IAssessmentResult extends Document {
  patientId: Types.ObjectId;
  templateId: Types.ObjectId;
  answers: Array<{ questionId: string; selectedScore: number }>;
  totalScore: number;
  riskLevel: "low" | "moderate" | "high" | "severe";
  triggeredCrisisFlow: boolean;
  createdAt: Date;
}

const resultSchema = new Schema<IAssessmentResult>(
  {
    patientId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    templateId: { type: Schema.Types.ObjectId, ref: "AssessmentTemplate", required: true },
    answers: [{ questionId: String, selectedScore: Number }],
    totalScore: { type: Number, required: true },
    riskLevel: { type: String, enum: ["low", "moderate", "high", "severe"], required: true },
    triggeredCrisisFlow: { type: Boolean, default: false },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

export const AssessmentResultModel = model<IAssessmentResult>("AssessmentResult", resultSchema);
```

### 4.12 `src/modules/crisis/crisisResource.model.ts`
```ts
import { Schema, model, Document } from "mongoose";

export interface ICrisisResource extends Document {
  country: string; // ISO code
  helplineName: string;
  phoneNumber: string;
  availableHours: string;
  website?: string;
}

const crisisSchema = new Schema<ICrisisResource>({
  country: { type: String, required: true, index: true },
  helplineName: { type: String, required: true },
  phoneNumber: { type: String, required: true },
  availableHours: { type: String, required: true },
  website: { type: String },
});

export const CrisisResourceModel = model<ICrisisResource>("CrisisResource", crisisSchema);
```

---

## 5. Postman Collection Structure

Create `postman/ManoBalam.postman_collection.json` with folders mirroring the route modules. Use Postman environment variables, not hardcoded values, so the agent (and you) can switch between local/staging without editing every request:

```
Environment variables (create a "ManoBalamHealthCare Local" Postman environment):
  base_url        = http://localhost:5000/api
  access_token     = (auto-filled by a login request's post-response script)
  patient_id       = (set manually after first register/login)
  psychologist_id  = (set manually after first psychologist register/login)
  appointment_id   = (set manually after creating a test appointment)
```

Collection folder structure:
```
ManoBalamHealthCare/
├── Auth/
│   ├── Register Patient
│   ├── Register Psychologist
│   ├── Verify OTP
│   ├── Login
│   ├── Refresh Token
│   └── Logout
├── User/
│   ├── Get Me
│   ├── Update Me
│   └── Upload Avatar
├── Psychologist/
│   ├── List Psychologists
│   ├── Get Psychologist By Id
│   ├── Upload Credentials
│   └── Update My Profile
├── Availability/
│   ├── Set Recurring Rules
│   ├── Get Slots
│   └── Block Slot
├── Appointment/
│   ├── Create (Manual Mode)
│   ├── Create (Auto Mode)
│   ├── Get My Appointments
│   ├── Get Appointment By Id
│   └── Cancel Appointment
├── Payment/
│   ├── Create Order
│   ├── Verify Payment
│   └── Webhook (Razorpay) — note: real webhook calls come from Razorpay, this is for manual payload testing only
├── Session/
│   ├── Get Session
│   └── Update Notes
├── Chat/
│   └── Get Chat History
├── Feedback/
│   ├── Submit Feedback
│   └── Get Psychologist Feedback
├── Assessment/
│   ├── Get Template
│   └── Submit Assessment
├── Crisis/
│   └── Get Resources By Country
└── Admin/
    ├── List Pending Psychologists
    ├── Verify Psychologist
    ├── List All Appointments
    ├── Get Reports
    └── Refund Payment
```

On the "Login" request, add a Postman post-response script to auto-save the token:
```js
const data = pm.response.json();
if (data.success) {
  pm.environment.set("access_token", data.data.accessToken);
}
```
Every authenticated request's Authorization header uses `Bearer {{access_token}}` referencing that environment variable — never paste raw tokens into individual requests.

Build this collection incrementally alongside each module (see build order below) — don't try to write all requests up front before any routes exist; test each module's endpoints in Postman immediately after building it, before moving to the next module.

---

## 6. Granular Build Order

Each step lists exact files to create/touch, in order, and what to verify in Postman before moving on. The agent must not skip ahead to a later step's files while a step is incomplete.

**[x] Step 1 — Project scaffold**
Files: everything in section 0 (package.json, tsconfig.json, .gitignore), `src/config/env.ts`, `.env` + `.env.example`, `src/constants/*` (all three), `src/utils/ApiError.ts`, `src/utils/ApiResponse.ts`, `src/utils/asyncHandler.ts`, `src/utils/logger.ts`, `src/types/express.d.ts`, `src/middlewares/error.middleware.ts`, `src/middlewares/notFound.middleware.ts`, `src/middlewares/validate.middleware.ts`, `src/config/db.ts`, `src/app.ts`, `src/server.ts`, `src/routes/index.ts` (empty router for now).
Verify: `npm run dev` boots without error, `GET /api/anything` returns the 404 handler's JSON shape correctly.

**[x] Step 2 — Auth module**
Files: `src/modules/user/user.model.ts`, `src/modules/auth/auth.types.ts`, `auth.validation.ts`, `auth.service.ts`, `auth.controller.ts`, `auth.routes.ts`, `src/utils/otp.ts`, `src/middlewares/auth.middleware.ts`, `src/middlewares/rateLimit.middleware.ts`, wire `authRoutes` into `routes/index.ts`.
Verify in Postman: Register Patient → Verify OTP → Login → Refresh Token → Logout, full happy path. Test duplicate email returns 409.

**[x] Step 3 — User profile module**
Files: `user.routes.ts`, `user.controller.ts`, `user.service.ts`, `user.validation.ts`, `src/middlewares/upload.middleware.ts`, `src/config/cloudinary.ts`.
Verify: Get Me, Update Me, Upload Avatar (use a real test image).

**[x] Step 4 — Psychologist module**
Files: `psychologist.model.ts`, `.routes.ts`, `.controller.ts`, `.service.ts`, `.validation.ts`, `.types.ts`.
Verify: register a psychologist account, fill profile, upload credentials, list psychologists (should show it with verificationStatus "pending"), get by id.

**[x] Step 5 — Availability module**
Files: `availabilityRule.model.ts`, `availabilitySlot.model.ts`, rest of the module files, `src/utils/generateSlots.ts`, `src/utils/timezone.ts` (luxon helpers — write `toUTC`, `fromUTC`, `formatInTimezone` functions here).
Verify: set recurring rules for the test psychologist, manually trigger slot generation (a temporary script or the worker once built in Step 12), confirm `GET /availability/:id/slots` returns correct UTC times.

**[x] Step 6 — Appointment module (manual mode only first)**
Files: `appointment.model.ts`, rest of module files — implement only `allocateManual` in the service for now, stub `allocateAuto` and `allocateEmergency` to throw "not implemented" explicitly (not silently).
Verify: create appointment in manual mode, confirm slot gets `isBooked: true`, confirm appointment status is `pending_payment`.

**[x] Step 7 — Payment module**
Files: `payment.model.ts`, `providers/paymentProvider.interface.ts`, `providers/razorpay.provider.ts`, rest of module files, `src/config/razorpay.ts`.
Verify: create-order in Razorpay test mode, complete a test payment using Razorpay's documented test card/UPI credentials, confirm verify endpoint flips appointment to `confirmed`. Set up the webhook with ngrok and confirm it independently fires and matches.

**[x] Step 8 — Complete appointment module (auto mode)**
Files: implement `allocateAuto` fully in `appointment.service.ts`.
Verify: create appointment in auto mode with no specific psychologist named, confirm a valid eligible match gets assigned; test the "no eligible match" path returns `NO_PSYCHOLOGIST_AVAILABLE`.

**[x] Step 9 — Socket.io base + presence**
Files: `src/config/redis.ts`, `src/sockets/index.ts`, `src/sockets/events.ts`, `src/sockets/middleware/socketAuth.middleware.ts`, `src/sockets/handlers/presence.handler.ts`.
Verify: connect with a test client (e.g. a small script or Postman's socket support), confirm JWT-based socket auth rejects bad tokens, confirm presence updates broadcast correctly.

**[x] Step 10 — Chat + Session modules**
Files: `session.model.ts`, rest of session module, `message.model.ts`, rest of chat module, `src/sockets/handlers/chat.handler.ts`.
Verify: GET session for a confirmed appointment returns iceServers populated from env vars; send/receive chat messages over socket between two test clients in the same room; GET chat history returns them via REST.

**[x] Step 11 — WebRTC signaling**
Files: `src/sockets/handlers/webrtcSignaling.handler.ts`.
Verify: using two browser tabs (real browser, not just Postman) with a minimal test HTML page, confirm offer/answer/ICE candidates relay correctly and a call connects using the configured TURN server — test with at least one connection over a different network (e.g. phone hotspot) to confirm TURN actually works, not just same-network STUN.

**[x] Step 12 — Background jobs**
Files: all of `src/jobs/`.
Verify: confirm slot generation worker actually materializes slots on a schedule; confirm reminder jobs schedule correctly when an appointment is confirmed (test with short artificial delays first, not real 24h/1h/10min, to verify logic before trusting real timing).

**[x] Step 13 — Feedback module**
Files: all of `src/modules/feedback/`.
Verify: submit feedback for a completed test appointment, confirm duplicate submission is rejected, confirm psychologist rating average updates.

**[x] Step 14 — Assessment + Crisis modules** 
Files: all of `src/modules/assessment/`, all of `src/modules/crisis/`. Seed at least one real `AssessmentTemplate` per type and real, verified `CrisisResource` entries for at least India (and any other country you're testing) — do not seed fake helpline numbers.
Verify: submit a low-risk and a high-risk test answer set, confirm `triggeredCrisisFlow` and resource lookup behave correctly for both.

**[x] Step 15 — Emergency broadcast flow**
Files: `src/sockets/handlers/emergency.handler.ts`, `allocateEmergency` implementation in `appointment.service.ts`.
Verify: with two test psychologist clients online and `isAcceptingEmergency: true`, fire an emergency request from a patient client, confirm both receive the incoming event, confirm only the first to accept gets assigned via the Redis lock, confirm the second receives `already_taken`.

**[x] Step 16 — Admin module**
Files: all of `src/modules/admin/`.
Verify: as an admin test account, approve/reject the pending psychologist from Step 4, list all appointments, pull a reports summary, process a refund on the Step 7 test payment.

**[x] Step 17 — Hardening pass**
Tasks: audit every route for `validate` middleware presence, audit every protected route for `requireAuth`/`requireRole`, confirm rate limiting is active on auth/OTP routes, confirm no `console.log` of sensitive data anywhere, run through the full Postman collection top to bottom on a clean database to confirm nothing regressed.
