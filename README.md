# Seetu Manager 🎯

A simple web application for managing monthly seetu (chit fund) for a private WhatsApp group. Built with Next.js 14 and MongoDB.

![Next.js](https://img.shields.io/badge/Next.js-14-black)
![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-green)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-3-cyan)

---

## 📋 Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Environment Variables](#environment-variables)
- [Database Setup](#database-setup)
- [Running Locally](#running-locally)
- [Project Structure](#project-structure)
- [Usage Guide](#usage-guide)

---

## ✨ Features

### User Management
- ✅ Simple username + password authentication (no email required)
- ✅ First user automatically becomes admin
- ✅ Admin can reset user passwords
- ✅ Admin role transfer capability

### Seetu Management
- ✅ Create monthly seetus with opening and closing dates
- ✅ Optional min/max amount limits
- ✅ Edit seetu details before opening date
- ✅ Countdown timers for opening and closing
- ✅ Double confirmation before deletion

### Placement System
- ✅ **Blind bidding** - amounts hidden until closing date
- ✅ One placement per user per seetu
- ✅ Edit or delete placement before closing
- ✅ Participation tracking (who placed, who hasn't)
- ✅ Automatic ranking after closing (highest to lowest)
- ✅ Tie-breaking by timestamp (earlier wins)

### UI/UX
- ✅ Large buttons and text for 50+ age group
- ✅ High contrast, mobile-first design
- ✅ Simple navigation (max 2-3 clicks)
- ✅ Clear confirmation dialogs
- ✅ Password visibility toggle

---

## 🛠️ Tech Stack

### Frontend & Backend
- **Next.js 14** - React framework with App Router
- **TypeScript** - Type safety
- **Tailwind CSS** - Styling
- **Lucide React** - Icons

### Database
- **MongoDB Atlas** - NoSQL database (free tier)
- **Mongoose** - ODM for MongoDB

### Authentication
- **bcryptjs** - Password hashing

### Hosting
- **Vercel** - Frontend and backend hosting (free tier)

---

## 📦 Prerequisites

Before you begin, ensure you have:

- **Node.js 18.17+** - [Download here](https://nodejs.org/)
- **npm 9+** (comes with Node.js)
- **Git** - [Download here](https://git-scm.com/)
- **MongoDB Atlas Account** - [Sign up here](https://www.mongodb.com/cloud/atlas/register)
- **Vercel Account** (for deployment) - [Sign up here](https://vercel.com/signup)

---

## 🚀 Installation

### 1. Clone or Create Project

```bash
# Create new Next.js app
npx create-next-app@latest seetu-app

# When prompted, answer:
✔ Would you like to use TypeScript? … Yes
✔ Would you like to use ESLint? … Yes
✔ Would you like to use Tailwind CSS? … Yes
✔ Would you like to use `src/` directory? … No
✔ Would you like to use App Router? … Yes
✔ Would you like to customize the default import alias (@/*)? … No
```

### 2. Navigate to Project

```bash
cd seetu-app
```

### 3. Install Dependencies

```bash
# MongoDB and Mongoose
npm install mongoose

# Authentication
npm install next-auth@beta bcryptjs
npm install -D @types/bcryptjs

# Icons
npm install lucide-react

---

## 🔐 Environment Variables

### 1. Create `.env.local` File

Create a file named `.env.local` in the project root:

```bash
# .env.local

# MongoDB Atlas Connection String
# Get this from MongoDB Atlas dashboard
MONGODB_URI="mongodb+srv://username:password@cluster.mongodb.net/seetudb?retryWrites=true&w=majority"

# NextAuth Configuration
# Generate secret with: openssl rand -base64 32
NEXTAUTH_SECRET="your-super-secret-key-generate-with-openssl"
NEXTAUTH_URL="http://localhost:3000"

# Node Environment
NODE_ENV="development"
```

### 2. Verify `.gitignore`

Ensure `.env.local` is in `.gitignore` (Next.js adds this automatically):

```bash
# .gitignore should contain:
.env*.local
```

**⚠️ NEVER commit `.env.local` to Git!**

---

## 🗄️ Database Setup

#### Step 1: Create Account
1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas/register)
2. Sign up for free account
3. Verify email

#### Step 2: Create Cluster
1. Click **"Build a Database"**
2. Choose **"M0 Free"** tier
3. Select region closest to you (or default)
4. Cluster name: `seetu-cluster`
5. Click **"Create"**

#### Step 3: Create Database User
1. Choose **"Username and Password"** authentication
2. Username: `seetuadmin`
3. Password: Generate secure password (save it!)
4. Click **"Create User"**

#### Step 4: Add IP Address
1. Choose **"Add My Current IP Address"**
2. For development, you can also add `0.0.0.0/0` (allow all)
   - ⚠️ For production, use specific IPs only
3. Click **"Finish and Close"**

#### Step 5: Get Connection String
1. Click **"Connect"**
2. Choose **"Drivers"**
3. Copy the connection string
4. Replace `<password>` with your actual password
5. Replace `myFirstDatabase` with `seetudb`

Example:
```
mongodb+srv://seetuadmin:YOUR_PASSWORD@seetu-cluster.xxxxx.mongodb.net/seetudb?retryWrites=true&w=majority
```

6. Paste this into `.env.local` as `MONGODB_URI`

#### Step 6: Create Database
Your database will be created automatically when the app first connects and creates collections.

---

## 🏃 Running Locally

### 1. Start Development Server

```bash
npm run dev
```

You should see:
```
✓ Ready in 2.3s
○ Local:   http://localhost:3000
```

### 2. Open in Browser

Navigate to [http://localhost:3000](http://localhost:3000)

### 3. First Time Setup

1. **Register first user** - This user becomes admin automatically
2. **Create your first seetu**
3. **Share link with WhatsApp group**

### 4. Stop Server

Press `Ctrl + C` in terminal

---

## 📁 Project Structure

```
seetu-app/
├── app/                          # Next.js App Router
│   ├── api/
│   │   └── auth/
│   │       └── [...nextauth]/
│   │           └── route.ts      # NextAuth configuration
│   ├── dashboard/
│   │   └── page.tsx              # Main dashboard
│   ├── login/
│   │   └── page.tsx              # Login page
│   ├── register/
│   │   └── page.tsx              # Registration page
│   ├── layout.tsx                # Root layout
│   └── page.tsx                  # Landing page
│
├── components/                   # React components
│   ├── SeetuCard.tsx            # Seetu display card
│   ├── PlacementForm.tsx        # Amount placement form
│   └── CountdownTimer.tsx       # Countdown display
│
├── lib/                          # Utility functions
│   ├── mongodb.ts               # MongoDB connection
│   └── models/                  # Mongoose models
│       ├── User.ts              # User model
│       ├── Seetu.ts             # Seetu model
│       └── Placement.ts         # Placement model
│
├── middleware.ts                 # Auth middleware
├── .env.local                    # Environment variables (NOT committed)
├── .gitignore                    # Git ignore rules
├── next.config.js                # Next.js config
├── package.json                  # Dependencies
├── tailwind.config.js            # Tailwind config
├── tsconfig.json                 # TypeScript config
└── README.md                     # This file
```

---

## 📖 Usage Guide

### For Admin

#### Creating a Seetu
1. Login to your account
2. Click **"Create New Seetu"** button
3. Fill in:
   - Title (e.g., "February 2025 Seetu")
   - Opening Date (when users can start placing)
   - Closing Date (final date for placements)
   - (Optional) Toggle "Set amount limits"
     - Min Amount: e.g., 5000 LKR
     - Max Amount: e.g., 50000 LKR
4. Click **"Create Seetu"**

#### Managing Seetus
- **Edit:** Click edit icon (only before opening date)
- **Delete:** Click delete icon → Double confirmation required
- **View Participation:** See who has placed (amounts hidden until close)

#### Managing Users
- Go to **User Management** (admin only)
- **Reset Password:** Click reset next to any user
- **Transfer Admin:** Click "Transfer Admin" button

---

### For Regular Users

#### Registering
1. Click **"Register"** on login page
2. Enter username (e.g., "Sunil")
3. Enter password
4. Click **"Register"**

#### Placing Amount
1. Login to dashboard
2. Find the **open seetu** (green status)
3. Enter your amount in LKR
4. Click **"Place"** button
5. You'll see confirmation

#### Editing Placement
1. Find your active placement
2. Enter new amount
3. Click **"Update"**
4. Can edit unlimited times before closing

#### Viewing Results
1. After closing date, results appear automatically
2. See ranking from highest to lowest
3. 🥇 Gold medal for winner
4. Your placement is highlighted

---

## 📊 Database Schema (Mongoose Models)

### User Model
```javascript
{
  username: String (unique, required),
  passwordHash: String (required),
  isAdmin: Boolean (default: false),
  createdAt: Date (default: now),
  updatedAt: Date (default: now)
}
```

### Seetu Model
```javascript
{
  title: String (required),
  openingDate: Date (required),
  closingDate: Date (required),
  minAmount: Number (optional),
  maxAmount: Number (optional),
  createdBy: ObjectId (ref: User),
  createdAt: Date (default: now),
  updatedAt: Date (default: now)
}
```

### Placement Model
```javascript
{
  seetuId: ObjectId (ref: Seetu, required),
  userId: ObjectId (ref: User, required),
  amount: Number (required, > 0),
  createdAt: Date (default: now),
  updatedAt: Date (default: now),
  
  // Unique compound index
  index: { seetuId: 1, userId: 1 } (unique)
}
```
---

## 📝 License

This project is private and intended for personal/group use only.

---

## 📚 Learning Resources

### Next.js Concepts Used
- **App Router** - File-based routing
- **Server Components** - Default in App Router
- **Server Actions** - Backend logic without API routes
- **Middleware** - Authentication checks
- **Route Handlers** - API endpoints

### Helpful Links
- [Next.js 14 Docs](https://nextjs.org/docs)
- [MongoDB Mongoose Guide](https://mongoosejs.com/docs/guide.html)
- [NextAuth.js Docs](https://next-auth.js.org/)
- [Tailwind CSS Docs](https://tailwindcss.com/docs)

---

## 🗺️ Roadmap

### Phase 1 - MVP ✅
- [x] User authentication
- [x] Seetu creation
- [x] Blind placement system
- [x] Results display
- [x] Admin features

### Phase 2 - Enhancements
- [ ] In-app notifications
- [ ] Past seetu archive
- [ ] Export results to PDF
- [ ] WhatsApp share button
- [ ] User statistics

### Phase 3 - Advanced
- [ ] Dark mode
- [ ] Multi-language support (Sinhala, Tamil)
- [ ] Activity audit log
- [ ] Email notifications (optional)

---

### Important URLs
- **Local:** http://localhost:3000
- **Production:** https://your-app.vercel.app
- **MongoDB Atlas:** https://cloud.mongodb.com
- **Vercel Dashboard:** https://vercel.com/dashboard

---
Last Updated: January 2026