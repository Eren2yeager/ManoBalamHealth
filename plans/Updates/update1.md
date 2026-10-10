# Update 1 — Psychologist Payments and Admin Operations

## Purpose

Move consultation-pricing authority from psychologists to administrators and add the information needed to pay psychologists. Improve the admin workspace so routine operational decisions are easy to find, understand, and audit.

The existing psychologist onboarding route is `/psychologist/onboarding` (referred to below as “onboarding”). All money values must continue to use the smallest currency unit (paise) in API/database contracts and be formatted as INR only at the UI boundary.

---

## Role: Psychologist

### 1. Remove fee control from onboarding

- Remove the editable **Base fee** input and the derived session-price matrix from psychologist onboarding.
- Do not include `consultationFee` in psychologist-created or psychologist-updated onboarding payloads, including pending profile-change payloads.
- The psychologist’s public profile, booking summary, and professional profile may display the current, admin-set fee as read-only. It must be clearly labelled, for example: **Set by ManoBalam administration**.
- Existing fee data must remain readable during the transition so existing profiles and appointments do not break. Only the admin role may change it after this update.
- When a psychologist submits profile edits, fee changes must not enter the review queue or overwrite the live fee.

### 2. Collect payout bank details

Add a **Payout details** section to onboarding. It is required before a psychologist can submit onboarding for approval, but it must never be public or exposed to patients.

- Capture: account holder name, bank name, account number, account-number confirmation, IFSC code, account type, and optional branch name/UPI ID if required by the eventual payout provider.
- Validate client-side and server-side: required fields, matching account numbers, normalized uppercase IFSC, and no account number in logs, toast messages, analytics, or email notifications.
- Store bank details separately from the public psychologist profile. Encrypt sensitive values at rest; access must be restricted to authorised payout/admin actions. API responses must return only masked values (for example, `•••• 1234`) after saving.
- Allow the psychologist to add or replace details. A replacement must require re-entry of the account number and confirmation, and record `updatedAt` for admin review/audit.
- Display a concise status: **Not added**, **Saved**, **Needs update**, or **Under review**. Do not display raw account numbers after save.
- Psychologists cannot request or execute payouts themselves in this update; the section exists to support admin-managed payments.

### Psychologist acceptance checks

1. A psychologist cannot edit a consultation fee anywhere in onboarding or profile editing.
2. A psychologist can save valid bank details and subsequently sees only masked account information.
3. A psychologist with no saved bank details cannot submit onboarding; they receive a clear inline explanation.
4. Public psychologist and booking views still show the current fee correctly.

---

## Role: Admin

### 1. Admin-owned pricing controls

Add a dedicated **Pricing** control to the psychologist review/detail experience (and a route/page if the current verification card is too constrained).

- Admin can set and update each psychologist’s base consultation fee in INR. The server converts and persists the value in paise.
- Preserve the existing mode/duration pricing rules when calculating the patient-facing price matrix. Show the admin a preview of the resulting chat, audio, and video prices before saving.
- Fee updates must be validated server-side, limited to the admin role, and recorded in an audit trail with previous value, new value, admin ID, timestamp, and optional reason.
- New psychologist approval should require the administrator to confirm/set the fee before the profile becomes bookable. Existing approved psychologists keep their current fee until an admin changes it.
- Fee history must be visible to authorised admins. Fee changes apply to future bookings only; an appointment’s charged amount must remain immutable.

### 2. Payout and bank-detail controls

Extend the admin area with a **Payouts** workspace.

- Show psychologists with payout readiness: bank-detail status, masked account suffix, completed-session count, eligible amount, paid amount, and outstanding balance.
- Provide searchable/filterable views for payout readiness, psychologist, date range, and payout status (`not_ready`, `eligible`, `processing`, `paid`, `failed`, `on_hold`).
- Admin can create a payout batch or an individual payout for completed, non-refunded appointments only. A payout record must include psychologist, covered appointments, gross amount, deductions/commission if applicable, net amount, status, provider reference, and timestamps.
- Do not mark a payout as paid until the payment-provider result is confirmed. Failed or held payouts must retain a reason and must be retryable without duplicating paid appointments.
- Bank-account updates should be visibly flagged to the admin before payment is released. Admin views must show only masked bank information unless an explicitly authorised secure payout action requires more.
- Add an auditable payout history and export/download option only after the exact fields and compliance requirements are agreed.

### 3. Controls and readability improvements

Build on the existing Dashboard, Verifications, Reports, Payments, and Refunds views with the following usability requirements:

- Use distinct navigation items for **Overview**, **Verifications**, **Pricing**, **Appointments**, **Refunds**, and **Payouts**. The sidebar and navbar must point to real routes consistently (the current sidebar dashboard path must resolve to `/admin/dashboard`).
- Show queue counts/badges for items needing action: pending psychologist reviews, pricing required, failed/held payouts, and refund requests.
- Make all operational tables searchable, filterable, sortable, and paginated server-side. Useful filters include status, psychologist, patient, date range, and payment/payout state.
- Give each row a clear primary action and a detail view/drawer rather than forcing admins to infer the next step from dense tables.
- Standardise status chips, currency formatting, local date/time formatting, loading skeletons, empty states, error states, and retry actions across admin pages.
- Surface high-risk exceptions prominently: missing bank details, missing fee, failed payments/payouts, refunds, cancelled appointments, and pending changes to an already approved psychologist.
- Reports should allow a selected date range and distinguish platform revenue, refunded revenue, payout liability, paid-out amount, and outstanding liability. Definitions must be shown beside totals so figures are not ambiguous.
- Every action that changes money, approval state, fee, or payout status needs confirmation, a useful success/failure message, and an audit-log entry.

### Admin acceptance checks

1. Only an authenticated admin can set a psychologist’s fee or access payout data.
2. Admin can approve a psychologist only after mandatory onboarding details are complete and a fee has been confirmed.
3. Admin can find any appointment, payment, psychologist review, or payout using filters/search and can understand its current status without opening source records.
4. A completed appointment contributes to a payout at most once; refunded/cancelled appointments are excluded according to the payout policy.
5. Admin never sees or exports unmasked bank account numbers in ordinary list, report, or audit screens.

---

## Backend and data changes

- Keep `consultationFee` on the psychologist profile as the current admin-managed price, but remove it from psychologist-writable validation schemas and update services.
- Introduce a protected payout-details model/collection linked to the psychologist profile. Keep encrypted account data out of the public profile response and the existing pending-change document.
- Introduce payout records and, if batches are supported, payout-batch records. Enforce idempotency and appointment-level payout allocation so retrying a failed provider request cannot pay the same appointment twice.
- Add admin-only endpoints for setting fees, viewing masked payout details/readiness, creating and updating payouts, and viewing audit/history. Maintain the existing role middleware on every endpoint.
- Update appointment/payment reporting to use the recorded payment/appointment amount rather than reading a psychologist’s current fee for historical entries.

## Delivery order

1. Define data models, encryption/key-management approach, validation, role permissions, audit events, and migration for existing psychologist fees.
2. Remove psychologist fee editing; add read-only fee display and secure payout-details onboarding.
3. Implement admin pricing controls and make approval require pricing confirmation.
4. Implement payout readiness, records, provider integration/status handling, and history.
5. Improve admin navigation, tables, filters, empty/error/loading states, and financial reporting.
6. Test role boundaries, fee immutability for existing appointments, bank-data masking, payout idempotency, refund interaction, and mobile/desktop admin usability.

---

## Implementation tracker

### Phase 1 — Data models & infrastructure (Tasks 1–5)

- [x] Payout-details model with encrypted account numbers and masked API responses.
- [x] Payout and payout-batch models; payout appointment allocation has a unique idempotency index.
- [x] Fee-history audit model.
- [x] AES-256-GCM encryption utility and required `ENCRYPTION_KEY` environment variable.
- [x] Server-side bank-detail validation, including account-number confirmation and IFSC validation.

### Phase 2 — Remove psychologist fee control (Tasks 6–8)

- [x] Removed `consultationFee` from psychologist-writable request schemas and client update types.
- [x] Removed fee handling from `pendingChanges` and from the approved-profile merge path.
- [x] Removed fee from onboarding completeness checks; bank-details readiness is now required on submission.

### Phase 3 — Payout-details onboarding (Tasks 9–13)

- [x] Psychologist-only payout-detail endpoints and service, with a separate protected model.
- [x] Onboarding shows the admin-set fee read-only and no longer contains fee input or a psychologist price preview.
- [x] Added bank-detail collection, masked display, and safe update behaviour requiring account-number re-entry.
- [x] Submission is blocked in the UI and server until saved payout details exist.

### Phase 4 — Admin pricing controls (Tasks 14–16)

- [x] Admin-only fee-setting endpoint with an audit record.
- [x] Admin-only fee-history endpoint and pricing UI.
- [x] Approval is blocked until a positive consultation fee has been set.

### Phase 5 — Admin payout system (Tasks 17–20)

- [x] Admin-only payout readiness, creation, list, and detail endpoints.
- [x] Payout creation is available in the Payouts workspace for eligible completed appointments.
- [x] Payout detail and management routes are protected by admin role middleware; payout-detail self-service routes require the psychologist role.
- [x] Added an admin-only **manual payout** workflow for the interim: an explicit payout action reveals the selected payee's bank/UPI destination, then records the payment method and external UTR/UPI reference as `provider: "manual"` when the administrator confirms the transfer. Ordinary payout lists remain masked.
- [ ] Batch creation/processing endpoints and an actual payout-provider integration are still required before payouts can be sent automatically. The manual workflow is an interim operational control, not a provider integration.

### Phase 6 — Admin UI improvements (Tasks 21–26)

- [x] Added routable Pricing and Payouts workspaces.
- [x] Updated admin navbar and sidebar navigation; fixed the sidebar dashboard route.
- [ ] Queue badges, shared server-side table filtering/sorting/pagination, and expanded financial-report definitions remain to be implemented.

### Phase 7 — Testing (Tasks 27–31)

- [x] Type-check passes for both server and client.
- [ ] Add focused automated tests for role boundaries, historic-fee immutability, bank masking, payout allocation idempotency, and refund interaction.
