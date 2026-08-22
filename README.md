# HRMS Admin & HR Console (Hitesh Frontend)

A professional, high-performance React + Tailwind CSS Admin Management Console built for HR administrators to manage employees, process leave requests, track attendance, and configure payroll compensation.

## Features Included

1. **Admin Authentication**:
   - Strictly enforces `role === "admin"`.
   - Stores session in localStorage and redirects to admin dashboard.
2. **Executive Overview Dashboard**:
   - Real-time KPIs: Pending Leave Approvals count, Total Requests, Today's Check-Ins, and Monthly Payroll Expenditure.
   - Quick-action Leave Queue to approve/reject pending leaves in 1 click with admin remarks.
3. **Organization Attendance Ledger**:
   - Complete table of all employee check-in and check-out logs.
   - Search by Employee User ID.
   - Date picker filter and status filter (Present, Absent, Half-Day).
   - Real-time work duration calculation.
4. **Leave Approvals Management**:
   - Company-wide leave applications ledger.
   - Filter tabs: All, Pending, Approved, Rejected.
   - Modal to approve or reject with custom HR comments and live table update.
5. **Payroll Administration**:
   - Full ledger of employee compensation profiles.
   - Search by employee.
   - "Set Employee Salary" modal form with live net take-home calculation (`Basic + Allowances - Deductions`).
6. **Configurable API Endpoint**:
# HRMS Employee Portal (Bharath Frontend)

A modern, responsive React + Tailwind CSS employee self-service portal connected to the Dayflow FastAPI HRMS backend.

## Features Included

1. **Authentication (Login / Signup)**:
   - Toggle between Sign In and Account Creation.
   - Saves `user_id` and `role` to localStorage upon successful auth.
2. **Dashboard**:
   - Welcome banner with live date and personalized greeting.
   - Quick-glance cards: Today's check-in status (with 1-click Check In / Check Out action), Pending Leave counter, and Net Salary preview.
3. **Profile Management**:
   - View and edit personal profile (`full_name`, `phone`, `address`, `job_title`, `department`, `profile_pic_url`).
4. **Daily Attendance**:
   - Digital real-time clock.
   - Big Check-In and Check-Out punch cards.
   - Complete attendance history table with date filter and duration calculator.
5. **Leave Management**:
   - Leave application form with dynamic day calculation.
   - Leave history table with color-coded status badges and manager feedback comments.
6. **Payroll & Compensation**:
   - Read-only salary breakdown slip showing basic salary, allowances, deductions, and net salary.
   - Print salary slip feature.
7. **Configurable Backend API**:
   - Built-in settings modal to change or test the backend URL (defaults to `https://implant-constrain-grapple.ngrok-free.dev`).

## Getting Started

```bash
# Install dependencies
npm install

# Run development server
# Run the local development server
npm run dev

# Build for production
npm run build
```
