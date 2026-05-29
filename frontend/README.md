# SAPS Frontend

This folder is for the UI/UX design and frontend work for the Student Academic Prediction System.

## Structure

- `design/` - user flows, wireframes, visual notes, and design decisions.
- `assets/` - images, icons, logos, and other static visual assets.
- `pages/` - page-level mockups or frontend screens.
- `components/` - reusable UI components.
- `styles/` - shared CSS, design tokens, colors, spacing, and typography.

## Run Locally

From this folder:

```bash
npm run dev
```

Then open `http://127.0.0.1:4200`.

Student login currently redirects to the React student dashboard. The demo data is in `src/data/students.js`; add another email key there to show different data for a different student.

## Suggested Screens

- Login
- Register
- Student dashboard
- Student progress
- Student prediction history
- Teacher dashboard
- Marks upload
- Attendance upload
- Prediction result
