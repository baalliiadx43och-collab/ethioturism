# Ethio Tourism Frontend

Next.js frontend with Redux Toolkit and RTK Query for API management.

## Setup

1. Install dependencies:
```bash
npm install
```

2. Environment variables are already configured in `.env.local`

3. Start the development server:
```bash
npm run dev
```

4. Open [http://localhost:3000](http://localhost:3000)

## Features

- Sign up page with form validation
- Login page
- Redux Toolkit for state management
- RTK Query for API calls
- Tailwind CSS for styling
- TypeScript support

## Pages

- `/` - Home page
- `/signup` - User registration
- `/login` - User login
- `/dashboard` - User dashboard (protected)

## API Integration

The app uses RTK Query with API slices for:
- User registration
- User login
- User logout
- Get current user

Base URL is configured in `.env.local` file.
