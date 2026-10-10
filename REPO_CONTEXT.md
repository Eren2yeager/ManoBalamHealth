# ManoBalamHealth Repository Context

Last scanned: 2026-07-04

This file is a working map for future development. It describes the code that is present, not merely the original plans. Re-scan and update it after substantial architectural or feature changes.

## Product summary

ManoBalamHealth is a full-stack mental-health care platform. It supports three roles (`patient`, `psychologist`, and `admin`) and covers public information pages, authentication, psychologist discovery/onboarding, availability, appointment booking and payment, real-time care sessions, assessments, crisis/emergency flows, feedback, and administration.

## Repository layout

- `client/`: React single-page application (207 files).
- `server/`: Express API, Socket.IO server, background jobs, and persistence layer (137 files).
- `plans/`: original detailed frontend and backend implementation plans (2 large Markdown files). These are useful design references, but current source code is the authority.
- `server/postman/ManoBalam.postman_collection.json`: API collection. Note that `server/.gitignore` ignores `postman`, so confirm tracking before modifying it.
- Total at scan time: 346 non-generated files, including 318 `.ts`/`.tsx` files.

There is no root package/workspace configuration and no root project README. Client and server are separate npm projects with separate lockfiles. `client/README.md` is still the default Vite README.

## Client

### Stack

- React 19, TypeScript, Vite 8, React Router 7.
- Tailwind CSS 4 with shadcn/Radix/Base UI components.
- Zustand for client state.
- Axios for REST; Socket.IO client for real-time events.
- Luxon plus country/timezone libraries for date and timezone handling.
- Sonner notifications, Lucide icons, next-themes.
- Alias: `@/*` maps to `client/src/*`.

### Organization

- `src/app/`: app shell, router, providers, theme provider.
- `src/features/`: feature-oriented UI, API clients, types, hooks, and stores.
- `src/components/ui/`: shared design-system primitives.
- `src/components/layout/`: navigation and dashboard layouts.
- `src/lib/`: Axios, Socket.IO, timezone, and utility setup.
- `src/routes/`: guest, authenticated, role, and approved-psychologist guards.
- `src/stores/`: global user/UI state.
- `public/images/`: brand and page illustrations.

### Implemented feature areas

- Public site: landing, home, about/organization/service content, events, FAQ, contact, legal pages, and public mental-health assessment landing.
- Auth: register, OTP verification/resend, login/logout, forgot/reset password.
- Profile: personal details and avatar upload.
- Psychologists: browsing, filtering, profiles, online presence, dashboard, credential onboarding.
- Availability and booking: recurring rules, slots, manual/automatic allocation UI, concern and consultation-mode selection.
- Appointments: patient and psychologist lists/details/cancellation.
- Payment: Razorpay checkout and retry.
- Sessions: chat/audio/video rooms, timer, messaging, WebRTC controls.
- Assessments: anxiety, stress, and depression templates, submission/results/history.
- Crisis/emergency: crisis resources, emergency request/broadcast/acceptance and emergency session room.
- Feedback and ratings.
- Admin: dashboard, psychologist verification, reports, payments/refunds.

### Route boundaries

- Public routes use `NavbarLayout`; auth pages are guest-only.
- Authenticated general routes include `/home`, `/profile`, psychologist discovery, appointments, assessments, emergency/crisis, and feedback.
- Booking routes are patient-only.
- Psychologist dashboard/onboarding routes are psychologist-only; availability, appointment management, and session access additionally require approval.
- Admin dashboard, verifications, reports, and payments are admin-only.
- Standard and emergency session rooms intentionally render without the normal navbar.

## Server

### Stack

- Node.js/TypeScript, Express 5.
- MongoDB with Mongoose 9.
- Redis with ioredis; BullMQ workers/queues.
- Socket.IO for presence, chat, WebRTC signaling, and emergencies.
- JWT authentication, bcrypt passwords, Zod validation.
- Razorpay payments, Cloudinary uploads, Resend email; optional MSG91 configuration.
- Winston logging, Helmet, CORS, compression, cookies, rate limiting, Multer.
- Jest/ts-jest tests.
- Alias: `@/*` maps to `server/src/*`.

### Runtime architecture

- `src/server.ts` connects MongoDB, creates an HTTP server, initializes Socket.IO, starts three workers, schedules slot generation, and listens on the configured port.
- `src/app.ts` configures security/compression/CORS/cookies, mounts the Razorpay raw-body webhook before JSON parsing, logs requests, mounts `/api`, and adds not-found/error handlers.
- BullMQ queues/workers cover slot generation, reminders, and notifications.
- Notification channels currently include email; push and SMS are unfinished.

### API modules under `/api`

- `/auth`: registration, OTP, login, password recovery, token refresh, logout.
- `/users`: current user read/update and avatar upload.
- `/psychologists`: listing/detail, current onboarding state/submission, credentials, profile update.
- `/availability`: current psychologist rules, public slots, slot blocking.
- `/appointments`: create, current-user list, detail, cancel.
- `/payments`: create Razorpay order and verify payment. Webhook is at `/api/payments/webhook/razorpay`.
- `/sessions`: appointment session lookup and psychologist notes.
- `/chat`: session message history.
- `/feedback`: create and psychologist feedback listing.
- `/assessments`: template, submission, and authenticated history.
- `/crisis`: country-aware crisis resources.
- `/admin`: psychologist review, appointments, reports, and refunds.
- `/contact`: rate-limited public contact requests.

### Persistence/domain models

- User, psychologist, availability rule, availability slot, appointment, payment, session, chat message, feedback, assessment template/result, crisis resource, notification, and contact request.
- Appointment allocation: `manual`, `auto`, `emergency`; modes: `chat`, `audio`, `video`.
- Appointment lifecycle: `pending_payment`, `confirmed`, `in_progress`, `completed`, `cancelled`, `no_show`, `refunded`.
- Session lifecycle: `not_started`, `active`, `ended`.
- Psychologist review/onboarding tracks incomplete, pending/review, approved, and rejected states.
- Assessment types: anxiety, stress, depression; risk bands: low, moderate, high, severe.

### Real-time contracts

- Presence: online/Offline and presence updates.
- Chat: message and read events.
- WebRTC: join, leave, signal, and ICE candidate events.
- Emergency: request, accept, decline, and already-taken events.

## Configuration and local development

Client environment keys:

- `VITE_API_BASE_URL`
- `VITE_SOCKET_URL`
- `VITE_RAZORPAY_KEY_ID`

Server environment keys cover Node/port, MongoDB, JWT access/refresh secrets, Redis, Cloudinary, Razorpay/webhook, Resend/email mode/from address, optional MSG91, TURN server credentials, and client CORS origin. See `server/.env.example`; validation is centralized in `server/src/config/env.ts`.

Both `client/.env` and `server/.env` exist locally. Their values were deliberately not read or recorded.

Common commands (run from the relevant directory):

- Client: `npm install`, `npm run dev`, `npm run build`, `npm run lint`.
- Server: `npm install`, `npm run dev`, `npm run build`, `npm test`, `npm run test:coverage`.
- Server migration: `npm run migrate:psychologist-onboarding`.

The app also requires reachable MongoDB and Redis services plus valid third-party credentials. WebRTC outside simple peer-to-peer conditions requires a TURN server.

## Verification status at scan time

- Git working tree was clean before this context file was added.
- Neither `client/node_modules` nor `server/node_modules` existed.
- Builds and tests could not run because dependencies were not installed (`tsc` unavailable).
- Four server test files exist: auth validation, user validation, psychologist validation, and Razorpay provider tests.
- No client tests were found.

## Known gaps and cautions

- `client/src/lib/queryClient.ts` is an explicit placeholder; the project currently does not list TanStack Query.
- `server/src/modules/notification/channels/push.channel.ts` is a placeholder.
- SMS notification dispatch in `notification.worker.ts` is not implemented.
- Public organization committee data is generated from placeholder members.
- The original plan files may lag implemented routes and behavior; inspect code before making decisions.
- Preserve the Razorpay webhook raw-body ordering in `server/src/app.ts`; JSON parsing before signature verification will break the webhook.
- Timezone and appointment/session lifecycle logic is cross-cutting. Check both client utilities and server lifecycle/timing services when changing scheduling.
- Authentication/authorization is enforced in both route guards and server middleware; server enforcement is the security boundary.

## Fast orientation for future work

- UI route or screen: start at `client/src/app/router.tsx`, then the relevant `client/src/features/<feature>/` folder.
- REST behavior: start at `server/src/routes/index.ts`, then `server/src/modules/<module>/*.routes.ts` and follow controller -> service -> model.
- Real-time behavior: inspect `server/src/sockets/`, `client/src/lib/socket.ts`, and the relevant feature hook/store.
- Booking/scheduling: inspect appointment and availability modules plus `appointmentTiming.ts`, lifecycle services, slot generation queue/worker, and client booking store/components.
- Environment startup problems: inspect `server/src/config/env.ts`, `.env.example`, Mongo/Redis config, then `server/src/server.ts`.
- Product intent or older endpoint contracts: consult `plans/`, but reconcile against current code.
