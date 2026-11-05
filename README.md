<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://ai.google.dev/static/site-assets/images/share-ais-513315318.png" />
</div>

# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/b4e1dfbe-68cc-4788-bd6d-5b0f22d32eed

## Run Locally

**Prerequisites:**  Node.js


1. Install dependencies:
   `npm install`
2. Run the app:
   `npm run dev`

## Admin Panel

Administrator access is handled by the separate `aido-admin-panel` app. Set
`VITE_ADMIN_PANEL_URL` in the environment to its URL; the local development
default is `http://localhost:9000`.

## PostgreSQL API

The app and admin panel use the Express API in `server/` for password
registration/login, JWT sessions, reviews, and admin user management.

1. Create a PostgreSQL database named `aido`.
2. Copy `server/.env.example` to `server/.env` and set `DATABASE_URL`,
   `JWT_SECRET` (at least 32 random characters), `ADMIN_EMAIL`, and
   `ADMIN_PASSWORD`. The API hashes account passwords with bcrypt before
   storing them. The administrator account is also created with a bcrypt hash.
3. Start the API:
   `cd server`
   `npm install`
   `npm run dev`
4. Start Hackthon_GDG and aido-admin-panel in separate terminals as described
   above. Configure the admin panel's `VITE_UNIFIED_API_ENDPOINT` as
   `http://localhost:5000/api/v1/users`.

User JWTs are kept in browser `sessionStorage` and expire after 12 hours.
Review ratings and comments are stored in PostgreSQL and included in the admin
panel's unified-user data. The current mobile/password flow does not verify
ownership of the phone number; configure an OTP provider before using it for
production accounts or sensitive workflows.
