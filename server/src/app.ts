import express, { Application } from "express";
import path from "path";
import fs from "fs";
import cors from "cors";
import cookieParser from "cookie-parser";
import helmet from "helmet";
import compression from "compression";
import { env } from "@/config/env";
import routes from "@/routes/index";
import { errorMiddleware } from "@/middlewares/error.middleware";
import { notFoundMiddleware } from "@/middlewares/notFound.middleware";
import { requestLoggerMiddleware } from "@/middlewares/requestLogger.middleware";
import { paymentController } from "@/modules/payment/payment.controller";

export const createApp = (): Application => {
  const app = express();

  // CSP disabled: in production this server also serves the Vite client bundle,
  // which loads assets (Cloudinary images, TURN/websocket connections) that the
  // default helmet CSP would block.
  app.use(helmet({ contentSecurityPolicy: false }));
  app.use(compression());
  app.use(cors({ origin: env.CLIENT_ORIGIN, credentials: true }));
  app.use(cookieParser());

  app.post(
    "/api/payments/webhook/razorpay",
    express.raw({ type: "application/json" }),
    paymentController.handleWebhook,
  );

  // NOTE: The Razorpay webhook route (/api/payments/webhook/razorpay) is mounted
  // with express.raw({ type: "application/json" }) directly in payment.routes.ts,
  // BEFORE the global express.json() middleware reaches it. Signature verification
  // requires the raw byte body — do not move that route or add global raw parsing here.
  app.use(express.json({ limit: "10mb" }));
  app.use(express.urlencoded({ extended: true }));

  // Add request logging middleware
  app.use(requestLoggerMiddleware);

  app.get("/api/health", (_req, res) => {
    res.status(200).json({ status: "ok" });
  });

  app.use("/api", routes);

  // Combined deployment (Render): serve the built client and fall back to
  // index.html for SPA routes. API routes are matched above; anything under
  // /api that reaches this point still gets the JSON 404 below.
  const clientDist = path.resolve(__dirname, "../../client/dist");
  if (env.NODE_ENV === "production" && fs.existsSync(clientDist)) {
    app.use(express.static(clientDist));
    app.get(/^\/(?!api\/).*/, (_req, res) => {
      res.sendFile(path.join(clientDist, "index.html"));
    });
  }

  app.use(notFoundMiddleware);
  app.use(errorMiddleware);

  return app;
};
