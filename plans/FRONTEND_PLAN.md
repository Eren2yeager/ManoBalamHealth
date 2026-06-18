# ManoBalam — Frontend Plan (Client)

Stack: React (Vite) + TypeScript + Tailwind CSS + Zustand + Axios + socket.io-client

This document is written so an AI coding agent can implement it with minimal guessing, and so it stays in lockstep with `BACKEND_PLAN.md`. Every type in `types/global.types.ts` and every API function mirrors the backend's exact request/response contracts from `BACKEND_PLAN.md` section 3. If the backend contract changes, this file's matching type/function must change in the same sitting — they are not allowed to drift apart.

---

## 0. Project Initialization

### 0.1 Commands
```bash
npm create vite@latest client -- --template react-ts
cd client
npm install axios socket.io-client zustand luxon react-router-dom
npm install -D tailwindcss postcss autoprefixer @types/luxon
npx tailwindcss init -p
```

### 0.2 `tsconfig.json` additions (merge into Vite's generated file)
```json
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@/*": ["src/*"]
    }
  }
}
```
Also add matching `resolve.alias` in `vite.config.ts`:
```ts
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: { "@": path.resolve(__dirname, "./src") },
  },
});
```

### 0.3 `tailwind.config.ts`
```ts
import type { Config } from "tailwindcss";

export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: {
          50: "#f5f3ff",
          100: "#ede9fe",
          500: "#7c3aed",
          600: "#6d28d9",
          700: "#5b21b6",
        },
        crisis: {
          50: "#fef2f2",
          500: "#dc2626",
          600: "#b91c1c",
        },
      },
    },
  },
  plugins: [],
} satisfies Config;
```
Palette matches the lavender/purple tone from the client's mockups; `crisis` is a deliberately separate red scale used only for crisis banners/errors, never for general UI accents — keeps the one alarming color reserved for when it actually matters.

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
client/
├── src/
│   ├── app/
│   │   ├── App.tsx
│   │   ├── router.tsx
│   │   └── providers.tsx
│   │
│   ├── features/
│   │   ├── auth/
│   │   │   ├── components/
│   │   │   │   ├── LoginForm.tsx
│   │   │   │   ├── RegisterForm.tsx
│   │   │   │   └── OtpVerifyForm.tsx
│   │   │   ├── pages/
│   │   │   │   ├── LoginPage.tsx
│   │   │   │   └── RegisterPage.tsx
│   │   │   ├── store/
│   │   │   │   └── authStore.ts
│   │   │   ├── api/
│   │   │   │   └── auth.api.ts
│   │   │   └── types/
│   │   │       └── auth.types.ts
│   │   │
│   │   ├── profile/
│   │   │   ├── components/
│   │   │   │   ├── ProfileForm.tsx
│   │   │   │   └── AvatarUpload.tsx
│   │   │   ├── pages/
│   │   │   │   └── ProfilePage.tsx
│   │   │   ├── api/
│   │   │   │   └── profile.api.ts
│   │   │   └── types/
│   │   │       └── profile.types.ts
│   │   │
│   │   ├── psychologists/
│   │   │   ├── components/
│   │   │   │   ├── PsychologistCard.tsx
│   │   │   │   ├── PsychologistFilters.tsx
│   │   │   │   └── PsychologistProfileView.tsx
│   │   │   ├── pages/
│   │   │   │   ├── PsychologistListPage.tsx
│   │   │   │   └── PsychologistDetailPage.tsx
│   │   │   ├── store/
│   │   │   │   └── psychologistFilterStore.ts
│   │   │   ├── api/
│   │   │   │   └── psychologist.api.ts
│   │   │   └── types/
│   │   │       └── psychologist.types.ts
│   │   │
│   │   ├── availability/
│   │   │   ├── components/
│   │   │   │   ├── SlotPicker.tsx
│   │   │   │   └── AvailabilityRuleForm.tsx
│   │   │   ├── api/
│   │   │   │   └── availability.api.ts
│   │   │   └── types/
│   │   │       └── availability.types.ts
│   │   │
│   │   ├── booking/
│   │   │   ├── components/
│   │   │   │   ├── AllocationModeToggle.tsx
│   │   │   │   ├── ConsultationTypePicker.tsx
│   │   │   │   ├── ConcernForm.tsx
│   │   │   │   └── BookingSummary.tsx
│   │   │   ├── pages/
│   │   │   │   └── BookingFlowPage.tsx
│   │   │   ├── store/
│   │   │   │   └── bookingStore.ts
│   │   │   ├── api/
│   │   │   │   └── booking.api.ts
│   │   │   └── types/
│   │   │       └── booking.types.ts
│   │   │
│   │   ├── payment/
│   │   │   ├── components/
│   │   │   │   └── RazorpayCheckout.tsx
│   │   │   ├── api/
│   │   │   │   └── payment.api.ts
│   │   │   └── types/
│   │   │       └── payment.types.ts
│   │   │
│   │   ├── appointments/
│   │   │   ├── components/
│   │   │   │   ├── AppointmentCard.tsx
│   │   │   │   └── AppointmentList.tsx
│   │   │   ├── pages/
│   │   │   │   ├── MyAppointmentsPage.tsx
│   │   │   │   └── AppointmentDetailPage.tsx
│   │   │   ├── api/
│   │   │   │   └── appointment.api.ts
│   │   │   └── types/
│   │   │       └── appointment.types.ts
│   │   │
│   │   ├── session/
│   │   │   ├── components/
│   │   │   │   ├── ChatPanel.tsx
│   │   │   │   ├── MessageBubble.tsx
│   │   │   │   ├── VideoCallRoom.tsx
│   │   │   │   ├── AudioCallRoom.tsx
│   │   │   │   ├── CallControls.tsx
│   │   │   │   └── SessionTimer.tsx
│   │   │   ├── pages/
│   │   │   │   └── SessionRoomPage.tsx
│   │   │   ├── hooks/
│   │   │   │   ├── useWebRTC.ts
│   │   │   │   └── useChatMessages.ts
│   │   │   ├── store/
│   │   │   │   └── sessionStore.ts
│   │   │   ├── api/
│   │   │   │   └── session.api.ts
│   │   │   └── types/
│   │   │       └── session.types.ts
│   │   │
│   │   ├── feedback/
│   │   │   ├── components/
│   │   │   │   ├── RatingStars.tsx
│   │   │   │   └── FeedbackForm.tsx
│   │   │   ├── api/
│   │   │   │   └── feedback.api.ts
│   │   │   └── types/
│   │   │       └── feedback.types.ts
│   │   │
│   │   ├── assessment/
│   │   │   ├── components/
│   │   │   │   ├── AssessmentQuestion.tsx
│   │   │   │   ├── AssessmentProgress.tsx
│   │   │   │   └── AssessmentResult.tsx
│   │   │   ├── pages/
│   │   │   │   └── AssessmentPage.tsx
│   │   │   ├── store/
│   │   │   │   └── assessmentStore.ts
│   │   │   ├── api/
│   │   │   │   └── assessment.api.ts
│   │   │   └── types/
│   │   │       └── assessment.types.ts
│   │   │
│   │   ├── crisis/
│   │   │   ├── components/
│   │   │   │   ├── CrisisBanner.tsx
│   │   │   │   └── CrisisResourceList.tsx
│   │   │   ├── api/
│   │   │   │   └── crisis.api.ts
│   │   │   └── types/
│   │   │       └── crisis.types.ts
│   │   │
│   │   ├── emergency/
│   │   │   ├── components/
│   │   │   │   ├── EmergencyRequestButton.tsx
│   │   │   │   └── EmergencyWaitingScreen.tsx
│   │   │   ├── hooks/
│   │   │   │   └── useEmergencySocket.ts
│   │   │   ├── store/
│   │   │   │   └── emergencyStore.ts
│   │   │   └── types/
│   │   │       └── emergency.types.ts
│   │   │
│   │   └── admin/
│   │       ├── components/
│   │       │   ├── PsychologistVerificationCard.tsx
│   │       │   ├── ReportsChart.tsx
│   │       │   └── RefundModal.tsx
│   │       ├── pages/
│   │       │   ├── AdminDashboardPage.tsx
│   │       │   ├── AdminVerificationsPage.tsx
│   │       │   └── AdminReportsPage.tsx
│   │       ├── api/
│   │       │   └── admin.api.ts
│   │       └── types/
│   │           └── admin.types.ts
│   │
│   ├── components/
│   │   ├── ui/
│   │   │   ├── Button.tsx
│   │   │   ├── Input.tsx
│   │   │   ├── Card.tsx
│   │   │   ├── Modal.tsx
│   │   │   ├── Badge.tsx
│   │   │   └── Select.tsx
│   │   ├── layout/
│   │   │   ├── Navbar.tsx
│   │   │   ├── Sidebar.tsx
│   │   │   ├── BottomNav.tsx
│   │   │   └── DashboardLayout.tsx
│   │   └── feedback/
│   │       ├── Toast.tsx
│   │       ├── Spinner.tsx
│   │       └── ErrorBoundary.tsx
│   │
│   ├── lib/
│   │   ├── axios.ts
│   │   ├── socket.ts
│   │   ├── timezone.ts
│   │   └── queryClient.ts
│   │
│   ├── stores/
│   │   ├── userStore.ts
│   │   └── uiStore.ts
│   │
│   ├── routes/
│   │   ├── ProtectedRoute.tsx
│   │   └── RoleRoute.tsx
│   │
│   ├── hooks/
│   │   ├── useAuth.ts
│   │   ├── useDebounce.ts
│   │   └── useGeoCountry.ts
│   │
│   ├── types/
│   │   └── global.types.ts
│   │
│   ├── utils/
│   │   ├── formatters.ts
│   │   └── validators.ts
│   │
│   ├── assets/
│   ├── styles/
│   │   └── globals.css
│   │
│   ├── main.tsx
│   └── vite-env.d.ts
│
├── .env
├── .env.example
├── tailwind.config.ts
├── tsconfig.json
├── vite.config.ts
└── package.json
```

---

## 2. Core Shared Files — Exact Content

### 2.1 `src/types/global.types.ts`
This file mirrors the backend's response envelope and shared enums exactly — every feature's `types/*.types.ts` imports from here rather than redefining `Role`, `ConsultationMode`, etc. independently.

```ts
// Matches backend ApiResponse envelope (BACKEND_PLAN.md section 2.5) exactly.
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

// Matches backend constants/roles.constant.ts
export type Role = "patient" | "psychologist" | "admin";

export type ConsultationMode = "chat" | "audio" | "video";

export type AllocationMode = "manual" | "auto" | "emergency";

export type AppointmentStatus =
  | "pending_payment"
  | "confirmed"
  | "in_progress"
  | "completed"
  | "cancelled"
  | "no_show";

export type RiskLevel = "low" | "moderate" | "high" | "severe";

// Matches backend constants/errorCodes.constant.ts — frontend switches on these,
// never on the human-readable `message` string, since messages can change wording freely.
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

export interface Money {
  amount: number; // smallest currency unit — convert for display via utils/formatters.ts
  currency: string;
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface PaginationParams {
  page?: number;
  limit?: number;
}
```

### 2.2 `src/lib/axios.ts`
```ts
import axios, { AxiosError } from "axios";
import { ApiErrorResponse } from "@/types/global.types";
import { useUserStore } from "@/stores/userStore";

export const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  withCredentials: true, // sends httpOnly refresh cookie automatically
});

axiosInstance.interceptors.request.use((config) => {
  const token = useUserStore.getState().accessToken;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

let isRefreshing = false;
let refreshSubscribers: Array<(token: string) => void> = [];

axiosInstance.interceptors.response.use(
  (response) => response,
  async (error: AxiosError<ApiErrorResponse>) => {
    const originalRequest = error.config;
    if (error.response?.data?.code === "TOKEN_EXPIRED" && originalRequest && !isRefreshing) {
      isRefreshing = true;
      try {
        const { data } = await axiosInstance.post<{ data: { accessToken: string } }>(
          "/auth/refresh-token"
        );
        const newToken = data.data.accessToken;
        useUserStore.getState().setAccessToken(newToken);
        refreshSubscribers.forEach((cb) => cb(newToken));
        refreshSubscribers = [];
        isRefreshing = false;
        originalRequest.headers!.Authorization = `Bearer ${newToken}`;
        return axiosInstance(originalRequest);
      } catch (refreshError) {
        isRefreshing = false;
        useUserStore.getState().logout();
        window.location.href = "/login";
        return Promise.reject(refreshError);
      }
    }
    return Promise.reject(error);
  }
);
```
Note: this implements single-flight refresh (concurrent 401s while a refresh is already in-flight queue behind `refreshSubscribers` rather than each firing their own refresh call) — if the agent generates a simpler version without this, multiple simultaneous expired requests will race and can log the user out incorrectly. Flag this explicitly if simplifying.

### 2.3 `src/lib/socket.ts`
```ts
import { io, Socket } from "socket.io-client";
import { useUserStore } from "@/stores/userStore";

let socket: Socket | null = null;

export const getSocket = (): Socket => {
  if (!socket) {
    socket = io(import.meta.env.VITE_SOCKET_URL, {
      autoConnect: false,
      auth: (cb) => cb({ token: useUserStore.getState().accessToken }),
    });
  }
  return socket;
};

export const connectSocket = () => {
  const s = getSocket();
  if (!s.connected) s.connect();
  return s;
};

export const disconnectSocket = () => {
  socket?.disconnect();
};
```
Single singleton — every feature hook (`useChatMessages`, `useWebRTC`, `useEmergencySocket`) calls `getSocket()` and attaches/detaches its own listeners on mount/unmount, never creates a second `io()` instance.

### 2.4 `src/lib/timezone.ts`
```ts
import { DateTime } from "luxon";

export const getViewerTimezone = (): string =>
  Intl.DateTimeFormat().resolvedOptions().timeZone;

// Backend always sends UTC ISO strings — convert to viewer's local timezone for display.
export const formatInViewerTz = (
  isoUtc: string,
  format: string = "ccc, dd LLL yyyy, h:mm a"
): string => {
  return DateTime.fromISO(isoUtc, { zone: "utc" })
    .setZone(getViewerTimezone())
    .toFormat(format);
};

// Converts a viewer-local datetime (e.g. from a date/time picker) back to UTC ISO for sending to backend.
export const localToUtcIso = (localDateTime: DateTime): string => {
  return localDateTime.toUTC().toISO()!;
};
```

### 2.5 `src/stores/userStore.ts`
```ts
import { create } from "zustand";
import { Role } from "@/types/global.types";

interface CurrentUser {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  role: Role;
  avatarUrl?: string;
  isVerified: boolean;
}

interface UserState {
  user: CurrentUser | null;
  accessToken: string | null;
  isAuthenticated: boolean;
  setUser: (user: CurrentUser) => void;
  setAccessToken: (token: string) => void;
  logout: () => void;
}

export const useUserStore = create<UserState>((set) => ({
  user: null,
  accessToken: null,
  isAuthenticated: false,
  setUser: (user) => set({ user, isAuthenticated: true }),
  setAccessToken: (accessToken) => set({ accessToken }),
  logout: () => set({ user: null, accessToken: null, isAuthenticated: false }),
}));
```
Note: `accessToken` lives only in memory (Zustand state, not persisted to localStorage) — refresh token is the httpOnly cookie handling persistence across reloads. On app boot, `providers.tsx` should attempt one silent `POST /auth/refresh-token` call to re-hydrate `accessToken` + fetch `GET /users/me` before rendering the app, rather than assuming logged-out on every page refresh.

### 2.6 `src/routes/ProtectedRoute.tsx`
```tsx
import { Navigate, Outlet } from "react-router-dom";
import { useUserStore } from "@/stores/userStore";

export const ProtectedRoute = () => {
  const isAuthenticated = useUserStore((s) => s.isAuthenticated);
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  return <Outlet />;
};
```

### 2.7 `src/routes/RoleRoute.tsx`
```tsx
import { Navigate, Outlet } from "react-router-dom";
import { useUserStore } from "@/stores/userStore";
import { Role } from "@/types/global.types";

export const RoleRoute = ({ allowed }: { allowed: Role[] }) => {
  const user = useUserStore((s) => s.user);
  if (!user || !allowed.includes(user.role)) return <Navigate to="/home" replace />;
  return <Outlet />;
};
```

---

## 3. Routing Map

```
/                            -> Landing / marketing home (public)
/login, /register             -> Auth pages
/verify-otp

/home                          -> Patient dashboard (post-login)
/psychologists                 -> Browse/filter list
/psychologists/:id             -> Profile detail

/book                           -> Booking wizard (manual or auto mode)
/book/payment                   -> Razorpay checkout step

/appointments                   -> My appointments (upcoming + history)
/appointments/:id

/session/:appointmentId         -> Live session room (chat/audio/video)

/feedback/:appointmentId        -> Post-session feedback form

/assessment                      -> Self-assessment hub (choose type)
/assessment/:type                -> Take a specific screener
/assessment/:type/result         -> Score + crisis resources if flagged

/emergency                       -> Emergency request trigger + waiting screen

/profile                         -> Edit own profile

# Psychologist-only
/psychologist/dashboard
/psychologist/availability
/psychologist/appointments
/psychologist/session/:id        -> shares SessionRoomPage component, role-aware

# Admin-only
/admin/dashboard
/admin/verifications
/admin/reports
/admin/payments
```

`src/app/router.tsx` wraps everything except `/`, `/login`, `/register`, `/verify-otp` in `<ProtectedRoute />`; `/admin/*` additionally wraps in `<RoleRoute allowed={["admin"]} />`; `/psychologist/*` wraps in `<RoleRoute allowed={["psychologist"]} />`.

---

## 4. Environment Variables (`.env.example`)

```
VITE_API_BASE_URL=http://localhost:5000/api
VITE_SOCKET_URL=http://localhost:5000
VITE_RAZORPAY_KEY_ID=
```
`VITE_RAZORPAY_KEY_ID` is the public key only — never put `RAZORPAY_KEY_SECRET` in any frontend env file, it must only ever exist server-side.

This is part 1 of the expanded frontend plan (setup + shared core files + global types matching the backend exactly). Part 2 covers the full typed API layer per feature with exact function signatures matching every backend endpoint, part 3 covers component behavior specs in more depth, and part 4 covers the granular build order with manual test checklists. Continuing in the next section.

---

## 5. Typed API Layer — One Function Per Backend Endpoint

Every function returns the `data` field already unwrapped from the `ApiSuccessResponse` envelope (the axios call extracts `.data.data` so calling code never has to unwrap it manually) — but errors are left as thrown `AxiosError<ApiErrorResponse>` so calling code can read `error.response.data.code` to branch on `ErrorCodes`.

Pattern every `*.api.ts` file follows:
```ts
import { axiosInstance } from "@/lib/axios";
import { ApiSuccessResponse } from "@/types/global.types";
// ... feature-specific types

export const someAction = async (payload: SomeDto): Promise<SomeReturnType> => {
  const { data } = await axiosInstance.post<ApiSuccessResponse<SomeReturnType>>("/some/path", payload);
  return data.data;
};
```

### 5.1 `features/auth/types/auth.types.ts`
```ts
import { Role } from "@/types/global.types";

export interface RegisterDto {
  name: string;
  email?: string;
  phone?: string;
  password: string;
  role: "patient" | "psychologist";
  country: string;
  timezone: string;
}

export interface RegisterResponse {
  userId: string;
  email?: string;
  phone?: string;
  otpSentTo: "email" | "phone";
}

export interface VerifyOtpDto {
  userId: string;
  otp: string;
}

export interface AuthUser {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  role: Role;
  isVerified: boolean;
}

export interface AuthSuccessResponse {
  accessToken: string;
  user: AuthUser;
}

export interface LoginDto {
  emailOrPhone: string;
  password: string;
}
```

### 5.2 `features/auth/api/auth.api.ts`
```ts
import { axiosInstance } from "@/lib/axios";
import { ApiSuccessResponse } from "@/types/global.types";
import {
  RegisterDto, RegisterResponse, VerifyOtpDto, AuthSuccessResponse, LoginDto,
} from "../types/auth.types";

export const register = async (payload: RegisterDto): Promise<RegisterResponse> => {
  const { data } = await axiosInstance.post<ApiSuccessResponse<RegisterResponse>>("/auth/register", payload);
  return data.data;
};

export const verifyOtp = async (payload: VerifyOtpDto): Promise<AuthSuccessResponse> => {
  const { data } = await axiosInstance.post<ApiSuccessResponse<AuthSuccessResponse>>("/auth/verify-otp", payload);
  return data.data;
};

export const login = async (payload: LoginDto): Promise<AuthSuccessResponse> => {
  const { data } = await axiosInstance.post<ApiSuccessResponse<AuthSuccessResponse>>("/auth/login", payload);
  return data.data;
};

export const refreshToken = async (): Promise<{ accessToken: string }> => {
  const { data } = await axiosInstance.post<ApiSuccessResponse<{ accessToken: string }>>("/auth/refresh-token");
  return data.data;
};

export const logout = async (): Promise<void> => {
  await axiosInstance.post("/auth/logout");
};
```

### 5.3 `features/profile/types/profile.types.ts`
```ts
import { Role } from "@/types/global.types";

export interface UserProfile {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  role: Role;
  age?: number;
  gender?: "male" | "female" | "other" | "prefer_not_to_say";
  emergencyContact?: { name: string; phone: string };
  country: string;
  timezone: string;
  avatarUrl?: string;
  isVerified: boolean;
  createdAt: string;
}

export interface UpdateProfileDto {
  name?: string;
  age?: number;
  gender?: "male" | "female" | "other" | "prefer_not_to_say";
  emergencyContact?: { name: string; phone: string };
  timezone?: string;
}
```

### 5.4 `features/profile/api/profile.api.ts`
```ts
import { axiosInstance } from "@/lib/axios";
import { ApiSuccessResponse } from "@/types/global.types";
import { UserProfile, UpdateProfileDto } from "../types/profile.types";

export const getMe = async (): Promise<UserProfile> => {
  const { data } = await axiosInstance.get<ApiSuccessResponse<UserProfile>>("/users/me");
  return data.data;
};

export const updateMe = async (payload: UpdateProfileDto): Promise<UserProfile> => {
  const { data } = await axiosInstance.patch<ApiSuccessResponse<UserProfile>>("/users/me", payload);
  return data.data;
};

export const uploadAvatar = async (file: File): Promise<{ avatarUrl: string }> => {
  const form = new FormData();
  form.append("avatar", file);
  const { data } = await axiosInstance.post<ApiSuccessResponse<{ avatarUrl: string }>>(
    "/users/me/avatar",
    form,
    { headers: { "Content-Type": "multipart/form-data" } }
  );
  return data.data;
};
```

### 5.5 `features/psychologists/types/psychologist.types.ts`
```ts
import { Money, PaginationParams } from "@/types/global.types";

export interface PsychologistListItem {
  id: string;
  name: string;
  avatarUrl?: string;
  specialization: string[];
  languages: string[];
  experienceYears: number;
  consultationFee: Money;
  rating: { average: number; count: number };
  isOnline: boolean;
  bio: string;
}

export interface PsychologistDetail extends PsychologistListItem {
  licensedCountries: string[];
  verificationStatus?: "pending" | "approved" | "rejected"; // only present if requester is self or admin
}

export interface PsychologistListParams extends PaginationParams {
  specialization?: string; // comma-separated
  language?: string;
  country?: string;
  minRating?: number;
  sortBy?: "rating" | "experience" | "fee_asc" | "fee_desc";
}

export interface UpdatePsychologistProfileDto {
  specialization?: string[];
  languages?: string[];
  experienceYears?: number;
  consultationFee?: Money;
  bio?: string;
  licensedCountries?: string[];
  isAcceptingEmergency?: boolean;
}
```

### 5.6 `features/psychologists/api/psychologist.api.ts`
```ts
import { axiosInstance } from "@/lib/axios";
import { ApiSuccessResponse, PaginationMeta } from "@/types/global.types";
import {
  PsychologistListItem, PsychologistDetail, PsychologistListParams, UpdatePsychologistProfileDto,
} from "../types/psychologist.types";

export const listPsychologists = async (
  params: PsychologistListParams
): Promise<{ items: PsychologistListItem[]; meta: PaginationMeta }> => {
  const { data } = await axiosInstance.get<ApiSuccessResponse<PsychologistListItem[]>>("/psychologists", { params });
  return { items: data.data, meta: data.meta as PaginationMeta };
};

export const getPsychologistById = async (id: string): Promise<PsychologistDetail> => {
  const { data } = await axiosInstance.get<ApiSuccessResponse<PsychologistDetail>>(`/psychologists/${id}`);
  return data.data;
};

export const uploadCredentials = async (
  files: File[],
  type: "license" | "degree" | "id_proof"
): Promise<{ credentials: Array<{ docUrl: string; type: string; verified: boolean }> }> => {
  const form = new FormData();
  files.forEach((f) => form.append("documents", f));
  form.append("type", type);
  const { data } = await axiosInstance.post<ApiSuccessResponse<{ credentials: any[] }>>(
    "/psychologists/credentials",
    form,
    { headers: { "Content-Type": "multipart/form-data" } }
  );
  return data.data;
};

export const updateMyPsychologistProfile = async (
  payload: UpdatePsychologistProfileDto
): Promise<PsychologistDetail> => {
  const { data } = await axiosInstance.patch<ApiSuccessResponse<PsychologistDetail>>(
    "/psychologists/me/profile",
    payload
  );
  return data.data;
};
```

### 5.7 `features/availability/types/availability.types.ts`
```ts
import { ConsultationMode } from "@/types/global.types";

export interface AvailabilityRuleDto {
  dayOfWeek: 0 | 1 | 2 | 3 | 4 | 5 | 6;
  startTime: string; // "HH:mm"
  endTime: string;
  slotDurationMinutes: 30 | 45 | 60;
  modes: ConsultationMode[];
}

export interface SlotItem {
  slotId: string;
  startTime: string; // ISO UTC — convert via lib/timezone.ts before display
  endTime: string;
  mode: ConsultationMode;
  isBooked: boolean;
}
```

### 5.8 `features/availability/api/availability.api.ts`
```ts
import { axiosInstance } from "@/lib/axios";
import { ApiSuccessResponse } from "@/types/global.types";
import { AvailabilityRuleDto, SlotItem } from "../types/availability.types";

export const setRecurringRules = async (rules: AvailabilityRuleDto[]): Promise<{ rulesUpdated: number }> => {
  const { data } = await axiosInstance.patch<ApiSuccessResponse<{ rulesUpdated: number }>>(
    "/availability/me/rules",
    { rules }
  );
  return data.data;
};

export const getSlots = async (
  psychologistId: string,
  from: string,
  to: string,
  mode?: "chat" | "audio" | "video"
): Promise<SlotItem[]> => {
  const { data } = await axiosInstance.get<ApiSuccessResponse<SlotItem[]>>(
    `/availability/${psychologistId}/slots`,
    { params: { from, to, mode } }
  );
  return data.data;
};

export const blockSlot = async (slotId: string): Promise<{ slotId: string; isBlocked: true }> => {
  const { data } = await axiosInstance.patch<ApiSuccessResponse<{ slotId: string; isBlocked: true }>>(
    `/availability/slots/${slotId}/block`
  );
  return data.data;
};
```

### 5.9 `features/booking/types/booking.types.ts`
```ts
import { ConsultationMode, AllocationMode, Money } from "@/types/global.types";

export type CreateAppointmentDto =
  | {
      allocationMode: "manual";
      slotId: string;
      mode: ConsultationMode;
      concernDescription?: string;
    }
  | {
      allocationMode: "auto";
      preferredFrom: string;
      preferredTo: string;
      mode: ConsultationMode;
      specialization?: string;
      concernDescription?: string;
    };

export interface CreateAppointmentResponse {
  appointmentId: string;
  status: "pending_payment";
  psychologistId: string;
  scheduledAt: string;
  mode: ConsultationMode;
  fee: Money;
}
```

### 5.10 `features/booking/api/booking.api.ts`
```ts
import { axiosInstance } from "@/lib/axios";
import { ApiSuccessResponse } from "@/types/global.types";
import { CreateAppointmentDto, CreateAppointmentResponse } from "../types/booking.types";

export const createAppointment = async (
  payload: CreateAppointmentDto
): Promise<CreateAppointmentResponse> => {
  const { data } = await axiosInstance.post<ApiSuccessResponse<CreateAppointmentResponse>>(
    "/appointments",
    payload
  );
  return data.data;
};
```

### 5.11 `features/payment/types/payment.types.ts`
```ts
export interface CreateOrderResponse {
  razorpayOrderId: string;
  amount: number;
  currency: string;
  razorpayKeyId: string;
}

export interface VerifyPaymentDto {
  appointmentId: string;
  razorpayOrderId: string;
  razorpayPaymentId: string;
  razorpaySignature: string;
}

export interface VerifyPaymentResponse {
  appointmentId: string;
  status: "confirmed";
  paymentId: string;
}
```

### 5.12 `features/payment/api/payment.api.ts`
```ts
import { axiosInstance } from "@/lib/axios";
import { ApiSuccessResponse } from "@/types/global.types";
import { CreateOrderResponse, VerifyPaymentDto, VerifyPaymentResponse } from "../types/payment.types";

export const createOrder = async (appointmentId: string): Promise<CreateOrderResponse> => {
  const { data } = await axiosInstance.post<ApiSuccessResponse<CreateOrderResponse>>(
    "/payments/create-order",
    { appointmentId }
  );
  return data.data;
};

export const verifyPayment = async (payload: VerifyPaymentDto): Promise<VerifyPaymentResponse> => {
  const { data } = await axiosInstance.post<ApiSuccessResponse<VerifyPaymentResponse>>(
    "/payments/verify",
    payload
  );
  return data.data;
};
```

### 5.13 `features/appointments/types/appointment.types.ts`
```ts
import { ConsultationMode, AppointmentStatus, AllocationMode, PaginationParams, Money } from "@/types/global.types";

export interface AppointmentListItem {
  id: string;
  otherParty: { id: string; name: string; avatarUrl?: string };
  mode: ConsultationMode;
  status: AppointmentStatus;
  scheduledAt: string;
  allocationMode: AllocationMode;
}

export interface AppointmentDetail {
  id: string;
  patient: { id: string; name: string; avatarUrl?: string };
  psychologist: { id: string; name: string; avatarUrl?: string };
  mode: ConsultationMode;
  status: AppointmentStatus;
  scheduledAt: string;
  concernDescription?: string;
  allocationMode: AllocationMode;
  payment: { status: string; amount: number; currency: string } | null;
}

export interface AppointmentListParams extends PaginationParams {
  status?: AppointmentStatus;
  upcoming?: boolean;
}
```

### 5.14 `features/appointments/api/appointment.api.ts`
```ts
import { axiosInstance } from "@/lib/axios";
import { ApiSuccessResponse, PaginationMeta } from "@/types/global.types";
import { AppointmentListItem, AppointmentDetail, AppointmentListParams } from "../types/appointment.types";

export const getMyAppointments = async (
  params: AppointmentListParams
): Promise<{ items: AppointmentListItem[]; meta: PaginationMeta }> => {
  const { data } = await axiosInstance.get<ApiSuccessResponse<AppointmentListItem[]>>(
    "/appointments/me",
    { params }
  );
  return { items: data.data, meta: data.meta as PaginationMeta };
};

export const getAppointmentById = async (id: string): Promise<AppointmentDetail> => {
  const { data } = await axiosInstance.get<ApiSuccessResponse<AppointmentDetail>>(`/appointments/${id}`);
  return data.data;
};

export const cancelAppointment = async (
  id: string,
  reason?: string
): Promise<{ id: string; status: "cancelled" }> => {
  const { data } = await axiosInstance.patch<ApiSuccessResponse<{ id: string; status: "cancelled" }>>(
    `/appointments/${id}/cancel`,
    { reason }
  );
  return data.data;
};
```

### 5.15 `features/session/types/session.types.ts`
```ts
import { ConsultationMode } from "@/types/global.types";

export interface IceServer {
  urls: string;
  username?: string;
  credential?: string;
}

export interface SessionDetail {
  sessionId: string;
  appointmentId: string;
  mode: ConsultationMode;
  roomId: string;
  status: "not_started" | "active" | "ended";
  startedAt?: string;
  iceServers: IceServer[];
}
```

### 5.16 `features/session/api/session.api.ts`
```ts
import { axiosInstance } from "@/lib/axios";
import { ApiSuccessResponse } from "@/types/global.types";
import { SessionDetail } from "../types/session.types";

export const getSession = async (appointmentId: string): Promise<SessionDetail> => {
  const { data } = await axiosInstance.get<ApiSuccessResponse<SessionDetail>>(`/sessions/${appointmentId}`);
  return data.data;
};

export const updateSessionNotes = async (
  sessionId: string,
  notes: string
): Promise<{ id: string; notesUpdated: true }> => {
  const { data } = await axiosInstance.patch<ApiSuccessResponse<{ id: string; notesUpdated: true }>>(
    `/sessions/${sessionId}/notes`,
    { notes }
  );
  return data.data;
};
```
Note: `getSession` should never be called by a frontend role other than the two appointment participants — but enforce that server-side regardless (already specified in `BACKEND_PLAN.md` 3.7), don't rely on the frontend simply not calling it as the actual security boundary.

### 5.17 `features/session/types/chat.types.ts` (lives alongside session feature since chat is session-scoped)
```ts
export interface ChatMessage {
  id: string;
  senderId: string;
  content: string;
  attachmentUrl?: string;
  sentAt: string;
  readAt?: string;
}
```

### 5.18 `features/session/api/chat.api.ts`
```ts
import { axiosInstance } from "@/lib/axios";
import { ApiSuccessResponse, PaginationMeta, PaginationParams } from "@/types/global.types";
import { ChatMessage } from "../types/chat.types";

export const getChatHistory = async (
  sessionId: string,
  params: PaginationParams
): Promise<{ items: ChatMessage[]; meta: PaginationMeta }> => {
  const { data } = await axiosInstance.get<ApiSuccessResponse<ChatMessage[]>>(
    `/chat/${sessionId}/history`,
    { params }
  );
  return { items: data.data, meta: data.meta as PaginationMeta };
};
```

### 5.19 `features/feedback/types/feedback.types.ts`
```ts
import { PaginationParams } from "@/types/global.types";

export interface SubmitFeedbackDto {
  appointmentId: string;
  rating: number;
  comment?: string;
  continueWithSamePsychologist?: boolean;
}

export interface PsychologistFeedbackItem {
  rating: number;
  comment?: string;
  patientName: string;
  createdAt: string;
}
```

### 5.20 `features/feedback/api/feedback.api.ts`
```ts
import { axiosInstance } from "@/lib/axios";
import { ApiSuccessResponse, PaginationMeta, PaginationParams } from "@/types/global.types";
import { SubmitFeedbackDto, PsychologistFeedbackItem } from "../types/feedback.types";

export const submitFeedback = async (payload: SubmitFeedbackDto): Promise<{ id: string }> => {
  const { data } = await axiosInstance.post<ApiSuccessResponse<{ id: string }>>("/feedback", payload);
  return data.data;
};

export const getPsychologistFeedback = async (
  psychologistId: string,
  params: PaginationParams
): Promise<{ items: PsychologistFeedbackItem[]; meta: PaginationMeta }> => {
  const { data } = await axiosInstance.get<ApiSuccessResponse<PsychologistFeedbackItem[]>>(
    `/feedback/psychologist/${psychologistId}`,
    { params }
  );
  return { items: data.data, meta: data.meta as PaginationMeta };
};
```

### 5.21 `features/assessment/types/assessment.types.ts`
```ts
import { RiskLevel } from "@/types/global.types";

export type AssessmentType = "anxiety" | "stress" | "depression";

export interface AssessmentQuestionOption {
  text: string;
  score: number;
}

export interface AssessmentQuestionItem {
  id: string;
  text: string;
  options: AssessmentQuestionOption[];
}

export interface AssessmentTemplate {
  templateId: string;
  type: AssessmentType;
  title: string;
  questions: AssessmentQuestionItem[];
}

export interface SubmitAssessmentDto {
  templateId: string;
  answers: Array<{ questionId: string; selectedScore: number }>;
}

export interface CrisisResourceItem {
  helplineName: string;
  phoneNumber: string;
  availableHours: string;
  website?: string;
}

export interface AssessmentResult {
  resultId: string;
  totalScore: number;
  riskLevel: RiskLevel;
  triggeredCrisisFlow: boolean;
  crisisResources?: CrisisResourceItem[];
}
```

### 5.22 `features/assessment/api/assessment.api.ts`
```ts
import { axiosInstance } from "@/lib/axios";
import { ApiSuccessResponse } from "@/types/global.types";
import { AssessmentTemplate, SubmitAssessmentDto, AssessmentResult, AssessmentType } from "../types/assessment.types";

export const getAssessmentTemplate = async (type: AssessmentType): Promise<AssessmentTemplate> => {
  const { data } = await axiosInstance.get<ApiSuccessResponse<AssessmentTemplate>>(
    `/assessments/templates/${type}`
  );
  return data.data;
};

export const submitAssessment = async (payload: SubmitAssessmentDto): Promise<AssessmentResult> => {
  const { data } = await axiosInstance.post<ApiSuccessResponse<AssessmentResult>>(
    "/assessments/submit",
    payload
  );
  return data.data;
};
```

### 5.23 `features/crisis/types/crisis.types.ts`
```ts
export interface CrisisResource {
  helplineName: string;
  phoneNumber: string;
  availableHours: string;
  website?: string;
}
```

### 5.24 `features/crisis/api/crisis.api.ts`
```ts
import { axiosInstance } from "@/lib/axios";
import { ApiSuccessResponse } from "@/types/global.types";
import { CrisisResource } from "../types/crisis.types";

export const getCrisisResources = async (country: string): Promise<CrisisResource[]> => {
  const { data } = await axiosInstance.get<ApiSuccessResponse<CrisisResource[]>>(
    "/crisis/resources",
    { params: { country } }
  );
  return data.data;
};
```

### 5.25 `features/admin/types/admin.types.ts`
```ts
import { PaginationParams, AppointmentStatus, Money } from "@/types/global.types";

export interface PendingPsychologistItem {
  id: string;
  name: string;
  email?: string;
  credentials: Array<{ docUrl: string; type: string }>;
  submittedAt: string;
}

export interface VerifyPsychologistDto {
  decision: "approved" | "rejected";
  rejectionReason?: string;
}

export interface AdminAppointmentItem {
  id: string;
  patient: { id: string; name: string };
  psychologist: { id: string; name: string };
  status: AppointmentStatus;
  scheduledAt: string;
}

export interface AdminAppointmentParams extends PaginationParams {
  status?: AppointmentStatus;
}

export interface AdminReport {
  totalAppointments: number;
  totalRevenue: Money;
  newUsers: number;
  appointmentsByStatus: Record<string, number>;
  topSpecializations: Array<{ specialization: string; count: number }>;
}

export interface RefundDto {
  reason: string;
  amount?: number;
}
```

### 5.26 `features/admin/api/admin.api.ts`
```ts
import { axiosInstance } from "@/lib/axios";
import { ApiSuccessResponse, PaginationMeta, PaginationParams } from "@/types/global.types";
import {
  PendingPsychologistItem, VerifyPsychologistDto, AdminAppointmentItem,
  AdminAppointmentParams, AdminReport, RefundDto,
} from "../types/admin.types";

export const getPendingPsychologists = async (
  params: PaginationParams
): Promise<{ items: PendingPsychologistItem[]; meta: PaginationMeta }> => {
  const { data } = await axiosInstance.get<ApiSuccessResponse<PendingPsychologistItem[]>>(
    "/admin/psychologists/pending",
    { params }
  );
  return { items: data.data, meta: data.meta as PaginationMeta };
};

export const verifyPsychologist = async (
  id: string,
  payload: VerifyPsychologistDto
): Promise<{ id: string; verificationStatus: "approved" | "rejected" }> => {
  const { data } = await axiosInstance.patch<ApiSuccessResponse<{ id: string; verificationStatus: "approved" | "rejected" }>>(
    `/admin/psychologists/${id}/verify`,
    payload
  );
  return data.data;
};

export const getAdminAppointments = async (
  params: AdminAppointmentParams
): Promise<{ items: AdminAppointmentItem[]; meta: PaginationMeta }> => {
  const { data } = await axiosInstance.get<ApiSuccessResponse<AdminAppointmentItem[]>>(
    "/admin/appointments",
    { params }
  );
  return { items: data.data, meta: data.meta as PaginationMeta };
};

export const getAdminReports = async (from: string, to: string): Promise<AdminReport> => {
  const { data } = await axiosInstance.get<ApiSuccessResponse<AdminReport>>(
    "/admin/reports",
    { params: { from, to } }
  );
  return data.data;
};

export const refundPayment = async (
  paymentId: string,
  payload: RefundDto
): Promise<{ paymentId: string; status: "refunded"; refundedAmount: number }> => {
  const { data } = await axiosInstance.patch<ApiSuccessResponse<{ paymentId: string; status: "refunded"; refundedAmount: number }>>(
    `/admin/payments/${paymentId}/refund`,
    payload
  );
  return data.data;
};
```

---

## 6. Socket Event Contracts (must match `BACKEND_PLAN.md` section 5 exactly)

`src/features/session/hooks/useChatMessages.ts`, `useWebRTC.ts`, and `features/emergency/hooks/useEmergencySocket.ts` consume these. Event names and payload shapes below are copied verbatim from the backend plan — if the backend changes an event name or payload, this section must be updated in the same sitting.

### 6.1 Presence
```ts
// emit
socket.emit("presence:online");

// listen
socket.on("presence:update", (payload: { psychologistId: string; isOnline: boolean }) => {});
```

### 6.2 Chat
```ts
// emit
socket.emit("chat:join", { sessionId: string });
socket.emit("chat:message", { sessionId: string; content: string; attachmentUrl?: string });
socket.emit("chat:typing", { sessionId: string });

// listen
socket.on("chat:message", (payload: { message: ChatMessage }) => {});
socket.on("chat:typing", (payload: { userId: string }) => {});
```

### 6.3 WebRTC Signaling
```ts
// emit
socket.emit("webrtc:offer", { sessionId: string; sdp: RTCSessionDescriptionInit });
socket.emit("webrtc:answer", { sessionId: string; sdp: RTCSessionDescriptionInit });
socket.emit("webrtc:ice-candidate", { sessionId: string; candidate: RTCIceCandidateInit });
socket.emit("webrtc:end-call", { sessionId: string });

// listen
socket.on("webrtc:offer", (payload: { sdp: RTCSessionDescriptionInit; fromUserId: string }) => {});
socket.on("webrtc:answer", (payload: { sdp: RTCSessionDescriptionInit; fromUserId: string }) => {});
socket.on("webrtc:ice-candidate", (payload: { candidate: RTCIceCandidateInit; fromUserId: string }) => {});
socket.on("webrtc:call-ended", () => {});
```

### 6.4 Emergency Broadcast
```ts
// patient emits
socket.emit("emergency:request", { patientId: string; concern: string; country: string });

// psychologist listens
socket.on("emergency:incoming", (payload: { patientId: string; concern: string; requestId: string }) => {});

// psychologist emits
socket.emit("emergency:accept", { requestId: string });

// winning psychologist listens
socket.on("emergency:assigned", (payload: { sessionId: string }) => {});

// patient listens
socket.on("emergency:matched", (payload: { psychologistId: string; sessionId: string }) => {});

// losing psychologists listen
socket.on("emergency:already_taken", (payload: { requestId: string }) => {});
```
Frontend must also handle a client-side timeout (e.g. 60s with no `emergency:matched` received) — this is a frontend-only concern, not a separate backend event; see `EmergencyWaitingScreen.tsx` behavior spec below.

---

## 7. Key Component Behavior Specs

### 7.1 `features/auth/store/authStore.ts`
Holds only transient auth-flow state (e.g. the `userId` returned from register, pending OTP state) — NOT the logged-in user, which lives in the global `stores/userStore.ts`. Cleared once verification completes.
```ts
import { create } from "zustand";

interface AuthFlowState {
  pendingUserId: string | null;
  otpSentTo: "email" | "phone" | null;
  setPendingVerification: (userId: string, sentTo: "email" | "phone") => void;
  clear: () => void;
}

export const useAuthStore = create<AuthFlowState>((set) => ({
  pendingUserId: null,
  otpSentTo: null,
  setPendingVerification: (userId, sentTo) => set({ pendingUserId: userId, otpSentTo: sentTo }),
  clear: () => set({ pendingUserId: null, otpSentTo: null }),
}));
```

### 7.2 `features/booking/store/bookingStore.ts`
Wizard state across the multi-step booking flow. Must be explicitly cleared on successful booking completion AND on the user navigating away from `/book/*` routes entirely (add a cleanup effect in `BookingFlowPage` on unmount) — stale wizard state leaking into a later booking session is a real bug class here.
```ts
import { create } from "zustand";
import { ConsultationMode } from "@/types/global.types";

interface BookingState {
  allocationMode: "manual" | "auto" | null;
  selectedPsychologistId: string | null;
  selectedSlotId: string | null;
  preferredWindow: { from: string; to: string } | null;
  mode: ConsultationMode | null;
  specialization: string | null;
  concernDescription: string;
  setAllocationMode: (mode: "manual" | "auto") => void;
  setManualSelection: (psychologistId: string, slotId: string) => void;
  setAutoSelection: (from: string, to: string, specialization?: string) => void;
  setMode: (mode: ConsultationMode) => void;
  setConcern: (text: string) => void;
  reset: () => void;
}

const initialState = {
  allocationMode: null,
  selectedPsychologistId: null,
  selectedSlotId: null,
  preferredWindow: null,
  mode: null,
  specialization: null,
  concernDescription: "",
};

export const useBookingStore = create<BookingState>((set) => ({
  ...initialState,
  setAllocationMode: (allocationMode) => set({ allocationMode }),
  setManualSelection: (selectedPsychologistId, selectedSlotId) => set({ selectedPsychologistId, selectedSlotId }),
  setAutoSelection: (from, to, specialization) => set({ preferredWindow: { from, to }, specialization }),
  setMode: (mode) => set({ mode }),
  setConcern: (concernDescription) => set({ concernDescription }),
  reset: () => set(initialState),
}));
```

### 7.3 `AllocationModeToggle.tsx`
Two-tab segmented control: "Choose my psychologist" vs "Match me automatically." On selection, calls `useBookingStore().setAllocationMode()` and the parent `BookingFlowPage` conditionally renders either the psychologist-list-then-slot-picker sub-flow (manual) or the time-window-plus-specialization sub-flow (auto). No direct API calls in this component — it only sets wizard state.

### 7.4 `SlotPicker.tsx`
Fetches via `getSlots(psychologistId, from, to, mode)`. Renders every `startTime`/`endTime` through `formatInViewerTz()` from `lib/timezone.ts` — never render the raw ISO string and never assume the viewer's timezone matches the psychologist's. On slot selection, calls `useBookingStore().setManualSelection()`.

### 7.5 `RazorpayCheckout.tsx`
```tsx
// Behavior, not full implementation:
// 1. On mount, call payment.api.createOrder(appointmentId) -> get { razorpayOrderId, amount, currency, razorpayKeyId }
// 2. Load Razorpay checkout script (https://checkout.razorpay.com/v1/checkout.js) if not already loaded
// 3. Open Razorpay checkout widget with order details
// 4. On success callback, call payment.api.verifyPayment({ appointmentId, razorpayOrderId, razorpayPaymentId, razorpaySignature })
// 5. On verify success, navigate to /appointments/:id with a confirmed-state toast
// 6. On Razorpay widget failure/dismissal, show retry option, do NOT assume payment failed permanently — user may have just closed the modal
```
Critical: never mark the UI as "payment successful" purely from the Razorpay client-side success callback without calling `/payments/verify` and getting a 200 back — the signature check is what actually confirms it, the client callback alone is not trustworthy (this mirrors the backend's own warning in `BACKEND_PLAN.md` 3.6).

### 7.6 `features/session/hooks/useWebRTC.ts`
```ts
// Behavior spec (full RTCPeerConnection wiring, not shown in full here):
// 1. On mount: fetch session via session.api.getSession(appointmentId) to get iceServers
// 2. Create RTCPeerConnection with { iceServers } from the response (includes both STUN and TURN entries)
// 3. Get local media via navigator.mediaDevices.getUserMedia({ video: mode === "video", audio: true })
// 4. Wire onicecandidate -> socket.emit("webrtc:ice-candidate", ...)
// 5. Wire ontrack -> set remote stream into component state for rendering
// 6. Caller creates offer, emits "webrtc:offer"; callee listens "webrtc:offer", creates answer, emits "webrtc:answer"
// 7. Both sides listen "webrtc:ice-candidate" and call pc.addIceCandidate()
// 8. CRITICAL cleanup on unmount: pc.close(), stop all local media tracks via track.stop(),
//    remove all socket listeners attached by this hook specifically (not the whole socket).
//    Leaking this is the single most common bug in this feature — treat cleanup as equally
//    important as the connection logic itself, not an afterthought.
```

### 7.7 `EmergencyRequestButton.tsx` + `EmergencyWaitingScreen.tsx`
On click: `connectSocket()` if not already connected, emit `emergency:request`, set `useEmergencyStore` status to `"searching"`, start a 60-second client-side countdown. Listens for `emergency:matched` → navigate to `/session/:sessionId`. If 60s elapses with no match: set status to `"timeout"`, render a message plus the `CrisisResourceList` component inline (fetch via `crisis.api.getCrisisResources(userCountry)`) — the patient must never be left on a bare spinner with no fallback path.

### 7.8 `CrisisBanner.tsx`
Rendered whenever an assessment result returns `triggeredCrisisFlow: true`, or via a persistent help icon in the navbar that's always accessible. Displays `helplineName`, `phoneNumber` (as a tappable `tel:` link on mobile), `availableHours`. Acknowledgment required to dismiss (a confirm button, not an X), but never traps the user — they can still navigate elsewhere.

### 7.9 `AssessmentQuestion.tsx`
One question per screen, progress shown via `AssessmentProgress.tsx`. Answers accumulate in `assessmentStore.ts` until the final question, then a single `submitAssessment()` call fires — not one API call per answer.

---

## 8. Granular Build Order with Manual Test Checklists

Mirrors `BACKEND_PLAN.md` section 6 step numbering loosely, but frontend steps can start once the corresponding backend module is testable via Postman — doesn't need to wait for 100% backend completion.

**[x] Step 1 — Project scaffold**
Files: everything in section 0, `src/types/global.types.ts`, `src/lib/axios.ts`, `src/lib/timezone.ts`, `src/stores/userStore.ts`, `src/stores/uiStore.ts`, `components/ui/Button.tsx`, `Input.tsx`, `Card.tsx` (minimal versions), `src/app/App.tsx`, `src/app/router.tsx` (just `/` landing for now), `src/main.tsx`.
Test: `npm run dev` serves the landing page with no console errors.

**[x] Step 2 — Auth flow**
Files: all of `features/auth/`, `routes/ProtectedRoute.tsx`, `routes/RoleRoute.tsx`, wire into `router.tsx`.
Test (against the running backend from Backend Step 2): Register → see OTP form render with correct `otpSentTo` value → enter OTP (check email/SMS or backend logs for the code in dev) → land on `/home` authenticated. Refresh the page — confirm session persists via silent refresh-token call, doesn't bounce to `/login`. Log out — confirm redirected and token cleared.

**[x] Step 3 — Profile**
Files: all of `features/profile/`.
Test: edit name/age/gender, confirm persists on reload; upload an avatar image, confirm Cloudinary URL renders.

**[x] Step 4 — Psychologist browse**
Files: all of `features/psychologists/`.
Test: as a patient, browse list, apply a specialization filter, open a detail page. As the psychologist test account from Backend Step 4, edit own profile fields and confirm they reflect on the public detail page.

**[ ] Step 5 — Availability + booking (manual mode)**
Files: all of `features/availability/`, all of `features/booking/` (manual sub-flow only first).
Test: as psychologist, set recurring rules; as patient, view that psychologist's slots in your OWN local timezone, select one, fill concern text, reach the payment step (don't complete payment yet — that's Step 6). Confirm a slot disappears/shows booked for other viewers immediately after selection-and-hold (test by opening two browser sessions).

**[ ] Step 6 — Payment**
Files: all of `features/payment/`.
Test: complete a real Razorpay test-mode payment end to end (use Razorpay's documented test UPI ID or test card), confirm appointment flips to `confirmed`, confirm a failed/cancelled payment leaves the appointment recoverable (retry option) rather than stuck.

**[ ] Step 7 — Appointments list/detail**
Files: all of `features/appointments/`.
Test: confirm the booked appointment from Step 6 shows up in "My Appointments" with correct local-time display; test cancel flow on a different test appointment.

**[ ] Step 8 — Auto allocation mode**
Files: complete the auto sub-flow in `features/booking/`.
Test: book via auto mode with a time window, confirm correct psychologist gets assigned per backend logic; test the "no psychologist available" error path renders a sensible message, not a raw error dump.

**[ ] Step 9 — Socket connection + presence**
Files: `src/lib/socket.ts`, presence-related wiring in psychologist dashboard (show online toggle for psychologist role) and in `PsychologistCard.tsx` (show online indicator for patients browsing).
Test: toggle psychologist online in one tab, confirm the online dot updates live in another tab browsing the psychologist list, without a page refresh.

**[ ] Step 10 — Chat**
Files: `features/session/components/ChatPanel.tsx`, `MessageBubble.tsx`, `useChatMessages.ts`, `session.api.ts`, `chat.api.ts`.
Test: with two test accounts (patient + their booked psychologist) both on `/session/:appointmentId`, send messages both directions, confirm real-time delivery and confirm chat history persists correctly on page reload via the REST history endpoint.

**[ ] Step 11 — WebRTC audio/video**
Files: `useWebRTC.ts`, `VideoCallRoom.tsx`, `AudioCallRoom.tsx`, `CallControls.tsx`, `SessionTimer.tsx`.
Test: complete a real call between two devices on DIFFERENT networks (not same wifi) to actually exercise the TURN server, not just STUN — this is the test that catches the most common "works on my machine" production failure. Confirm mute/camera-off controls work, confirm ending the call cleanly releases the camera/mic (check the browser's tab indicator goes away).

**[ ] Step 12 — Feedback**
Files: all of `features/feedback/`.
Test: after a completed test session, submit feedback, confirm duplicate submission is blocked client-side too (not just relying on the backend 409) with a clear "already submitted" state rather than a confusing error.

**[ ] Step 13 — Assessment + Crisis**
Files: all of `features/assessment/`, all of `features/crisis/
Test: complete a low-risk run through (no crisis banner) and a deliberately high-risk test answer set (confirm `CrisisBanner` renders immediately with real resource data, not placeholder text).

**[ ] Step 14 — Emergency flow**
Files: all of `features/emergency/`.
Test: with two psychologist test accounts online and emergency-accepting, trigger from a patient account, confirm only one psychologist's UI transitions to the session while the other sees "already taken." Test the 60-second timeout path explicitly by not accepting from either test account.

**[ ] Step 15 — Psychologist + Admin dashboards**
Files: rest of `features/admin/` pages, psychologist-specific dashboard pages.
Test: full admin walkthrough — approve a pending psychologist, view all appointments, pull a report for a date range, process a refund.

**[ ] Step 16 — Responsive + polish pass**
Tasks: test every page at mobile width (the source mockups are mobile-first), confirm `BottomNav` vs `Sidebar` switch correctly by viewport, audit every API-calling component for a loading state and an error state (not just the happy path), confirm `ErrorBoundary` catches and displays a recoverable UI rather than a blank white screen on an unexpected render error.