import { createBrowserRouter } from "react-router-dom";
import { LandingPage } from "../features/shared/pages/LandingPage";
import { LoginPage } from "../features/auth/pages/LoginPage";
import { RegisterPage } from "../features/auth/pages/RegisterPage";
import { VerifyOtpPage } from "../features/auth/pages/VerifyOtpPage";
import { HomePage } from "../features/shared/pages/HomePage";
import { ProfilePage } from "../features/profile/pages/ProfilePage";
import { PsychologistListPage } from "../features/psychologists/pages/PsychologistListPage";
import { PsychologistDetailPage } from "../features/psychologists/pages/PsychologistDetailPage";
import { PsychologistDashboard } from "../features/psychologists/pages/PsychologistDashboard";
import { BookingFlowPage } from "../features/booking/pages/BookingFlowPage";
import { MyAppointmentsPage } from "../features/appointments/pages/MyAppointmentsPage";
import { AppointmentDetailPage } from "../features/appointments/pages/AppointmentDetailPage";
import { SessionRoomPage } from "../features/session/pages/SessionRoomPage";
import { ProtectedRoute } from "../routes/ProtectedRoute";
import { RoleRoute } from "../routes/RoleRoute";

const router = createBrowserRouter([
  {
    path: "/",
    element: <LandingPage />,
  },
  {
    path: "/login",
    element: <LoginPage />,
  },
  {
    path: "/register",
    element: <RegisterPage />,
  },
  {
    path: "/verify-otp",
    element: <VerifyOtpPage />,
  },
  {
    element: <ProtectedRoute />,
    children: [
      {
        path: "/home",
        element: <HomePage />,
      },
      {
        path: "/profile",
        element: <ProfilePage />,
      },
      {
        path: "/psychologists",
        element: <PsychologistListPage />,
      },
      {
        path: "/psychologists/:id",
        element: <PsychologistDetailPage />,
      },
      {
        path: "/booking",
        element: <BookingFlowPage />,
      },
      {
        path: "/booking/:psychologistId",
        element: <BookingFlowPage />,
      },
      {
        path: "/appointments",
        element: <MyAppointmentsPage />,
      },
      {
        path: "/appointments/:id",
        element: <AppointmentDetailPage />,
      },
      {
        path: "/session/:appointmentId",
        element: <SessionRoomPage />,
      },
    ],
  },
  {
    element: (
      <RoleRoute allowed={["psychologist"]} />
    ),
    children: [
      {
        path: "/psychologist/dashboard",
        element: <PsychologistDashboard />,
      },
      {
        path: "/psychologist/session/:appointmentId",
        element: <SessionRoomPage />,
      },
    ],
  },
]);

export { router };

