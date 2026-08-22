# ODOO
🌊 Dayflow — Next-Gen HRMS
A centralized, full-stack Human Resource Management System built for the Odoo × NMIT Hackathon to streamline employee management, attendance, leave approvals, and payroll visibility.

Tech Stack: React, Tailwind CSS, Vite, FastAPI, Python, SQLModel, SQLite, Ngrok.

✨ Core Features
Role-Based Portals: Distinct React dashboards for Employees (self-service workflows) and Admin/HR (approvals and organizational management).

Attendance & Leave Management: Real-time daily check-in/out tracking alongside an end-to-end leave request lifecycle with Admin remark capabilities.

Dynamic Payroll Engine: Live salary breakdowns calculating Basic Pay, Allowances, and Deductions, with secure Admin editing privileges.

Robust Backend Infrastructure: High-performance FastAPI server utilizing SQLModel and SQLite, tunneled globally via Ngrok for seamless integration.

🚀 Quick Start (Local Setup)
Clone Repository: git clone [https://github.com/janani21blr-hue/ODOO.git](https://github.com/janani21blr-hue/ODOO.git)

Start Dashboards: Navigate to the frontend folders, run npm install, and execute npm run dev to launch on ports 3000 and 3001.

Initialize Backend: Install dependencies via pip install -r requirements.txt and start the server using uvicorn main:app --reload.

API Tunneling: Execute ngrok http 8000 to expose the local API to the frontend network.

👨‍💻 The Team
Janani: Lead Backend Engineer (Core Architecture, API Logic, Database Integration, & Full-Stack Merging)

Bharath: Frontend Engineer (Employee Portal Dashboard)

Hitesh: Frontend Engineer (Admin Management Console)

Oshika: Backend Developer (Payroll & Profile API Modules)
