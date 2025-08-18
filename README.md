Parcel Delivery API

A secure, modular, and role-based backend API for a parcel delivery system inspired by real-world platforms like Pathao Courier and Sundarban. Built with Express.js and Mongoose, this system handles user authentication, parcel operations, and delivery status tracking with proper business rules and validations.

Live Link
https://parcel-delivery-system-api.vercel.app/

Admin, Sender, Receiver Credentials
Admin:
email: admin@gmail.com
password: Admin@123

Sender:
email: sender@gmail.com
password: Sender@123

Receiver:
email: receiver@gmail.com
password: Receiver@123

Features

JWT-based login and registration

Role-based access control (admin, sender, receiver)

Sender can create parcel requests, cancel (if not dispatched), view all parcels & logs

Receiver can view incoming parcels, confirm delivery, see history

Admin can manage users and parcels, block/unblock, update statuses

Unique tracking ID system for each parcel (e.g., TRK-YYYYMMDD-xxxxxx)

Status logs embedded in parcel schema (Requested → Approved → Dispatched → In Transit → Delivered)

Proper validation & transactional logic

Modular, scalable project structure

🛠 Technologies Used

Node.js

Express.js

TypeScript

MongoDB

Mongoose

bcryptjs

jsonwebtoken

cookie-parser

http-status-codes

dotenv

Installation & Setup
git clone https://github.com/your-username/parcel-delivery-api.git

cd parcel-delivery-api

npm install

npm run dev

Make sure you have a MongoDB connection string set in your .env file

Project Structure
src/
├── modules/
│ ├── auth/
│ │ ├── auth.controller.ts
│ │ ├── auth.routes.ts
│ │ ├── auth.service.ts
│ │
│ ├── user/
│ │ ├── user.controller.ts
│ │ ├── user.interface.ts
│ │ ├── user.model.ts
│ │ ├── user.routes.ts
│ │ ├── user.service.ts
│ │ └── user.zod.validation.ts
│ │
│ ├── parcel/
│ │ ├── parcel.controller.ts
│ │ ├── parcel.interface.ts
│ │ ├── parcel.model.ts
│ │ ├── parcel.routes.ts
│ │ ├── parcel.service.ts
│ │ └── parcel.zod.validation.ts
│
├── routes/
│ └── routes.ts
│
├── middlewares/
│ ├── checkAuth.ts
│ ├── globalErrorHandler.ts
│ └── notFound.ts
│
├── utils/
│ ├── catchAsync.ts
│ ├── sendResponse.ts
│ └── setToken.ts
│
└── errorHelpers/
└── AppError.ts

API Endpoints
Auth Endpoints

1. Register User (Sender/Receiver)
   POST /api/v1/auth/register

{
"name": "Toma",
"email": "toma@gmail.com",
"password": "Password@123",
"role": "sender",
"phone": "+8801700000000",
"address": "123 Gulshan Avenue, Dhaka"
}

2. Login User
   POST /api/v1/auth/login

{
"email": "admin@gmail.com",
"password": "Admin123@"
}

User Endpoints

1. Get All Users (Admin)
   GET /api/v1/users

2. Block User (Admin)
   PATCH /api/v1/users/block/:id

3. Unblock User (Admin)
   PATCH /api/v1/users/unblock/:id

Parcel Endpoints

1. Create Parcel (Sender)
   POST /api/v1/parcels

{
"type": "Documents",
"weight": 2,
"senderAddress": "Banani, Dhaka",
"receiverAddress": "Chittagong",
"receiverId": "68a0cc540112c89682778701",
"fee": 200
}

2. Cancel Parcel (Sender)
   PATCH /api/v1/parcels/cancel/:id

3. View My Parcels (Sender)
   GET /api/v1/parcels/me

4. View Incoming Parcels (Receiver)
   GET /api/v1/parcels/incoming

5. Confirm Delivery (Receiver)
   PATCH /api/v1/parcels/confirm/:id

6. Update Parcel Status (Admin)
   PATCH /api/v1/parcels/status/:id

{
"status": "IN_TRANSIT"
}

7. Get All Parcels (Admin)
   GET /api/v1/parcels

Example Status Flow

REQUESTED → APPROVED → DISPATCHED → IN_TRANSIT → DELIVERED

Each status change is logged inside statusLogs[] with:

{
"status": "DISPATCHED",
"timestamp": "2025-08-18T10:00:00Z",
"updatedBy": "admin"
}

Dependencies

"bcryptjs"

"cookie-parser"

"cors"

"dotenv"

"express"

"http-status-codes"

"jsonwebtoken"

"mongoose"

"zod"

DevDependencies

"@types/cookie-parser"

"@types/cors"

"@types/express"

"@types/jsonwebtoken"

"ts-node-dev"

"typescript"
