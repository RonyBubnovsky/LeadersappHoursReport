# Leadersapp Hours Report System

A web application for tracking work hours and generating Excel reports.

## Live Deployment

The project is live and deployed on Vercel:

http://leadersapp-hours-report.vercel.app/

## Overview

This project was developed to meet my personal need for tracking work hours and managing my weekly schedule as an instructor and teacher at LeadersApp, and is also designed to help other instructors manage their hours and schedules. The application allows users to track their work hours with detailed entries including date, duration, and descriptions. The system stores all data in Supabase and provides the ability to export comprehensive reports to Excel format.

## Features

- Track work hours with date, duration, and descriptions
- Export detailed Excel reports
- Real-time data synchronization
- User authentication and secure data storage
- Responsive design for desktop and mobile

## Tech Stack

- **Next.js 16** - React framework
- **React 19** - UI library
- **TypeScript** - Type-safe development
- **Supabase** - Backend and database
- **Tailwind CSS** - Styling
- **ExcelJS** - Excel report generation

## Getting Started

### Prerequisites

- Node.js 20+
- Supabase account

### Installation

1. Clone the repository:

```bash
git clone https://github.com/RonyBubnovsky/LeadersappHoursReport.git
cd LeadersappHoursReport
```

2. Install dependencies:

```bash
npm install
```

3. Set up environment variables:

```bash
cp env.example .env.local
```

Edit `.env.local` and add your Supabase credentials:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sb_publishable_your_key_here
```

### Admin Panel Setup (Optional)

For admin functionality (user management), add these server-side variables:

```env
SUPABASE_SECRET_KEY=sb_secret_your_secret_key_here
ADMIN_USER_ID=your_admin_user_id
```

- `SUPABASE_SECRET_KEY` - Get from Supabase Dashboard → Settings → API → Secret keys
- `ADMIN_USER_ID` - The user ID from `auth.users` table who should have admin access

4. Run the development server:

```bash
npm run dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run code linting

## Author

Rony Bubnovsky - [@RonyBubnovsky](https://github.com/RonyBubnovsky)
