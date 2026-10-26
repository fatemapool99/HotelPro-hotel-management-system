# Submit HotelPro

## Prepare the hosted database and API

1. Create a MongoDB database reachable by your backend host. Keep credentials private.
2. Deploy the `backend` directory as a Node service. Use `npm ci` to install and `npm start` to run it.
3. Set `MONGODB_URI`, a random `JWT_SECRET` of at least 32 characters, `JWT_EXPIRES_IN=1d`, `NODE_ENV=production` and `CORS_ORIGINS` (the exact HTTPS frontend origin). Let the host provide `PORT`.
4. Run `npm run rooms:refresh` against that database to create/update the eight standard rooms. This preserves existing users and bookings. The ninth custom room is local data and is not created by this command.
5. Create an administrator privately if your submission needs the admin dashboard: set `ADMIN_NAME`, `ADMIN_EMAIL`, `ADMIN_PHONE` and `ADMIN_PASSWORD` (at least 12 characters), then run `npm run admin:create`. Remove these temporary variables afterwards. Public registration only creates guests.
6. Check `/api/health` returns HTTP 200. Startup fails if database configuration or the signing secret is missing.

Do not run `npm run seed` on a database you want to keep: the legacy seed script resets users, rooms and bookings. Prefer `rooms:refresh`.

## Deploy the frontend

1. Deploy the `frontend` directory as a static site.
2. Set `VITE_API_URL=https://YOUR-BACKEND-HOST/api` before building. It is public configuration, never a secret.
3. Install with `npm ci`, build with `npm run build`, and publish `dist`.
4. Use HTTPS for both services. If your platform handles `/api` through a reverse proxy, you can omit `VITE_API_URL`.

The Vite development proxy only runs during development. Do not publish the development server. Local MongoDB data does not travel with the source files.

## Verification

- In `backend`, run `npm test`. For the real database workflow check, set `RUN_DB_TESTS=true` and run `node --test tests/submission.test.js`. It uses a uniquely named test database and removes its fixtures.
- In `frontend`, run `npm run build`.
- On the hosted URL, register a test guest, sign in, book, cancel, and check My Bookings. Check admin access separately and verify guests cannot open admin operations.
- On mobile and desktop, check the room filters, dates, guest count, totals, footer dialogs, images and error messages.
- Test simultaneous bookings for the same dates: one succeeds, competing requests receive HTTP 409.
- Keep submission credentials private. Demo login shortcuts have been removed. The previous accounts and bookings were cleared. A new local administrator account has since been created and verified; its credentials are kept out of the source files.

## Demonstration scope

This is a project demonstration, with sample property contacts and externally hosted photos. It collects no card payments and has no newsletter subscription service. The 12% tax/service estimate is demonstration pricing rather than a tax engine.

Reservation ranges are claimed atomically on the room document. A crash between claiming a range and saving a booking can leave a conservative hold; reconcile orphaned claims before treating this as a real booking service. Cancelled bookings cannot be reopened: create a new booking so availability is checked again.

Public production use also needs operational backups, monitoring, abuse protection, real property and policy details, and an appropriate payment/tax integration if online payments are required.
