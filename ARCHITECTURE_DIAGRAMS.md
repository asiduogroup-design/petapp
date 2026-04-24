# Real-Time Appointment Status System - Architecture & Flow Diagrams

## 1. System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    PET APP SYSTEM                            │
└─────────────────────────────────────────────────────────────┘

┌──────────────────────┐           ┌──────────────────────┐
│    FRONTEND CLIENT   │           │   BACKEND SERVER     │
│                      │           │                      │
│ ┌────────────────┐   │           │ ┌────────────────┐   │
│ │ AdminDashboard │   │  HTTP/    │ │ Appointments   │   │
│ │ (polls 10s)    │───┼──Request──┼─│ Routes         │   │
│ │                │   │  JSON     │ │                │   │
│ └────────────────┘   │           │ └────────────────┘   │
│                      │           │        ↓             │
│ ┌────────────────┐   │           │ ┌────────────────┐   │
│ │ MyAppointments │   │  HTTP/    │ │ Auto-Update    │   │
│ │ (polls 10s)    │───┼──Response─┼─│ Logic          │   │
│ │                │   │  JSON     │ │ (checks time)  │   │
│ └────────────────┘   │           │ └────────────────┘   │
│                      │           │        ↓             │
│ ┌────────────────┐   │           │ ┌────────────────┐   │
│ │ Action Buttons │   │           │ │ MongoDB        │   │
│ │ (manual update)│───┼───PATCH───┼─│ Appointments   │   │
│ │                │   │           │ │ Collection     │   │
│ └────────────────┘   │           │ └────────────────┘   │
│                      │           │                      │
└──────────────────────┘           └──────────────────────┘
```

---

## 2. Status Lifecycle

```
┌────────────┐
│  PENDING   │ ← Initial state when appointment is booked
└─────┬──────┘
      │
      │ 1. Time passed OR
      │ 2. Admin clicks ✓
      ↓
┌────────────┐
│ COMPLETED  │ ← Appointment is done
└────────────┘

      OR

┌────────────┐
│  PENDING   │
└─────┬──────┘
      │
      │ Admin clicks ✕ OR
      │ User clicks Cancel
      ↓
┌────────────┐
│ CANCELLED  │ ← Appointment is cancelled
└────────────┘
```

---

## 3. Auto-Update Flow (Every Time Appointments Are Fetched)

```
┌──────────────────────────────────────┐
│  Frontend: GET /api/appointments     │
└──────────────────────────────────────┘
                  ↓
        ┌─────────────────────┐
        │ Backend Processes   │
        │ 1. Find all appts   │
        │ 2. For each appt:   │
        │    a. Get date+time │
        │    b. Check current │
        │       time          │
        │    c. If time passed│
        │       & status is   │
        │       pending/      │
        │       confirmed →   │
        │       Update to     │
        │       "completed"   │
        └─────────────────────┘
                  ↓
    ┌─────────────────────────┐
    │ Response with Updated   │
    │ Appointments            │
    │ [                       │
    │   { _id: 123,           │
    │     status: "completed",│
    │     updatedAt: "..."    │
    │   },                    │
    │   ...                   │
    │ ]                       │
    └─────────────────────────┘
                  ↓
        ┌──────────────────────┐
        │ Frontend UI Updates  │
        │ (no page refresh)    │
        │ - Status badges      │
        │   change color       │
        │ - Action buttons     │
        │   become disabled    │
        └──────────────────────┘
```

---

## 4. Real-Time Polling Architecture

```
ADMIN DASHBOARD                          MY APPOINTMENTS
┌────────────────────────┐               ┌────────────────────┐
│ useEffect Hook         │               │ useEffect Hook     │
│ ┌──────────────────┐   │               │ ┌────────────────┐ │
│ │ setInterval(fn)  │   │               │ │ setInterval()  │ │
│ │ Every 10 seconds │   │               │ │ Every 10 secs  │ │
│ └──────────────────┘   │               │ └────────────────┘ │
│         ↓              │               │         ↓          │
│    Fetch Apps          │               │    Fetch Apps      │
│         │              │               │         │          │
│         └──────┬───────┴───────────────┴──┬──────┘          │
│                │                          │                 │
│                ↓                          ↓                 │
│         ┌────────────────────────────────────┐              │
│         │ GET /api/appointments              │              │
│         │ (auto-check & update statuses)     │              │
│         └────────────────────────────────────┘              │
│                │                          │                 │
│                ↓                          ↓                 │
│         ┌─────────────────────┐   ┌──────────────────┐     │
│         │ Admin sees updates  │   │ User sees their  │     │
│         │ every 10 seconds    │   │ updates every    │     │
│         │                     │   │ 10 seconds       │     │
│         └─────────────────────┘   └──────────────────┘     │
│                                                              │
└────────────────────────────────────────────────────────────┘

Timeline:
┌───┐ ┌───┐ ┌───┐ ┌───┐ ┌───┐ ┌───┐
│ 0 │ │10s│ │20s│ │30s│ │40s│ │50s│ (seconds)
└───┘ └───┘ └───┘ └───┘ └───┘ └───┘
 ↓     ↓     ↓     ↓     ↓     ↓
Poll  Poll  Poll  Poll  Poll  Poll
Status changes visible without page refresh!
```

---

## 5. Manual Status Update Flow

```
USER INTERACTION
─────────────────
    │
    └─→ Admin clicks ✓ (Complete)  OR  User clicks ✕ (Cancel)
                 │                             │
                 ↓                             ↓
        ┌─────────────────────┐    ┌─────────────────────┐
        │ Confirmation Dialog │    │ Confirmation Dialog │
        │ "Mark Complete?"    │    │ "Cancel Appt?"      │
        │ [YES] [NO]          │    │ [YES] [NO]          │
        └─────────────────────┘    └─────────────────────┘
                 │                             │
         User clicks YES            User clicks YES
                 │                             │
                 ↓                             ↓
        ┌─────────────────────────────────────────────┐
        │ PATCH /api/appointments/:id/status          │
        │ Body: { status: "completed" | "cancelled" }  │
        └─────────────────────────────────────────────┘
                       ↓
        ┌─────────────────────────────────────────────┐
        │ Backend:                                    │
        │ 1. Verify authorization                     │
        │ 2. Update appointment.status                │
        │ 3. Update appointment.updatedAt             │
        │ 4. Save to database                         │
        │ 5. Return updated appointment               │
        └─────────────────────────────────────────────┘
                       ↓
        ┌─────────────────────────────────────────────┐
        │ Frontend:                                   │
        │ 1. Show success message                     │
        │ 2. Refresh appointments list                │
        │ 3. Update UI (status badge, disable buttons)│
        │ 4. Auto-dismiss message after 3 seconds     │
        └─────────────────────────────────────────────┘
```

---

## 6. Component Hierarchy

```
App.jsx
│
├─→ Navbar.jsx (with "My Appointments" link)
│
├─→ Route: /admin
│   └─→ AdminDashboard.jsx
│       ├─→ Real-time polling (10s)
│       ├─→ Stats Cards
│       ├─→ Sidebar Navigation
│       └─→ AppointmentTable Component
│           ├─→ Status Badges (color-coded)
│           ├─→ Action Buttons (✓, ✕)
│           ├─→ Success/Error Messages
│           └─→ Pagination
│
├─→ Route: /my-appointments
│   └─→ MyAppointments.jsx
│       ├─→ Real-time polling (10s)
│       ├─→ Authorization check
│       ├─→ Appointment Cards (grid)
│       │   ├─→ Status Badge with Icon
│       │   ├─→ Doctor Info
│       │   ├─→ Pet Info
│       │   ├─→ Date & Time
│       │   ├─→ Contact Info
│       │   └─→ Cancel Button
│       ├─→ Error Messages
│       └─→ Loading States
│
└─→ Other Routes...
```

---

## 7. Data Flow Timeline

```
SCENARIO: Admin viewing appointments with auto-status update

┌─────────────────────────────────────────────────────────────┐
│ TIME  │ ACTION                  │ STATUS                      │
├─────────────────────────────────────────────────────────────┤
│ 0:00  │ Admin loads dashboard   │ Component mounted           │
├─────────────────────────────────────────────────────────────┤
│ 0:01  │ Fetch appointments      │ Pending (loading)           │
├─────────────────────────────────────────────────────────────┤
│ 0:02  │ API returns data        │ Data received & stored      │
├─────────────────────────────────────────────────────────────┤
│ 0:03  │ UI renders table        │ Appointments displayed      │
├─────────────────────────────────────────────────────────────┤
│ 0:05  │ Admin reviews data      │ All status visible          │
├─────────────────────────────────────────────────────────────┤
│ 10s   │ Polling timer triggers  │ Auto-fetch #1               │
├─────────────────────────────────────────────────────────────┤
│ 10:02 │ Check appt time passed  │ Some appts → completed      │
├─────────────────────────────────────────────────────────────┤
│ 10:03 │ Return updated data     │ UI updates automatically    │
├─────────────────────────────────────────────────────────────┤
│ 20s   │ Polling timer triggers  │ Auto-fetch #2               │
├─────────────────────────────────────────────────────────────┤
│ ...   │ ...                     │ ...                         │
├─────────────────────────────────────────────────────────────┤
│ 45s   │ Admin clicks ✓ button   │ Completion request          │
├─────────────────────────────────────────────────────────────┤
│ 45:01 │ Confirmation shown      │ User confirms action        │
├─────────────────────────────────────────────────────────────┤
│ 45:02 │ PATCH sent to backend   │ Status update in progress   │
├─────────────────────────────────────────────────────────────┤
│ 45:03 │ Backend updates DB      │ Status → "completed"        │
├─────────────────────────────────────────────────────────────┤
│ 45:04 │ Response received       │ Success message shown       │
├─────────────────────────────────────────────────────────────┤
│ 45:05 │ Refresh appointments    │ UI updates immediately      │
├─────────────────────────────────────────────────────────────┤
│ 50s   │ Next polling triggers   │ Auto-fetch #3 (refreshed)   │
└─────────────────────────────────────────────────────────────┘

Key Point: No page refresh needed! Real-time updates visible immediately.
```

---

## 8. Status Badge Color Legend

```
┌─────────────┬──────────┬─────────────────────────────────┐
│   STATUS    │  COLOR   │    MEANING                      │
├─────────────┼──────────┼─────────────────────────────────┤
│ pending     │ Yellow   │ Waiting for appointment time    │
├─────────────┼──────────┼─────────────────────────────────┤
│ confirmed   │ Green    │ Appointment confirmed           │
├─────────────┼──────────┼─────────────────────────────────┤
│ completed   │ Blue     │ Appointment done/finished       │
├─────────────┼──────────┼─────────────────────────────────┤
│ cancelled   │ Red      │ Appointment cancelled           │
└─────────────┴──────────┴─────────────────────────────────┘

UI Elements:
  pending     ⏳ (clock icon)
  confirmed   ✓  (check icon, green)
  completed   ✅ (check circle, blue)
  cancelled   ❌ (times icon, red)
```

---

## 9. Permission Matrix

```
┌──────────────────┬──────────┬──────────────────────────┐
│ OPERATION        │  ADMIN   │  REGULAR USER            │
├──────────────────┼──────────┼──────────────────────────┤
│ View all appts   │ ✅ YES   │ ❌ NO (own only)         │
├──────────────────┼──────────┼──────────────────────────┤
│ Mark complete    │ ✅ YES   │ ❌ NO (can't modify)     │
├──────────────────┼──────────┼──────────────────────────┤
│ Cancel appt      │ ✅ YES   │ ✅ YES (own only)        │
├──────────────────┼──────────┼──────────────────────────┤
│ View own appts   │ ✅ YES   │ ✅ YES                   │
├──────────────────┼──────────┼──────────────────────────┤
│ Delete appt      │ ✅ YES   │ ❌ NO                    │
├──────────────────┼──────────┼──────────────────────────┤
│ Access /admin    │ ✅ YES   │ ❌ NO (redirected)       │
├──────────────────┼──────────┼──────────────────────────┤
│ Access /my-appts │ ✅ YES   │ ✅ YES (own)             │
└──────────────────┴──────────┴──────────────────────────┘
```

---

## 10. Error Handling Flow

```
┌─────────────────────────┐
│ User Action             │
└────────────┬────────────┘
             ↓
    ┌────────────────────┐
    │ Send API Request   │
    └────────────┬───────┘
                 ↓
         ┌───────────────┐
         │ API Response  │
         └───┬───────┬───┘
             ↓       ↓
         ✅ OK   ❌ ERROR
             │       │
             ↓       ↓
        Update   ┌──────────────────┐
        Success  │ Error Handler    │
          Msg    │ ┌──────────────┐ │
                 │ │ Parse Error  │ │
                 │ │ Message      │ │
                 │ └──────────────┘ │
                 │        ↓         │
                 │ ┌──────────────┐ │
                 │ │ Display in   │ │
                 │ │ Red Alert    │ │
                 │ └──────────────┘ │
                 │        ↓         │
                 │ ┌──────────────┐ │
                 │ │ Auto-hide    │ │
                 │ │ after 5 secs │ │
                 │ └──────────────┘ │
                 └──────────────────┘
```

---

This system ensures real-time appointment status management with minimal latency and excellent user experience!
