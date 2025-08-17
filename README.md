📦 Parcel Delivery API
🎯 Project Overview

Design and build a secure, modular, and role-based backend API for a parcel delivery system (inspired by Pathao Courier or Sundarban) using Express.js and Mongoose.

The system allows:

👤 Senders to create, cancel, and track their parcels

📥 Receivers to confirm delivery and view history

🛡 Admins to manage users and parcels, block/unblock, and update statuses

All parcels include a status history log embedded inside the parcel schema to ensure complete tracking.

⚙️ Tech Stack

Backend: Express.js, TypeScript

Database: MongoDB (Mongoose ODM)

Auth: JWT + bcrypt password hashing

Others: Middleware, Role-based Authorization, Error Handling

📁 Project Structure
src/
├── modules/
│ ├── auth/ # login, register, JWT
│ ├── user/ # user roles, block/unblock
│ ├── parcel/ # parcel + status log handling
├── middlewares/ # auth, error handling, validation
├── config/ # environment, db
├── utils/ # helper functions
├── app.ts # main entry

🔐 Authentication & Roles

✅ JWT-based Authentication

✅ Roles:

admin

sender

receiver

🚀 Features
👤 Sender

Create parcel request

Cancel parcel (if not dispatched)

View own parcels + status logs

📥 Receiver

View incoming parcels

Confirm delivery

Check delivery history

🛡 Admin

Manage all users & parcels

Block/unblock users or parcels

Update parcel statuses (e.g., Approved → Dispatched → Delivered)

📦 Parcel & Status Flow

Parcel Statuses:
Requested → Approved → Dispatched → In Transit → Delivered

Tracking ID:
Format → TRK-YYYYMMDD-xxxxxx

Status Log Schema:

{
status: string,
note?: string,
updatedBy: string, // admin/system/user
timestamp: Date
}

📜 API Endpoints
🔑 Auth

POST /api/v1/auth/register → Register new user

POST /api/v1/auth/login → Login & get JWT

👤 User

PATCH /api/v1/user/block/:id → Admin block user

PATCH /api/v1/user/unblock/:id → Admin unblock user

📦 Parcel

POST /api/v1/parcels → Sender create parcel

GET /api/v1/parcels/me → Sender view own parcels

PATCH /api/v1/parcels/cancel/:id → Sender cancel parcel

GET /api/v1/parcels/incoming → Receiver view incoming parcels

PATCH /api/v1/parcels/confirm/:id → Receiver confirm delivery

GET /api/v1/parcels → Admin get all parcels

PATCH /api/v1/parcels/status/:id → Admin update parcel status

🔒 Access Control
Endpoint Sender Receiver Admin
Register/Login ✅ ✅ ✅
Create Parcel ✅ ❌ ❌
Cancel Parcel ✅ (own only) ❌ ❌
View My Parcels ✅ ❌ ❌
Incoming Parcels ❌ ✅ ❌
Confirm Delivery ❌ ✅ ❌
All Parcels ❌ ❌ ✅
Block/Unblock User ❌ ❌ ✅
Update Parcel Status ❌ ❌ ✅
🧪 Testing & Documentation

✅ Postman Collection included with:

Valid & Invalid requests

Query param filtering

Authentication flows

🧠 Future Enhancements (Optional)

Public Tracking via Tracking ID

Fee Calculation (weight/distance based)

Coupons & Discounts

Delivery Agent Assignment
