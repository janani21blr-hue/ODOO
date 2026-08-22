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
   - Built-in settings modal to change or test the backend URL (defaults to `https://implant-constrain-grapple.ngrok-free.dev`).

## Getting Started

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build
```
