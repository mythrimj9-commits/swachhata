# Swachhata 2.0 - Backend API

AI-Enabled Citizen Complaint and Enforcement System for Illegal Garbage Dumping

## Tech Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB Atlas (Mongoose ODM)
- **Authentication**: JWT (Access + Refresh tokens)
- **Image Storage**: Cloudinary
- **OCR**: Tesseract.js
- **Email**: Nodemailer

## Quick Start

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment

Copy `.env.example` to `.env` and update the values:

```bash
cp .env.example .env
```

Required environment variables:
- `MONGODB_URI` - MongoDB connection string
- `JWT_SECRET` - Secret for access tokens
- `JWT_REFRESH_SECRET` - Secret for refresh tokens
- `CLOUDINARY_CLOUD_NAME` - Cloudinary cloud name
- `CLOUDINARY_API_KEY` - Cloudinary API key
- `CLOUDINARY_API_SECRET` - Cloudinary API secret

### 3. Run Development Server

```bash
npm run dev
```

Server will start at `http://localhost:5000`

### 4. Super Admin

On first run, a super admin account is automatically created:
- **Email**: Value from `SUPER_ADMIN_EMAIL` env var
- **Password**: Value from `SUPER_ADMIN_PASSWORD` env var

## API Endpoints

### Authentication (`/api/auth`)

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/register` | Register citizen |
| POST | `/login` | Login (all roles) |
| POST | `/verify-otp` | Verify admin OTP |
| POST | `/resend-otp` | Resend OTP |
| GET | `/me` | Get current user |
| PUT | `/update-profile` | Update profile |
| POST | `/refresh-token` | Refresh access token |
| POST | `/logout` | Logout |

### Citizen (`/api/citizen`)

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/complaints` | Submit complaint (with image) |
| GET | `/complaints` | Get my complaints |
| GET | `/complaints/:id` | Get complaint details |
| GET | `/fines` | Get my fines |
| POST | `/fines/:id/pay` | Pay fine (mock) |
| GET | `/payment-history` | Get payment history |

### Admin (`/api/admin`)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/complaints` | Get all complaints |
| GET | `/complaints/:id` | Get complaint details |
| PUT | `/complaints/:id/verify` | Verify vehicle number |
| PUT | `/complaints/:id/status` | Update status |
| DELETE | `/complaints/:id` | Delete complaint |
| POST | `/complaints/:id/fine` | Issue fine |
| GET | `/fines` | Get all fines |
| GET | `/statistics` | Get dashboard stats |

### Super Admin (`/api/superadmin`)

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/admins` | Create admin |
| GET | `/admins` | List admins |
| PUT | `/admins/:id` | Update admin |
| DELETE | `/admins/:id` | Delete admin |
| POST | `/admins/:id/resend-otp` | Resend OTP |
| GET | `/statistics` | System statistics |

### Public (`/api/public`)

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/anonymous-complaint` | Submit anonymous |
| GET | `/statistics` | Public stats |
| GET | `/track/:id` | Track complaint |

## Folder Structure

```
backend/
├── src/
│   ├── config/         # Configuration files
│   ├── controllers/    # Route handlers
│   ├── middleware/     # Express middleware
│   ├── models/         # Mongoose schemas
│   ├── routes/         # API routes
│   ├── services/       # Business logic
│   ├── utils/          # Helpers & utilities
│   └── app.js          # Express app setup
├── server.js           # Entry point
├── package.json
└── .env.example
```

## License

ISC
