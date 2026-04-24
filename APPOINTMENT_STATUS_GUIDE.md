# Real-Time Appointment Status Update System - Implementation Guide

## Overview
This system implements automatic and manual appointment status updates with real-time synchronization between backend and frontend. The status automatically changes to "completed" when the appointment time passes, and admins/users can manually update statuses.

---

## Backend Implementation

### 1. **Appointment Model** (`server/src/models/Appointment.js`)

**Changes Made:**
- Added "completed" status to enum: `["pending", "confirmed", "completed", "cancelled"]`
- Added `updatedAt: { type: Date, default: Date.now }` field to track when status changes

**Status Lifecycle:**
- `pending` → Initial state when appointment is booked
- `confirmed` → Admin confirms the appointment
- `completed` → Appointment time has passed (auto-updated) or manually marked
- `cancelled` → User/Admin cancels the appointment

### 2. **New API Endpoints** (`server/src/routes/appointments.js`)

#### Helper Function: `isAppointmentPassed(date, timeSlot)`
Checks if the appointment time has passed by comparing appointment end time with current time.
- Assumes 30-minute appointment duration
- Returns `true` if appointment is done

#### New Endpoints:

**1. Update Appointment Status**
```
PATCH /api/appointments/:id/status
Authorization: Bearer {token}
Body: { status: "completed" | "cancelled" | "confirmed" | "pending" }

Response: { message: "Appointment status updated.", appointment: {...} }
```
- Only appointment owner or admin can update
- Updates the `updatedAt` timestamp

**2. Check & Auto-Update Appointment Status**
```
GET /api/appointments/status/check/:id
Response: appointment object (with auto-updated status if time passed)
```
- Used by frontend polling for real-time updates
- Auto-updates status from "pending"/"confirmed" to "completed" if time passed

**3. Get All Appointments with Auto-Update**
```
GET /api/appointments/all/latest
Authorization: Bearer {token} (admin only)
Response: [appointments] (all with auto-updated statuses)
```
- Admin endpoint to fetch all appointments with automatic status updates

---

## Frontend Implementation

### 1. **Admin Dashboard** (`client/src/pages/AdminDashboard.jsx`)

**Real-Time Polling:**
- Fetches all appointments every 10 seconds
- Automatically displays status changes without page refresh

**Enhanced AppointmentTable Component:**
- Shows appointment data with status badges
- Color-coded status indicators:
  - Yellow: `pending`
  - Green: `confirmed`
  - Blue: `completed`
  - Red: `cancelled`

**Action Buttons:**
- ✓ **Mark Complete**: Manually mark appointment as completed
- ✕ **Cancel**: Cancel the appointment (with confirmation)
- Buttons disabled for already completed/cancelled appointments

**Status Update Handler:**
```javascript
handleUpdateAppointmentStatus(appointmentId, newStatus)
```
- Sends PATCH request to update status
- Refreshes appointment list after update
- Shows success/error message

### 2. **My Appointments Page** (`client/src/pages/MyAppointments.jsx`)

**User-Facing Features:**
- View all their own appointments
- Real-time polling every 10 seconds
- Card-based layout showing:
  - Doctor name and specialty
  - Pet name and type
  - Appointment date and time
  - Issue/problem description
  - Contact information
  - Status with color-coded badge and icon

**User Actions:**
- Cancel button for pending/confirmed appointments
- Disabled for completed/cancelled appointments
- Confirmation dialog before cancellation

**Status Icons:**
- Clock icon for `pending`
- Check icon (green) for `confirmed`
- Check icon (blue) for `completed`
- Times icon for `cancelled`

### 3. **Navigation Updates** (`client/src/components/Navbar.jsx`)

- Added "My Appointments" link for logged-in users
- Link appears alongside "My Account" in navigation
- Mobile-responsive menu support

### 4. **Routes** (`client/src/App.jsx`)

- Added route: `/my-appointments` (requires login)
- Protected route - redirects to login if not authenticated

---

## Real-Time Data Flow

### Polling Architecture (Every 10 seconds):

```
User/Admin Dashboard
         ↓
    Polling Timer (10s)
         ↓
GET /api/appointments (with auto-update logic)
         ↓
Backend checks if appointment time passed
         ↓
Updates status if needed (pending/confirmed → completed)
         ↓
Returns updated appointments
         ↓
Frontend updates UI with new statuses
```

### Manual Status Update Flow:

```
User clicks "Complete" or "Cancel" button
         ↓
PATCH /api/appointments/:id/status
         ↓
Backend verifies authorization
         ↓
Updates status and updatedAt timestamp
         ↓
Returns updated appointment
         ↓
Frontend refreshes appointment list
         ↓
Shows success message
```

---

## Usage Examples

### For Admin:

1. Navigate to Admin Dashboard → "Doctor Appointments" tab
2. View all appointments with current statuses
3. See real-time status updates (refreshes every 10 seconds)
4. Click ✓ button to mark appointment as completed
5. Click ✕ button to cancel appointment
6. Receive confirmation messages

### For Users:

1. After logging in, click "My Appointments" in navbar
2. View cards of all your appointments
3. See real-time status updates
4. Click "Cancel" button to cancel upcoming appointments
5. Completed/cancelled appointments show "No actions" button

---

## Configuration

### Polling Interval
- Current: 10 seconds (adjustable in useEffect)
- Location: Both AdminDashboard and MyAppointments components
- To change: Update the `10000` value in `setInterval()`

### Appointment Duration
- Current: 30 minutes (for determining if time passed)
- Location: `isAppointmentPassed()` function in appointments.js
- To change: Update `appointmentDateTime.setMinutes()` call

### Status Update Permissions
- Users: Can only update their own appointments
- Admins: Can update any appointment
- Verified by comparing `req.user.id` with `appointment.user`

---

## Testing Checklist

- [ ] Admin can see appointments in admin dashboard
- [ ] Status badges display correct colors
- [ ] Admin can click "✓" to mark as completed
- [ ] Admin can click "✕" to cancel (with confirmation)
- [ ] Status updates appear without page refresh (every 10s)
- [ ] Success/error messages display correctly
- [ ] Users can view their appointments at `/my-appointments`
- [ ] Users see real-time status updates in their appointments
- [ ] Users can cancel their appointments
- [ ] Completed/cancelled appointments are read-only
- [ ] Navbar shows "My Appointments" link for logged-in users
- [ ] Authentication is required for both pages

---

## API Response Examples

### Get All Appointments (Admin)
```json
[
  {
    "_id": "507f1f77bcf86cd799439011",
    "user": "507f1f77bcf86cd799439010",
    "name": "John Doe",
    "phone": "9876543210",
    "email": "john@example.com",
    "petName": "Max",
    "petType": "Dog",
    "numberOfPets": 1,
    "doctor": "Dr. doctor1 - General Veterinarian",
    "date": "2026-04-25",
    "timeSlot": "14:30",
    "issue": "General checkup",
    "status": "pending",
    "createdAt": "2026-04-24T10:00:00Z",
    "updatedAt": "2026-04-24T10:00:00Z"
  }
]
```

### Update Appointment Status
```
Request:
PATCH /api/appointments/507f1f77bcf86cd799439011/status
Body: { status: "completed" }

Response:
{
  "message": "Appointment status updated.",
  "appointment": { ...updated appointment object... }
}
```

---

## Troubleshooting

### Status Not Updating
- Check browser console for API errors
- Verify server is running on correct port
- Check if polling interval is working (should see network requests)

### Authorization Errors
- Ensure JWT token is valid and not expired
- Check token is being sent in Authorization header
- Verify user role is "admin" for admin endpoints

### Status Stuck on "pending"
- Backend check: Verify `isAppointmentPassed()` logic
- Frontend check: Verify polling interval is running
- Check browser network tab for failed requests

### Buttons Not Showing
- Verify appointment status is "pending" or "confirmed"
- Check browser console for JavaScript errors
- Ensure appointment data is loading correctly

---

## Future Enhancements

1. **Email Notifications**: Send status update emails to users
2. **SMS Alerts**: Send SMS when appointment time is near
3. **Calendar Integration**: Show appointments in calendar view
4. **Booking Reminders**: Remind users 24 hours before appointment
5. **WebSocket Instead of Polling**: Use WebSocket for true real-time updates
6. **Status History**: Track all status changes with timestamps
7. **Doctor Availability**: Auto-manage doctor availability based on appointments
8. **Appointment Rescheduling**: Allow users to reschedule appointments
