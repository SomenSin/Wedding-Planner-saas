# VowVantage - AI-Powered Wedding Planner SaaS

VowVantage is a modern, premium wedding planning platform designed to simplify the logistics of your big day. Built with **React**, **Vite**, **Tailwind CSS**, and **Supabase**.

## 🌟 Features

- **Guest CRM**: Manage guests, track RSVPs, and generate access codes.
- **Financial Hub**: Keep track of your budget and expenses.
- **Itinerary Planner**: Organize the wedding day timeline.
- **Vendor Management**: Store contact info and contracts.
- **Drink Calculator**: Estimate beverage needs based on guest count.
- **Registry & Gifts**: Manage gift lists and contributions.
- **AI-Powered Insights**: (Optional) Use Gemini for planning assistance.
- **Support & Feedback**: Built-in module for bug reports and feature requests.

## 🚀 Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (v18+)
- [Supabase](https://supabase.com/) Account

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/Wedding-Planner-saas.git
   cd Wedding-Planner-saas
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Setup environment variables:
   - Copy `.env.example` to `.env`
   - Fill in your `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`

4. Initialize the Database:
   - Go to your Supabase project's SQL Editor.
   - Run the contents of `supabase/migrations/setup_all_tables.sql`.
   - Optionally run other patches in `supabase/migrations/` as needed.

5. Run the development server:
   ```bash
   npm run dev
   ```

## 🛠️ Tech Stack

- **Frontend**: React, Vite
- **Styling**: Tailwind CSS, Shadcn UI
- **Backend/Database**: Supabase (PostgreSQL)
- **State Management**: Zustand
- **Animations**: Motion (Framer Motion)
- **Icons**: Lucide React

## 🔒 Security

- **Environment Variables**: Sensitive keys are kept in `.env` (ignored by Git).
- **Supabase RLS**: Row Level Security is implemented to ensure couples only see their own data.
- **Access Codes**: Unique 6-digit codes for guest access.

## 📂 Project Structure

- `src/features`: Logical feature modules (Guest, Dashboard, Admin).
- `src/components`: UI components and common modals.
- `src/lib`: Library initializations (Supabase, utils).
- `src/hooks`: Custom React hooks.
- `src/types`: TypeScript interfaces.
- `supabase/migrations`: SQL scripts for database schema.

## 📄 License

This project is licensed under the MIT License.
