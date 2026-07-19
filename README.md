<div align="center">

# ManoBalamHealthCare

### A calm digital doorway to mental-health support

ManoBalamHealthCare is a full-stack mental-health care platform designed to help people discover trusted professionals, book online sessions, complete guided self-assessments, and access supportive care pathways from one thoughtful, privacy-conscious experience.

`Mental Health` / `Teletherapy` / `Appointments` / `Assessments` / `Secure Sessions`

</div>

---

## The idea behind the application

Finding mental-health support should not feel confusing, distant, or overwhelming. ManoBalamHealthCare brings the essential parts of a care journey into one gentle digital space: discovery, booking, payment, session access, assessments, feedback, and administrative support.

The application is built around a simple belief: technology should make care easier to reach without removing the human warmth, dignity, and responsibility that mental healthcare deserves.

## What ManoBalamHealthCare helps with

### For people seeking support

- Explore verified mental-health professionals
- View professional profiles and availability
- Book chat, audio, or video consultations
- Complete guided mental-health self-assessments
- Track appointments and session history
- Access urgent-support and crisis-resource pathways
- Share feedback after care experiences

### For psychologists and counsellors

- Manage professional profile and onboarding details
- Set availability and consultation preferences
- Review upcoming and past appointments
- Join secure care sessions
- Communicate with users during scheduled sessions
- Maintain service quality through structured workflows

### For administrators

- Review professional onboarding submissions
- Monitor platform activity and care operations
- Manage appointments, reports, payments, and service quality
- Support safe, accountable platform governance

## Experience at a glance

```text
Visitor
  |
  +-- Learns about the organization and available services
  |
  +-- Creates an account or signs in
  |
  +-- Finds a suitable mental-health professional
  |
  +-- Books and confirms an appointment
  |
  +-- Joins a secure online session
  |
  +-- Continues care through assessments, follow-ups, and feedback
```

## Key product areas

| Area | Purpose |
| --- | --- |
| Public website | Presents the organization, services, committees, events, FAQs, and contact information in a clear public-facing experience. |
| Authentication | Supports secure entry into role-based spaces for users, professionals, and administrators. |
| Professional discovery | Helps users browse, filter, and understand available mental-health professionals. |
| Appointment booking | Turns availability into bookable care moments with clear scheduling and confirmation flows. |
| Online sessions | Supports care delivery through chat, audio, and video-oriented session experiences. |
| Assessments | Provides structured self-reflection tools for areas such as stress, anxiety, and depression. |
| Crisis pathways | Offers urgent-support routes and resource guidance for higher-risk moments. |
| Administration | Gives the organization tools to review professionals, monitor care activity, and maintain accountability. |

## Design personality

ManoBalamHealthCare uses a soft wellness-focused visual language: lavender and violet tones, calm gradients, rounded cards, supportive microcopy, and clean typography. The interface is designed to feel:

- gentle, not clinical-cold
- premium, but still approachable
- clear, especially during emotionally sensitive moments
- structured enough for trust, soft enough for comfort

## Technology overview

This project is organized as a modern full-stack web application with separate client and server packages.

### Client

- React with TypeScript
- Vite-powered frontend workflow
- Tailwind CSS and reusable UI components
- Role-aware routing and application state
- Responsive public pages and authenticated dashboards

### Server

- Node.js and Express
- Structured API modules for platform features
- Database-backed domain models
- Secure authentication and authorization flows
- Real-time communication support for sessions and presence
- Background processing for operational workflows

The README intentionally keeps sensitive configuration details, secrets, deployment internals, and private operational information out of public view.

## Repository layout

```text
ManoBalamHealth/
  client/    Frontend application and public website
  server/    Backend API, real-time services, and platform logic
  plans/     Planning notes and product/engineering references
```

## Running the project locally

Install and run each package from its own folder.

```bash
cd client
npm install
npm run dev
```

```bash
cd server
npm install
npm run dev
```

The server requires appropriate local environment configuration and supporting services before it can run successfully. Keep credentials and private configuration in local environment files only.

## Quality and verification

Useful development commands:

```bash
cd client
npm run build
npm run lint
```

```bash
cd server
npm run build
npm run lint
npm test
```

## Safety note

ManoBalamHealthCare is designed to support access to mental-health care and wellbeing resources. It should not be treated as a replacement for emergency services. If someone is in immediate danger or may harm themselves or others, they should contact local emergency services or a trusted crisis helpline right away.

## Vision

To make asking for help feel normal, reachable, and supported.

## Mission

To build a dependable digital bridge between people seeking care, qualified mental-health professionals, guided self-assessment, and timely support pathways.

---

<div align="center">

### ManoBalamHealthCare

Care that feels closer. Support that feels calmer. Technology that remembers the human.

</div>
