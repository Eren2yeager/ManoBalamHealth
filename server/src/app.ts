import express, { Application } from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import helmet from "helmet";
import compression from "compression";
import { env } from "@/config/env";
import routes from "@/routes/index";
import { errorMiddleware } from "@/middlewares/error.middleware";
import { notFoundMiddleware } from "@/middlewares/notFound.middleware";
import { requestLoggerMiddleware } from "@/middlewares/requestLogger.middleware";

export const createApp = (): Application => {
  const app = express();

  app.use(helmet());
  app.use(compression());
  app.use(cors({ origin: env.CLIENT_ORIGIN, credentials: true }));
  app.use(cookieParser());

  // NOTE: The Razorpay webhook route (/api/payments/webhook/razorpay) is mounted
  // with express.raw({ type: "application/json" }) directly in payment.routes.ts,
  // BEFORE the global express.json() middleware reaches it. Signature verification
  // requires the raw byte body — do not move that route or add global raw parsing here.
  app.use(express.json({ limit: "10mb" }));
  app.use(express.urlencoded({ extended: true }));

  // Add request logging middleware
  app.use(requestLoggerMiddleware);

  app.use("/api", routes);

  app.use(notFoundMiddleware);
  app.use(errorMiddleware);

  return app;
};
