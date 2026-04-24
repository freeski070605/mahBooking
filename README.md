# MAH Booking

MAH Booking is a full-stack booking platform for a solo beauty professional. It combines a premium client-facing experience with a calm, novice-friendly admin dashboard for services, gallery management, appointments, and availability.

## Stack

- React + Vite
- Tailwind CSS
- shadcn-style UI primitives
- framer-motion
- Node.js + Express
- MongoDB + Mongoose
- JWT auth with httpOnly cookie support
- Cloudinary image uploads

## Features

- Public pages: home, services, gallery, booking, policies, contact, client account
- Admin pages: dashboard, appointments, services, gallery, availability, clients, settings
- Service CRUD with image upload and replacement
- Gallery CRUD with featured image support
- Booking slot generation that respects weekly hours, breaks, blocked dates, date overrides, service duration plus buffer, and existing appointments
- Clean bootstrap script for an initial admin account plus base settings and availability

## Project Structure

```text
.
|-- client/               # Vite React app
|   |-- src/
|   |   |-- components/
|   |   |-- context/
|   |   |-- data/
|   |   |-- lib/
|   |   |-- pages/
|   |   `-- providers/
|   `-- .env.example
|-- server/               # Express API
|   |-- src/
|   |   |-- config/
|   |   |-- controllers/
|   |   |-- lib/
|   |   |-- middleware/
|   |   |-- models/
|   |   |-- routes/
|   |   |-- scripts/seed.js
|   |   `-- utils/
|   `-- .env.example
`-- package.json          # root scripts
```

## Setup

1. Install dependencies

```bash
npm install
npm install --prefix client
npm install --prefix server
```

2. Create environment files

```bash
copy client\\.env.example client\\.env
copy server\\.env.example server\\.env
```

3. Update `server/.env`

- `MONGODB_URI`
- `JWT_SECRET`
- `FRONTEND_URL`
- `CLOUDINARY_CLOUD_NAME`
- `CLOUDINARY_API_KEY`
- `CLOUDINARY_API_SECRET`
- `CLOUDINARY_ROOT_FOLDER`
- `CLOUDINARY_SERVICE_FOLDER`
- `CLOUDINARY_GALLERY_FOLDER`
- `CLOUDINARY_BRANDING_FOLDER`
- `SEED_ADMIN_EMAIL`
- `SEED_ADMIN_PASSWORD`

4. Bootstrap a clean starting state

```bash
npm run seed
```

This clears existing collections and creates:

- one admin account
- default availability
- business settings

5. Start the app

```bash
npm run dev
```

- Frontend: `http://localhost:5173`
- Backend: `http://localhost:4000`

## Initial Admin Login

Use the admin email and password configured in `server/.env` via:

- `SEED_ADMIN_EMAIL`
- `SEED_ADMIN_PASSWORD`

## Useful Scripts

- `npm run dev`
- `npm run dev:client`
- `npm run dev:server`
- `npm run build`
- `npm run seed`

## Deployment

### Vercel

- Root directory: `client`
- Build command: `npm run build`
- Output directory: `dist`
- Set `VITE_API_BASE_URL` to your Render API URL plus `/api`

### Render

- Root directory: `server`
- Build command: `npm install`
- Start command: `npm run start`
- Add all values from `server/.env.example`
- Set `FRONTEND_URL` to your deployed Vercel origin, for example `https://mahbooking.vercel.app`
- Do not include a trailing slash in `FRONTEND_URL`
- If you need to allow more than one frontend origin, separate them with commas
- After changing `FRONTEND_URL`, redeploy the Render service

If Render is currently using `npm install && npm run build`, that will also work now, but the simplest backend build command is still just `npm install` because the Express API does not need a compile step.

## Verification

- Frontend build verified with `npm run build` in `client`
- Backend syntax checked across `server/src` with `node --check`

Running the API locally still requires a live MongoDB instance, and image uploads require Cloudinary credentials.
