# Swachhata 2.0 – AI-Enabled Citizen Complaint and Enforcement System

## Complete Final-Year Project Plan

---

# 1. PROJECT TITLE & ABSTRACT

## Title
**"Swachhata 2.0 – AI-Enabled Citizen Complaint and Enforcement System for Illegal Garbage Dumping"**

## Abstract
Swachhata 2.0 is a full-stack web application designed to digitize and streamline the process of reporting, tracking, and penalizing illegal garbage dumping in urban areas. Built on the MERN stack with integrated AI-powered OCR (Tesseract.js), the system enables citizens to submit geo-tagged image complaints, automatically extracts vehicle registration numbers, and facilitates municipal officers in verifying complaints and issuing fines. The platform supports three user roles—Citizen, Admin, and Super Admin—with JWT-based authentication and role-specific dashboards. Key features include anonymous reporting, GPS-based location capture, Cloudinary image storage, mock payment integration, and a complete complaint lifecycle from submission to case closure. This project aligns with India's Swachh Bharat Mission and demonstrates practical application of AI in e-governance.

**Keywords**: Swachh Bharat, MERN Stack, Tesseract.js, OCR, Vehicle Detection, E-Governance, Citizen Engagement

---

# 2. SYSTEM ARCHITECTURE

## 2.1 High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────────────┐
│                           CLIENT LAYER                                   │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │              React (Vite) Frontend - Vercel                      │   │
│  │  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐        │   │
│  │  │ Citizen  │  │  Admin   │  │  Super   │  │  Public  │        │   │
│  │  │Dashboard │  │Dashboard │  │  Admin   │  │  Pages   │        │   │
│  │  └──────────┘  └──────────┘  └──────────┘  └──────────┘        │   │
│  └─────────────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────────┘
                                    │
                                    │ HTTPS / REST API
                                    ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                           SERVER LAYER                                   │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │           Node.js + Express Backend - Railway                    │   │
│  │  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐        │   │
│  │  │   Auth   │  │Complaint │  │   Fine   │  │  Admin   │        │   │
│  │  │  Routes  │  │  Routes  │  │  Routes  │  │  Routes  │        │   │
│  │  └──────────┘  └──────────┘  └──────────┘  └──────────┘        │   │
│  │                      │                                           │   │
│  │              ┌───────┴───────┐                                   │   │
│  │              │  Middleware   │                                   │   │
│  │              │ (JWT, Roles)  │                                   │   │
│  │              └───────────────┘                                   │   │
│  └─────────────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────────┘
          │                    │
          ▼                    ▼
┌──────────────────┐  ┌──────────────────┐
│   MongoDB Atlas  │  │    Cloudinary    │
│   (Database)     │  │ (Image Storage)  │
│                  │  │                  │
│  - Users         │  │  - Complaint     │
│  - Complaints    │  │    Images        │
│  - Fines         │  │                  │
│  - Payments      │  │                  │
└──────────────────┘  └──────────────────┘

 Note: AI/OCR (Tesseract.js) is integrated directly in the Node.js backend
```

## 2.2 Data Flow Architecture

```
┌──────────────────────────────────────────────────────────────────┐
│                    COMPLAINT SUBMISSION FLOW                      │
├──────────────────────────────────────────────────────────────────┤
│                                                                   │
│   Citizen                 Backend                  AI Service    │
│     │                        │                         │         │
│     │  1. Submit Complaint   │                         │         │
│     │  (Image + GPS)         │                         │         │
│     │ ─────────────────────► │                         │         │
│     │                        │  2. Upload to Cloudinary│         │
│     │                        │ ─────────────────────►  │         │
│     │                        │                         │         │
│     │                        │  3. Send Image URL      │         │
│     │                        │ ─────────────────────► │         │
│     │                        │                         │         │
│     │                        │  4. Return Vehicle No.  │         │
│     │                        │ ◄───────────────────── │         │
│     │                        │                         │         │
│     │  5. Complaint Created  │                         │         │
│     │ ◄───────────────────── │                         │         │
│     │                        │                         │         │
└──────────────────────────────────────────────────────────────────┘
```

## 2.3 Component Explanation (Viva-Ready)

| Component | Technology | Purpose | Deployment |
|-----------|------------|---------|------------|
| Frontend | React + Vite | User interface, role-based dashboards | Vercel |
| Backend | Node.js + Express | REST API, business logic, authentication, AI/OCR | Railway |
| Database | MongoDB Atlas | Data persistence (NoSQL) | Cloud |
| Image Storage | Cloudinary | Secure image hosting with CDN | Cloud |
| OCR Engine | Tesseract.js | Vehicle number plate extraction (integrated in backend) | Railway |
| Maps | Mapbox/Google Maps | GPS visualization & correction | Embedded |

---

# 3. DATABASE SCHEMA

## 3.1 Collections Overview

### Collection: `users`
```javascript
{
  _id: ObjectId,
  email: String,              // Required, unique
  password: String,           // Hashed (bcrypt)
  role: String,               // 'citizen' | 'admin' | 'superadmin'
  name: String,               // Optional for citizens
  phone: String,              // Optional
  isVerified: Boolean,        // Email verification status
  otp: String,                // For admin OTP verification
  otpExpiry: Date,            // OTP expiration time
  createdBy: ObjectId,        // Reference to superadmin (for admins)
  createdAt: Date,
  updatedAt: Date
}
```

### Collection: `complaints`
```javascript
{
  _id: ObjectId,
  
  // Complainant Details
  userId: ObjectId,           // Reference to users (null if anonymous)
  isAnonymous: Boolean,       // Anonymous report flag
  
  // Complaint Content
  imageUrl: String,           // Cloudinary URL
  imagePublicId: String,      // Cloudinary public ID
  description: String,        // Optional description
  
  // Location Data
  location: {
    type: String,             // 'Point'
    coordinates: [Number],    // [longitude, latitude]
  },
  address: String,            // Human-readable address
  
  // AI Extraction
  extractedVehicleNo: String, // AI-extracted vehicle number
  verifiedVehicleNo: String,  // Admin-verified vehicle number
  aiConfidence: Number,       // 0-100 confidence score
  
  // Status Management
  status: String,             // 'submitted' | 'verified' | 'fined' | 'closed' | 'rejected'
  statusHistory: [{
    status: String,
    changedBy: ObjectId,
    changedAt: Date,
    remarks: String
  }],
  
  // Admin Actions
  verifiedBy: ObjectId,       // Admin who verified
  verifiedAt: Date,
  rejectionReason: String,    // If rejected
  
  // Timestamps
  createdAt: Date,
  updatedAt: Date
}
```

### Collection: `fines`
```javascript
{
  _id: ObjectId,
  complaintId: ObjectId,      // Reference to complaints
  vehicleNo: String,          // Final verified vehicle number
  
  // Fine Details
  amount: Number,             // Fine amount in INR
  remarks: String,            // Admin remarks
  issuedBy: ObjectId,         // Admin who issued
  issuedAt: Date,
  
  // Payment Status
  paymentStatus: String,      // 'unpaid' | 'paid'
  paidAt: Date,               // When payment was made
  paymentReference: String,   // Mock payment reference
  
  // Timestamps
  createdAt: Date,
  updatedAt: Date
}
```

### Collection: `statistics` (Aggregated)
```javascript
{
  _id: ObjectId,
  date: Date,                 // Daily aggregation
  totalComplaints: Number,
  resolvedComplaints: Number,
  pendingComplaints: Number,
  totalFinesIssued: Number,
  totalAmountCollected: Number,
  totalAmountPending: Number
}
```

## 3.2 Indexes for Performance
```javascript
// Users
db.users.createIndex({ email: 1 }, { unique: true })
db.users.createIndex({ role: 1 })

// Complaints
db.complaints.createIndex({ status: 1 })
db.complaints.createIndex({ userId: 1 })
db.complaints.createIndex({ createdAt: -1 })
db.complaints.createIndex({ location: "2dsphere" })

// Fines
db.fines.createIndex({ complaintId: 1 }, { unique: true })
db.fines.createIndex({ vehicleNo: 1 })
db.fines.createIndex({ paymentStatus: 1 })
```

---

# 4. REST API ROUTES

## 4.1 Authentication Routes (`/api/auth`)

| Method | Endpoint | Purpose | Auth Required |
|--------|----------|---------|---------------|
| POST | `/register` | Citizen registration | No |
| POST | `/login` | User login (all roles) | No |
| POST | `/verify-email` | Email verification | No |
| POST | `/forgot-password` | Password reset request | No |
| POST | `/reset-password` | Password reset | No |
| GET | `/me` | Get current user profile | Yes |
| PUT | `/update-profile` | Update user profile | Yes |
| POST | `/refresh-token` | Refresh JWT token | Yes |

## 4.2 Citizen Routes (`/api/citizen`)

| Method | Endpoint | Purpose | Auth Required |
|--------|----------|---------|---------------|
| POST | `/complaints` | Submit new complaint | Yes/Anonymous |
| GET | `/complaints` | Get user's complaints | Yes |
| GET | `/complaints/:id` | Get complaint details | Yes |
| GET | `/fines` | Get user's fines | Yes |
| POST | `/fines/:id/pay` | Mock payment | Yes |
| GET | `/payment-history` | Get payment history | Yes |

## 4.3 Admin Routes (`/api/admin`)

| Method | Endpoint | Purpose | Auth Required |
|--------|----------|---------|---------------|
| GET | `/complaints` | Get all complaints | Admin |
| GET | `/complaints/:id` | Get complaint details | Admin |
| PUT | `/complaints/:id/verify` | Verify vehicle number | Admin |
| PUT | `/complaints/:id/status` | Update complaint status | Admin |
| DELETE | `/complaints/:id` | Delete fake complaint | Admin |
| POST | `/complaints/:id/fine` | Issue fine | Admin |
| GET | `/fines` | Get all fines | Admin |
| GET | `/statistics` | Get dashboard stats | Admin |

## 4.4 Super Admin Routes (`/api/superadmin`)

| Method | Endpoint | Purpose | Auth Required |
|--------|----------|---------|---------------|
| POST | `/admins` | Create new admin | Super Admin |
| GET | `/admins` | List all admins | Super Admin |
| PUT | `/admins/:id` | Update admin | Super Admin |
| DELETE | `/admins/:id` | Delete admin | Super Admin |
| POST | `/admins/:id/resend-otp` | Resend OTP to admin | Super Admin |
| GET | `/statistics` | System-wide statistics | Super Admin |
| GET | `/reports` | Generate reports | Super Admin |

## 4.5 Public Routes (`/api/public`)

| Method | Endpoint | Purpose | Auth Required |
|--------|----------|---------|---------------|
| POST | `/anonymous-complaint` | Submit anonymous complaint | No |
| GET | `/statistics` | Public statistics | No |

---

# 5. BACKEND FOLDER STRUCTURE

```
backend/
├── src/
│   ├── config/
│   │   ├── db.js                 # MongoDB connection
│   │   ├── cloudinary.js         # Cloudinary config
│   │   └── env.js                # Environment variables
│   │
│   ├── middleware/
│   │   ├── auth.js               # JWT verification
│   │   ├── roleCheck.js          # Role-based access
│   │   ├── errorHandler.js       # Global error handling
│   │   ├── validator.js          # Input validation
│   │   └── upload.js             # Multer config for images
│   │
│   ├── models/
│   │   ├── User.js               # User schema
│   │   ├── Complaint.js          # Complaint schema
│   │   ├── Fine.js               # Fine schema
│   │   └── index.js              # Export all models
│   │
│   ├── routes/
│   │   ├── auth.routes.js        # Authentication routes
│   │   ├── citizen.routes.js     # Citizen routes
│   │   ├── admin.routes.js       # Admin routes
│   │   ├── superadmin.routes.js  # Super admin routes
│   │   ├── public.routes.js      # Public routes
│   │   └── index.js              # Route aggregator
│   │
│   ├── controllers/
│   │   ├── auth.controller.js    # Auth logic
│   │   ├── citizen.controller.js # Citizen logic
│   │   ├── admin.controller.js   # Admin logic
│   │   ├── superadmin.controller.js # Super admin logic
│   │   └── public.controller.js  # Public logic
│   │
│   ├── services/
│   │   ├── email.service.js      # Email/OTP sending
│   │   ├── cloudinary.service.js # Image upload/delete
│   │   ├── ocr.service.js        # Tesseract.js OCR extraction
│   │   └── payment.service.js    # Mock payment logic
│   │
│   ├── utils/
│   │   ├── jwt.js                # JWT helper functions
│   │   ├── hash.js               # Password hashing
│   │   ├── otp.js                # OTP generation
│   │   ├── validators.js         # Validation schemas
│   │   └── constants.js          # App constants
│   │
│   └── app.js                    # Express app setup
│
├── tests/
│   ├── auth.test.js
│   ├── complaint.test.js
│   └── fine.test.js
│
├── .env.example                  # Environment template
├── package.json
├── server.js                     # Entry point
└── README.md
```

---

# 6. FRONTEND PAGE STRUCTURE

```
frontend/
├── public/
│   ├── favicon.ico
│   └── logo.png
│
├── src/
│   ├── assets/
│   │   ├── images/
│   │   └── icons/
│   │
│   ├── components/
│   │   ├── common/
│   │   │   ├── Navbar.jsx
│   │   │   ├── Footer.jsx
│   │   │   ├── Sidebar.jsx
│   │   │   ├── Button.jsx
│   │   │   ├── Card.jsx
│   │   │   ├── Modal.jsx
│   │   │   ├── Loader.jsx
│   │   │   └── Toast.jsx
│   │   │
│   │   ├── forms/
│   │   │   ├── LoginForm.jsx
│   │   │   ├── RegisterForm.jsx
│   │   │   ├── ComplaintForm.jsx
│   │   │   └── FineForm.jsx
│   │   │
│   │   ├── maps/
│   │   │   ├── LocationPicker.jsx
│   │   │   └── ComplaintMap.jsx
│   │   │
│   │   └── dashboard/
│   │       ├── StatCard.jsx
│   │       ├── ComplaintTable.jsx
│   │       ├── FineTable.jsx
│   │       └── StatusBadge.jsx
│   │
│   ├── pages/
│   │   ├── public/
│   │   │   ├── HomePage.jsx
│   │   │   ├── LoginPage.jsx
│   │   │   ├── RegisterPage.jsx
│   │   │   ├── ForgotPasswordPage.jsx
│   │   │   └── AnonymousComplaintPage.jsx
│   │   │
│   │   ├── citizen/
│   │   │   ├── CitizenDashboard.jsx
│   │   │   ├── NewComplaintPage.jsx
│   │   │   ├── MyComplaintsPage.jsx
│   │   │   ├── ComplaintDetailsPage.jsx
│   │   │   ├── MyFinesPage.jsx
│   │   │   ├── PaymentPage.jsx
│   │   │   └── ProfilePage.jsx
│   │   │
│   │   ├── admin/
│   │   │   ├── AdminDashboard.jsx
│   │   │   ├── AllComplaintsPage.jsx
│   │   │   ├── VerifyComplaintPage.jsx
│   │   │   ├── IssueFineePage.jsx
│   │   │   ├── AllFinesPage.jsx
│   │   │   └── ReportsPage.jsx
│   │   │
│   │   └── superadmin/
│   │       ├── SuperAdminDashboard.jsx
│   │       ├── ManageAdminsPage.jsx
│   │       ├── CreateAdminPage.jsx
│   │       ├── SystemStatisticsPage.jsx
│   │       └── AuditLogsPage.jsx
│   │
│   ├── context/
│   │   ├── AuthContext.jsx       # Authentication state
│   │   └── ToastContext.jsx      # Toast notifications
│   │
│   ├── hooks/
│   │   ├── useAuth.js            # Auth hook
│   │   ├── useLocation.js        # GPS hook
│   │   └── useFetch.js           # API fetching
│   │
│   ├── services/
│   │   ├── api.js                # Axios instance
│   │   ├── auth.service.js       # Auth API calls
│   │   ├── complaint.service.js  # Complaint API calls
│   │   └── admin.service.js      # Admin API calls
│   │
│   ├── utils/
│   │   ├── constants.js
│   │   ├── helpers.js
│   │   └── validators.js
│   │
│   ├── routes/
│   │   ├── PrivateRoute.jsx      # Auth protection
│   │   ├── RoleRoute.jsx         # Role-based routing
│   │   └── AppRoutes.jsx         # Route definitions
│   │
│   ├── styles/
│   │   ├── index.css             # Global styles
│   │   ├── variables.css         # CSS variables
│   │   └── components/           # Component styles
│   │
│   ├── App.jsx                   # Main app component
│   └── main.jsx                  # Entry point
│
├── .env.example
├── package.json
├── vite.config.js
└── README.md
```

---

# 7. OCR SERVICE (Tesseract.js - Integrated in Backend)

## 7.1 Why Tesseract.js?

| Feature | Benefit |
|---------|---------|
| Pure JavaScript | No separate Python service needed |
| Single Deployment | Only backend to Railway |
| Easy Maintenance | One codebase, one language |
| Free & Open Source | No API costs |
| Good Accuracy | Sufficient for demo/viva |

## 7.2 Core Algorithm Flow

```
┌─────────────────────────────────────────────────────────────────────┐
│                    VEHICLE NUMBER EXTRACTION FLOW                    │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  1. RECEIVE IMAGE (Cloudinary URL or Buffer)                        │
│     │                                                                │
│     ▼                                                                │
│  2. DOWNLOAD IMAGE (if URL)                                         │
│     │                                                                │
│     ▼                                                                │
│  3. OCR EXTRACTION (Tesseract.js)                                   │
│     ├─ Load Tesseract worker                                        │
│     ├─ Recognize text in image                                      │
│     └─ Extract all detected text                                    │
│     │                                                                │
│     ▼                                                                │
│  4. PATTERN MATCHING                                                │
│     ├─ Regex: Indian plate format                                   │
│     │   (e.g., MH 01 AB 1234)                                       │
│     └─ Calculate confidence score                                   │
│     │                                                                │
│     ▼                                                                │
│  5. RETURN RESULT                                                   │
│     ├─ vehicleNo: "MH01AB1234"                                      │
│     ├─ confidence: 85                                               │
│     └─ rawText: ["MH", "01", "AB", "1234"]                          │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘
```

## 7.3 Code Implementation

### Installation
```bash
npm install tesseract.js axios
```

### services/ocr.service.js
```javascript
const Tesseract = require('tesseract.js');
const axios = require('axios');

// Indian vehicle plate pattern (e.g., MH01AB1234, KA 05 MN 1234)
const PLATE_PATTERN = /[A-Z]{2}\s*\d{1,2}\s*[A-Z]{1,3}\s*\d{1,4}/gi;

/**
 * Extract vehicle number from image URL
 * @param {string} imageUrl - Cloudinary image URL
 * @returns {Promise<{vehicleNo: string|null, confidence: number, rawText: string}>}
 */
async function extractVehicleNumber(imageUrl) {
  try {
    // Download image as buffer
    const response = await axios.get(imageUrl, { responseType: 'arraybuffer' });
    const imageBuffer = Buffer.from(response.data);

    // Perform OCR
    const result = await Tesseract.recognize(imageBuffer, 'eng', {
      logger: m => console.log(m) // Optional: log progress
    });

    const rawText = result.data.text;
    const confidence = result.data.confidence;

    // Find vehicle number patterns
    const matches = rawText.match(PLATE_PATTERN);
    
    let vehicleNo = null;
    if (matches && matches.length > 0) {
      // Clean up the match (remove spaces, uppercase)
      vehicleNo = matches[0].replace(/\s/g, '').toUpperCase();
    }

    return {
      vehicleNo,
      confidence: Math.round(confidence),
      rawText: rawText.trim()
    };

  } catch (error) {
    console.error('OCR Error:', error.message);
    return {
      vehicleNo: null,
      confidence: 0,
      rawText: '',
      error: error.message
    };
  }
}

/**
 * Extract vehicle number from image buffer (for direct upload)
 * @param {Buffer} imageBuffer - Image buffer
 * @returns {Promise<{vehicleNo: string|null, confidence: number, rawText: string}>}
 */
async function extractFromBuffer(imageBuffer) {
  try {
    const result = await Tesseract.recognize(imageBuffer, 'eng');
    const rawText = result.data.text;
    const confidence = result.data.confidence;

    const matches = rawText.match(PLATE_PATTERN);
    let vehicleNo = null;
    
    if (matches && matches.length > 0) {
      vehicleNo = matches[0].replace(/\s/g, '').toUpperCase();
    }

    return {
      vehicleNo,
      confidence: Math.round(confidence),
      rawText: rawText.trim()
    };

  } catch (error) {
    console.error('OCR Error:', error.message);
    return {
      vehicleNo: null,
      confidence: 0,
      rawText: '',
      error: error.message
    };
  }
}

module.exports = {
  extractVehicleNumber,
  extractFromBuffer
};
```

### Usage in Controller (citizen.controller.js)
```javascript
const ocrService = require('../services/ocr.service');
const cloudinaryService = require('../services/cloudinary.service');

async function createComplaint(req, res) {
  try {
    // 1. Upload image to Cloudinary
    const uploadResult = await cloudinaryService.uploadImage(req.file);
    
    // 2. Extract vehicle number using OCR
    const ocrResult = await ocrService.extractVehicleNumber(uploadResult.url);
    
    // 3. Create complaint with extracted data
    const complaint = new Complaint({
      userId: req.user?.id || null,
      isAnonymous: !req.user,
      imageUrl: uploadResult.url,
      imagePublicId: uploadResult.publicId,
      location: {
        type: 'Point',
        coordinates: [req.body.longitude, req.body.latitude]
      },
      address: req.body.address,
      description: req.body.description,
      extractedVehicleNo: ocrResult.vehicleNo,
      aiConfidence: ocrResult.confidence,
      status: 'submitted'
    });
    
    await complaint.save();
    
    res.status(201).json({
      success: true,
      message: 'Complaint submitted successfully',
      data: complaint
    });
    
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
}
```

---

# 8. COMPLAINT LIFECYCLE (Exam-Ready)

## 8.1 State Diagram

```
┌───────────────────────────────────────────────────────────────────────┐
│                     COMPLAINT LIFECYCLE STATES                         │
├───────────────────────────────────────────────────────────────────────┤
│                                                                        │
│    ┌──────────┐                                                       │
│    │  START   │                                                       │
│    └────┬─────┘                                                       │
│         │                                                              │
│         ▼                                                              │
│    ┌──────────┐     Citizen submits     ┌──────────────┐             │
│    │ CITIZEN  │ ──────────────────────► │  SUBMITTED   │             │
│    │ SUBMITS  │     complaint with      │   (Pending)  │             │
│    └──────────┘     image + GPS         └──────┬───────┘             │
│                                                 │                      │
│                                    ┌────────────┼────────────┐        │
│                                    │            │            │        │
│                                    ▼            ▼            ▼        │
│                              ┌──────────┐  ┌─────────┐  ┌─────────┐  │
│                              │ VERIFIED │  │REJECTED │  │ DELETED │  │
│                              │          │  │         │  │ (Fake)  │  │
│                              └────┬─────┘  └─────────┘  └─────────┘  │
│                                   │                                   │
│                                   │ Admin issues fine                │
│                                   ▼                                   │
│                              ┌──────────┐                             │
│                              │  FINED   │                             │
│                              │ (Unpaid) │                             │
│                              └────┬─────┘                             │
│                                   │                                   │
│                                   │ Citizen pays fine                │
│                                   ▼                                   │
│                              ┌──────────┐                             │
│                              │  CLOSED  │                             │
│                              │  (Paid)  │                             │
│                              └──────────┘                             │
│                                                                        │
└───────────────────────────────────────────────────────────────────────┘
```

## 8.2 Detailed Steps with Actors

| Step | Actor | Action | System Response |
|------|-------|--------|-----------------|
| 1 | Citizen | Opens app, uploads image of illegal dumping | GPS auto-captured, image preview shown |
| 2 | Citizen | Reviews location on map, adjusts if needed | Map marker updated |
| 3 | Citizen | Submits complaint | Status = "SUBMITTED" |
| 4 | System | Uploads image to Cloudinary | Returns secure URL |
| 5 | System | Calls AI microservice with image URL | Extracts vehicle number |
| 6 | System | Stores complaint with extracted number | Complaint created in DB |
| 7 | Admin | Views new complaint in dashboard | Shows image, GPS, AI result |
| 8 | Admin | Verifies/corrects vehicle number | Status = "VERIFIED" |
| 9 | Admin | Issues fine with amount & remarks | Status = "FINED", Fine created |
| 10 | Citizen | Views fine in dashboard | Shows amount, pay button |
| 11 | Citizen | Clicks "Pay" (mock payment) | Status = "PAID" |
| 12 | System | Updates fine and complaint status | Status = "CLOSED" |

## 8.3 Status Transitions Table

| From Status | To Status | Actor | Trigger |
|------------|-----------|-------|---------|
| - | SUBMITTED | System | Complaint created |
| SUBMITTED | VERIFIED | Admin | Vehicle number verified |
| SUBMITTED | REJECTED | Admin | Invalid complaint |
| SUBMITTED | DELETED | Admin | Fake/duplicate complaint |
| VERIFIED | FINED | Admin | Fine issued |
| FINED | CLOSED | System | Payment completed |

---

# 9. SECURITY & VIVA JUSTIFICATION

## 9.1 Authentication & Authorization

| Security Measure | Implementation | Justification |
|-----------------|----------------|---------------|
| Password Hashing | bcrypt (12 rounds) | Industry standard, computationally expensive for attackers |
| JWT Tokens | Access + Refresh tokens | Stateless auth, short-lived access (15 min) |
| Role Middleware | Express middleware | Prevents unauthorized access to role-specific routes |
| OTP Verification | Real email OTP for admins | Prevents unauthorized admin creation |

## 9.2 Data Protection

| Measure | Implementation | Purpose |
|---------|----------------|---------|
| Input Validation | Joi/Express-validator | Prevent injection attacks |
| Rate Limiting | express-rate-limit | Prevent brute force attacks |
| CORS | Whitelist origins | Prevent cross-origin attacks |
| Helmet.js | Security headers | XSS, clickjacking protection |
| MongoDB Sanitization | mongo-sanitize | Prevent NoSQL injection |

## 9.3 Viva Questions & Answers

**Q1: Why use JWT instead of sessions?**
> A: JWT is stateless, scalable, and works well with microservices. No server-side session storage needed.

**Q2: How do you handle AI inaccuracies?**
> A: Admin verification step acts as human-in-the-loop. AI provides suggestion, admin confirms/corrects.

**Q3: Why Tesseract.js instead of a Python microservice?**
> A: Simpler architecture, single deployment, same language (JavaScript), no inter-service communication overhead. Good enough accuracy for demo.

**Q4: How is anonymous reporting secure?**
> A: No user ID stored, but complaint still tracked. Prevents misuse via rate limiting.

**Q5: What if Cloudinary goes down?**
> A: Cloudinary has 99.9% uptime SLA. We store public_id for later retrieval.

**Q6: How do you prevent fake complaints?**
> A: Admin review process + ability to mark as fake/delete. GPS validation helps verify location.

**Q7: Why MongoDB over SQL?**
> A: Flexible schema for evolving requirements, GeoJSON support for location queries, JSON-like documents match JavaScript.

**Q8: How is the payment mock implemented?**
> A: Simple status toggle (UNPAID → PAID) with timestamp. No actual transaction, but simulates the flow.

---

# 10. DEVELOPMENT PLAN (6-8 Weeks)

## Week 1-2: Foundation & Setup

| Day | Tasks |
|-----|-------|
| 1-2 | Project setup, Git init, folder structure |
| 3-4 | MongoDB Atlas setup, Cloudinary account |
| 5-6 | Backend skeleton: Express, middleware, config |
| 7-8 | User model, Auth routes (register/login) |
| 9-10 | JWT implementation, role middleware |
| 11-14 | Frontend Vite setup, routing, AuthContext |

**Deliverables**: ✅ Auth system working end-to-end

## Week 3-4: Core Features

| Day | Tasks |
|-----|-------|
| 15-16 | Complaint model, image upload to Cloudinary |
| 17-18 | Tesseract.js OCR service setup |
| 19-20 | Vehicle number extraction + regex matching |
| 21-22 | Complaint submission flow (frontend + backend) |
| 23-24 | GPS capture + Map integration |
| 25-28 | Citizen dashboard, complaint list/details |

**Deliverables**: ✅ Citizen can submit complaint with OCR extraction

## Week 5-6: Admin & Fine System

| Day | Tasks |
|-----|-------|
| 29-30 | Admin dashboard UI |
| 31-32 | Complaint verification flow |
| 33-34 | Fine model, issue fine functionality |
| 35-36 | Status management (state transitions) |
| 37-38 | Mock payment system |
| 39-42 | Super Admin: Create/manage admins |

**Deliverables**: ✅ Complete admin workflow, fines working

## Week 7: Testing & Polish

| Day | Tasks |
|-----|-------|
| 43-44 | Unit tests for critical APIs |
| 45-46 | Integration testing |
| 47-48 | UI/UX polish, responsive design |
| 49 | Error handling, edge cases |

**Deliverables**: ✅ Stable, tested application

## Week 8: Deployment & Documentation

| Day | Tasks |
|-----|-------|
| 50-51 | Deploy backend to Railway |
| 52-53 | Deploy AI service to Railway |
| 54 | Deploy frontend to Vercel |
| 55-56 | Final testing, bug fixes |
| 57-58 | Documentation, report writing |

**Deliverables**: ✅ Live deployment, documentation ready

---

# 11. FINAL-YEAR REPORT OUTLINE

## Chapter Structure

### Chapter 1: Introduction (8-10 pages)
1.1 Background and Motivation
1.2 Problem Statement
1.3 Objectives
1.4 Scope and Limitations
1.5 Significance of Study
1.6 Organization of Report

### Chapter 2: Literature Review (10-12 pages)
2.1 Existing Waste Management Systems
2.2 AI in Governance (Smart City Initiatives)
2.3 Vehicle Number Plate Recognition Technologies
2.4 MERN Stack Applications
2.5 Comparative Analysis
2.6 Research Gap Identification

### Chapter 3: System Analysis (8-10 pages)
3.1 Requirement Analysis
    - Functional Requirements
    - Non-Functional Requirements
3.2 Feasibility Study
    - Technical Feasibility
    - Operational Feasibility
    - Economic Feasibility
3.3 Use Case Diagrams
3.4 Data Flow Diagrams

### Chapter 4: System Design (15-18 pages)
4.1 System Architecture
4.2 Database Design
    - ER Diagram
    - Schema Design
4.3 API Design
4.4 UI/UX Design
    - Wireframes
    - Page Layouts
4.5 AI Module Design
4.6 Security Design

### Chapter 5: Implementation (15-18 pages)
5.1 Development Environment Setup
5.2 Backend Implementation
    - Authentication Module
    - Complaint Module
    - Fine Module
5.3 Frontend Implementation
    - Component Structure
    - State Management
5.4 AI Microservice Implementation
5.5 Integration and Deployment
5.6 Key Code Snippets

### Chapter 6: Testing (8-10 pages)
6.1 Testing Strategy
6.2 Unit Testing
6.3 Integration Testing
6.4 System Testing
6.5 User Acceptance Testing
6.6 Test Cases and Results

### Chapter 7: Results and Discussion (8-10 pages)
7.1 System Screenshots
7.2 Performance Analysis
7.3 AI Accuracy Analysis
7.4 User Feedback
7.5 Comparison with Objectives
7.6 Limitations Encountered

### Chapter 8: Conclusion and Future Work (5-6 pages)
8.1 Summary of Work Done
8.2 Achievements
8.3 Future Enhancements
    - Real Payment Gateway
    - Mobile App
    - Advanced AI (Deep Learning)
    - Multi-language Support
8.4 Lessons Learned

### References (IEEE Format)

### Appendices
- Appendix A: User Manual
- Appendix B: Installation Guide
- Appendix C: API Documentation
- Appendix D: Database Queries
- Appendix E: Source Code Snippets

---

## Quick Reference Card

| Aspect | Detail |
|--------|--------|
| **Project Title** | Swachhata 2.0 – AI-Enabled Citizen Complaint System |
| **Tech Stack** | React, Node.js, MongoDB, Python, FastAPI |
| **Roles** | Citizen, Admin, Super Admin |
| **Key AI** | EasyOCR + OpenCV for vehicle number extraction |
| **Deployment** | Vercel (FE), Railway (BE + AI) |
| **Payment** | Mock simulation only |
| **Duration** | 6-8 weeks |

---

*Document prepared for final-year academic project evaluation and viva.*
