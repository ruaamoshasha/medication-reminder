# Medication Reminder App

A comprehensive medication reminder application that allows users to schedule and track their medicine intake, featuring customizable scheduling, real-time notifications, visual tracking through weekly charts, and a monthly calendar overview for better long-term medication management.

## Features

- **Medication Scheduling**: Add medications with custom schedules, dosages, and reminder times
- **Adherence Tracking**: Track how well you're following your medication regimen with visual statistics
- **Calendar View**: See all your scheduled medications in a monthly calendar format
- **Status Management**: Mark medications as taken or missed
- **Future Planning**: Automatically generates reminders for the next 30 days

## Tech Stack

- **Frontend**: React, TanStack Query, Tailwind CSS, shadcn/ui components
- **Backend**: Express.js, In-memory data storage
- **Libraries**: date-fns for date handling, recharts for data visualization

## Running Locally

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the development server:
   ```bash
   npm run dev
   ```
4. Open your browser and navigate to `http://localhost:5000`

## Deploying to Render

### Option 1: One-Click Deploy

1. Make sure you have a [Render account](https://render.com/)
2. Click the "Deploy to Render" button below:

[![Deploy to Render](https://render.com/images/deploy-to-render-button.svg)](https://render.com/deploy)

### Option 2: Manual Deployment

1. Fork this repository to your GitHub account
2. Log in to your [Render account](https://render.com/)
3. Click "New" and select "Web Service"
4. Connect your GitHub account and select the forked repository
5. Use the following settings:
   - **Name**: medication-reminder (or your preferred name)
   - **Environment**: Node
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm start`
6. Add the following environment variable:
   - **Key**: NODE_ENV, **Value**: production
7. Select a plan (the free plan works great for personal use)
8. Click "Create Web Service"

Render will automatically build and deploy your application. Once deployed, you'll get a URL like `https://medication-reminder.onrender.com` that you can share with others.

## Usage

1. **Add Medication**: Click the "Add Medication" button on the home page and fill out the form
2. **View Calendar**: Click the "Calendar" link in the navigation to see your monthly schedule
3. **Mark as Taken/Missed**: On the home page, click the appropriate action button for today's medications
4. **Track Adherence**: View your weekly adherence chart on the home page

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.