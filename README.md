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

# Run the local development server
npm run dev

# Build for production
npm run build
```
