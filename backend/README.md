# Ethio Tourism Backend API

## Setup

1. Install dependencies:
```bash
npm install
```

2. Create `.env` file (already created with your MongoDB connection)

3. Start the server:
```bash
npm run dev
```

## Create Super Admin

Run this in MongoDB Compass or Atlas:

```javascript
db.users.insertOne({
  fullName: "Super Admin",
  email: "superadmin@ethioturism.com",
  password: "$2a$10$YourHashedPasswordHere",
  phone: "+251900000000",
  role: "SUPER_ADMIN",
  status: "ACTIVE",
  createdAt: new Date(),
  updatedAt: new Date()
})
```

Or use this script after starting the server - create a file `createSuperAdmin.js`:

```javascript
const mongoose = require('mongoose');
const User = require('./models/User');
require('dotenv').config();

mongoose.connect(process.env.MONGODB_URI);

const createSuperAdmin = async () => {
  const superAdmin = await User.create({
    fullName: 'Super Admin',
    email: 'superadmin@ethioturism.com',
    password: 'SuperAdmin123!',
    phone: '+251900000000',
    role: 'SUPER_ADMIN'
  });
  console.log('Super Admin created:', superAdmin);
  process.exit();
};

createSuperAdmin();
```

## API Endpoints

Base URL: `http://localhost:5000/api/v1`

### Authentication
- POST `/auth/register` - Register user
- POST `/auth/login` - Login (all roles)
- POST `/auth/logout` - Logout
- GET `/auth/me` - Get current user
- POST `/auth/refresh-token` - Refresh token
- PATCH `/auth/change-password` - Change password
- POST `/auth/forgot-password` - Forgot password
- POST `/auth/reset-password` - Reset password

### Admin Management (Super Admin only)
- POST `/admins` - Create admin
- GET `/admins` - Get all admins
- GET `/admins/:adminId` - Get single admin
- PATCH `/admins/:adminId` - Update admin
- DELETE `/admins/:adminId` - Delete admin

### User Management (Super Admin only)
- GET `/users` - Get all users
- GET `/users/:userId` - Get single user
- DELETE `/users/:userId` - Delete user
- PATCH `/users/:userId/status` - Block/Unblock user

## Testing with Postman/Thunder Client

1. Register a user
2. Login as Super Admin
3. Use the token in Authorization header: `Bearer <token>`
