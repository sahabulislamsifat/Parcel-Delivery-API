# Parcel Delivery API

- A secure, modular, and role-based backend API for a parcel delivery system inspired by real-world platforms like _Pathao Courier_ and _Sundarban_. Built with _Express.js_ and _Mongoose_, this system handles user authentication, parcel operations, and delivery management with robust business rules and validations.

---

## Live Link

```
https://parcel-delivery-system-api.vercel.app
```

## Admin, Sender And Receiver Email, Password

Admin:\
email: [admin@gmail.com](mailto:admin@gmail.com)\
password: Admin@123

Sender:\
email: [sender@gmail.com](mailto:sender@gmail.com)\
password: Sender@123

Receiver:\
email: [receiver@gmail.com](mailto:receiver@gmail.com)\
password: Receiver@123

---

## Features

- JWT-based login and registration
- Role-based access control (admin, sender, receiver)
- Automatic tracking ID generation for each parcel
- **Sender** can create parcel requests, cancel if not dispatched, view parcel history and logs
- **Receiver** can view incoming parcels, confirm delivery, view parcel history
- **Admin** can manage users and parcels, block/unblock users, update parcel statuses
- Complete parcel tracking with `statusLogs`
- Status flow: _Requested → Approved → Dispatched → In Transit → Delivered_
- Modular, scalable project structure

---

## Technologies Used

- _Node.js_
- _Express.js_
- _TypeScript_
- _MongoDB_
- _Mongoose_
- _ts-node-dev_
- _dotenv_
- _bcryptjs_
- _cookie-parser_
- _http-status-codes_
- _jsonwebtoken_

---

## Installation & Setup

```bash
git clone https://github.com/sahabulislamsifat/parcel-delivery-api.git
cd parcel-delivery-api
npm install
npm run dev
```

👉 Make sure you have a MongoDB connection string set in your `.env` file.

---

## Project Structure

```
src/
├── modules/
│   ├── auth/
│   │   ├── auth.controller.ts
│   │   ├── auth.routes.ts
│   │   ├── auth.service.ts
│   │
│   ├── user/
│   │   ├── user.controller.ts
│   │   ├── user.interface.ts
│   │   ├── user.model.ts
│   │   ├── user.routes.ts
│   │   ├── user.service.ts
│   │   └── user.zod.validation.ts
│   │
│   ├── parcel/
│   │   ├── parcel.controller.ts
│   │   ├── parcel.interface.ts
│   │   ├── parcel.model.ts
│   │   ├── parcel.routes.ts
│   │   ├── parcel.service.ts
│   │   └── parcel.zod.validation.ts
│
├── routes/
│   └── routes.ts
│
├── middlewares/
│   ├── checkAuth.ts
│   ├── globalErrorHandler.ts
│   └── notFound.ts
│
├── utils/
│   ├── catchAsync.ts
│   ├── sendResponse.ts
│   └── setToken.ts
│
└── errorHelpers/
    └── AppError.ts
```

---

## API Endpoints

### User Endpoints

#### 1. User Registration

```
POST /api/v1/auth/register
```

Request Body:

```json
{
  "name": "Toma",
  "email": "toma@gmail.com",
  "password": "Password@123",
  "role": "sender",
  "phone": "+8801706835770",
  "address": "123 Gulshan Avenue, Dhaka, Bangladesh"
}
```

#### 2. Get All Users (Admin)

```
GET /api/v1/user
```

#### 3. Block User (Admin)

```
PATCH /api/v1/user/block/:id
```

#### 4. Unblock User (Admin)

```
PATCH /api/v1/user/unblock/:id
```

---

### Auth Endpoints

#### 1. User Login

```
POST /api/v1/auth/login
```

Request Body:

```json
{
  "email": "admin@gmail.com",
  "password": "Admin@123"
}
```

#### 2. User Logout

```
POST /api/v1/auth/logout
```

Response:

```json
{
  "success": true,
  "message": "User logged out successfully"
}
```

---

### Parcel Endpoints

#### 1. Create Parcel (Sender)

```
POST /api/v1/parcel
```

Request Body:

```json
{
  "type": "Documents",
  "weight": 2,
  "senderAddress": "Banani, Dhaka",
  "receiverAddress": "Chittagong",
  "receiverId": "68a0cc540112c89682778701",
  "fee": 200
}
```

#### 2. Cancel Parcel (Sender)

```
PATCH /api/v1/parcel/cancel/:id
```

#### 3. View My Parcels (Sender)

```
GET /api/v1/parcel/me
```

#### 4. View Incoming Parcels (Receiver)

```
GET /api/v1/parcel/incoming
```

#### 5. Confirm Delivery (Receiver)

```
PATCH /api/v1/parcel/confirm/:id
```

#### 6. Update Parcel Status (Admin)

```
PATCH /api/v1/parcel/status/:id
```

Request Body:

```json
{
  "status": "IN_TRANSIT"
}
```

#### 7. Get All Parcels (Admin)

```
GET /api/v1/parcel
```

---

## Dependencies

- "bcryptjs": "^3.0.2"
- "cookie-parser": "^1.4.7"
- "cors": "^2.8.5"
- "dotenv": "^17.2.0"
- "express": "^5.1.0"
- "http-status-codes": "^2.3.0"
- "jsonwebtoken": "^9.0.2"
- "mongoose": "^8.16.4"
- "zod": "^3.25.76"

## DevDependencies

- "@types/cookie-parser": "^1.4.9"
- "@types/cors": "^2.8.19"
- "@types/express": "^5.0.3"
- "@types/jsonwebtoken": "^9.0.10"
- "ts-node-dev": "^2.0.0"
- "typescript": "^5.8.3"

---
