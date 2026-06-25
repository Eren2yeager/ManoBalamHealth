import { createBrowserRouter } from "react-router-dom";

// Public
import { LandingPage } from "../features/shared/pages/LandingPage";
import { LoginPage } from "../features/auth/pages/LoginPage";
import { RegisterPage } from "../features/auth/pages/RegisterPage";
import { VerifyOtpPage } from "../features/auth/pages/VerifyOtpPage";
import { ForgotPasswordPage } from "../features/auth/pages/ForgotPasswordPage";
import { ResetPasswordPage } from "../features/auth/pages/ResetPasswordPage";
import { AboutPage } from "../features/public-site/pages/AboutPage";
import { AboutDetailPage } from "../features/public-site/pages/AboutDetailPage";
import { OrganizationDetailPage } from "../features/public-site/pages/OrganizationDetailPage";
import { ServiceDetailPage } from "../features/public-site/pages/ServiceDetailPage";
import { MentalHealthAssessmentPage } from "../features/public-site/pages/MentalHealthAssessmentPage";
import { EventsAchievementsPage } from "../features/public-site/pages/EventsAchievementsPage";
import { FAQPage } from "../features/public-site/pages/FAQPage";
import { ContactPage } from "../features/public-site/pages/ContactPage";
import { PublicNotFoundPage } from "../features/public-site/pages/PublicNotFoundPage";
import { LegalPage } from "../features/public-site/pages/LegalPage";

// Protected (all roles)
import { HomePage } from "../features/shared/pages/HomePage";
import { ProfilePage } from "../features/profile/pages/ProfilePage";
import { PsychologistListPage } from "../features/psychologists/pages/PsychologistListPage";
import { PsychologistDetailPage } from "../features/psychologists/pages/PsychologistDetailPage";
import { BookingFlowPage } from "../features/booking/pages/BookingFlowPage";
import { MyAppointmentsPage } from "../features/appointments/pages/MyAppointmentsPage";
import { AppointmentDetailPage } from "../features/appointments/pages/AppointmentDetailPage";
import { SessionRoomPage } from "../features/session/pages/SessionRoomPage";
import { FeedbackPage } from "../features/feedback/pages/FeedbackPage";
import { AssessmentHubPage } from "../features/assessment/pages/AssessmentHubPage";
import { AssessmentPage } from "../features/assessment/pages/AssessmentPage";
import { EmergencyPage } from "../features/emergency/pages/EmergencyPage";
import { EmergencySessionPage } from "../features/emergency/pages/EmergencySessionPage";

// Psychologist-only
import { PsychologistDashboard } from "../features/psychologists/pages/PsychologistDashboard";
import { PsychologistOnboardingPage } from "../features/psychologists/pages/PsychologistOnboardingPage";
import { AvailabilityPage } from "../features/availability/pages/AvailabilityPage";
import { PsychologistAppointmentsPage } from "../features/appointments/pages/PsychologistAppointmentsPage";

// Admin-only
import { AdminDashboardPage } from "../features/admin/pages/AdminDashboardPage";
import { AdminVerificationsPage } from "../features/admin/pages/AdminVerificationsPage";
import { AdminReportsPage } from "../features/admin/pages/AdminReportsPage";
import { AdminPaymentsPage } from "../features/admin/pages/AdminPaymentsPage";
// Guards
import { ProtectedRoute } from "../routes/ProtectedRoute";
import { RoleRoute } from "../routes/RoleRoute";
import { GuestRoute } from "../routes/GuestRoute";
import { NavbarLayout } from "../components/layout/NavbarLayout";
import { RouteErrorPage } from "../components/feedback/RouteErrorPage";
import { ApprovedPsychologistRoute } from "../routes/ApprovedPsychologistRoute";

const router = createBrowserRouter([
  // ── Public (unauthenticated only) ────────────────────────────────────────
  {
    element: <NavbarLayout />,
    errorElement: <RouteErrorPage />,
    children: [
      { path: "/", element: <LandingPage /> },
      { path: "/about", element: <AboutPage /> },
      { path: "/about/:slug", element: <AboutDetailPage /> },
      { path: "/organization/:slug", element: <OrganizationDetailPage /> },
      { path: "/services/:slug", element: <ServiceDetailPage /> },
      { path: "/mental-health-assessment", element: <MentalHealthAssessmentPage /> },
      { path: "/events-achievements", element: <EventsAchievementsPage /> },
      { path: "/faq", element: <FAQPage /> },
      { path: "/contact", element: <ContactPage /> },
      { path: "/legal/:document", element: <LegalPage /> },
      { path: "*", element: <PublicNotFoundPage /> },
    ],
  },
  {
    element: <GuestRoute />,
    errorElement: <RouteErrorPage />,
    children: [
      { path: "/login", element: <LoginPage /> },
      { path: "/register", element: <RegisterPage /> },
      { path: "/verify-otp", element: <VerifyOtpPage /> },
      { path: "/forgot-password", element: <ForgotPasswordPage /> },
      { path: "/reset-password", element: <ResetPasswordPage /> },
    ],
  },

  // ── Protected (any authenticated role) ──────────────────────────────────
  {
    element: <ProtectedRoute />,
    errorElement: <RouteErrorPage />,
    children: [
      {
        element: <NavbarLayout />,
        children: [
          { path: "/home", element: <HomePage /> },
          { path: "/profile", element: <ProfilePage /> },

          // Psychologist browse
          { path: "/psychologists", element: <PsychologistListPage /> },
          { path: "/psychologists/:id", element: <PsychologistDetailPage /> },

          // Booking is patient-only; the backend enforces the same role boundary.
          {
            element: <RoleRoute allowed={["patient"]} />,
            children: [
              { path: "/book", element: <BookingFlowPage /> },
              { path: "/book/:psychologistId", element: <BookingFlowPage /> },
            ],
          },

          // Appointments
          { path: "/appointments", element: <MyAppointmentsPage /> },
          { path: "/appointments/:id", element: <AppointmentDetailPage /> },

          // Feedback
          { path: "/feedback/:appointmentId", element: <FeedbackPage /> },

          // Assessment
          { path: "/assessment", element: <AssessmentHubPage /> },
          { path: "/assessment/:type", element: <AssessmentPage /> },
          { path: "/assessment/:type/result", element: <AssessmentPage /> },

          // Emergency request screen
          { path: "/emergency", element: <EmergencyPage /> },
        ],
      },

      // Full-screen realtime rooms intentionally render without the app navbar.
      { path: "/session/:appointmentId", element: <SessionRoomPage /> },
      { path: "/emergency/session/:sessionId", element: <EmergencySessionPage /> },
    ],
  },

  // ── Psychologist-only ────────────────────────────────────────────────────
  {
    element: <RoleRoute allowed={["psychologist"]} />,
    errorElement: <RouteErrorPage />,
    children: [
      {
        element: <NavbarLayout />,
        children: [
          { path: "/psychologist/dashboard", element: <PsychologistDashboard /> },
          { path: "/psychologist/onboarding", element: <PsychologistOnboardingPage /> },
          {
            element: <ApprovedPsychologistRoute />,
            children: [
              { path: "/psychologist/availability", element: <AvailabilityPage /> },
              { path: "/psychologist/appointments", element: <PsychologistAppointmentsPage /> },
            ],
          },
        ],
      },
      {
        element: <ApprovedPsychologistRoute />,
        children: [
          { path: "/psychologist/session/:appointmentId", element: <SessionRoomPage /> },
        ],
      },
    ],
  },

  // ── Admin-only ───────────────────────────────────────────────────────────
  {
    element: <RoleRoute allowed={["admin"]} />,
    errorElement: <RouteErrorPage />,
    children: [
      {
        element: <NavbarLayout />,
        children: [
          { path: "/admin/dashboard", element: <AdminDashboardPage /> },
          { path: "/admin/verifications", element: <AdminVerificationsPage /> },
          { path: "/admin/reports", element: <AdminReportsPage /> },
          { path: "/admin/payments", element: <AdminPaymentsPage /> },
        ],
      },
    ],
  },
]);

export { router };
