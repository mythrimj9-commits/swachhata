# Swachhata 2.0 - Frontend

React frontend for the AI-Enabled Citizen Complaint System.

## Tech Stack

- **Framework**: React 18 + Vite
- **Routing**: React Router v6
- **HTTP Client**: Axios
- **Maps**: Leaflet + React-Leaflet
- **Notifications**: React Hot Toast
- **Icons**: React Icons

## Quick Start

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment

```bash
cp .env.example .env
```

Update `VITE_API_URL` to point to your backend.

### 3. Start Development Server

```bash
npm run dev
```

App runs at `http://localhost:5173`

## Folder Structure

```
src/
├── components/     # Reusable components
│   ├── common/     # Navbar, Footer, etc.
│   ├── dashboard/  # Dashboard widgets
│   ├── layouts/    # Page layouts
│   └── maps/       # Map components
├── context/        # React Context
├── hooks/          # Custom hooks
├── pages/          # Page components
│   ├── public/     # Home, Login, Register
│   ├── citizen/    # Citizen dashboard
│   ├── admin/      # Admin dashboard
│   └── superadmin/ # Super admin
├── services/       # API services
├── styles/         # CSS
└── utils/          # Helpers
```

## Pages

| Route | Description |
|-------|-------------|
| `/` | Homepage |
| `/login` | Login |
| `/register` | Register |
| `/anonymous-complaint` | Submit anonymous complaint |
| `/citizen/*` | Citizen dashboard |
| `/admin/*` | Admin dashboard |
| `/superadmin/*` | Super admin |

## License

ISC
