# Costume Voting App

A simple Next.js app for costume voting with MongoDB and Cloudinary integration.

## Features

- **Admin Page** (`/admin`): Upload one costume image to Cloudinary
- **Vote Page** (`/vote`): Tinder-like voting interface with like/dislike buttons
- **Winners Page** (`/winners`): Display top 2 costumes based on likes

## Setup

1. **Install dependencies:**

   ```bash
   npm install
   ```

2. **Set up environment variables:**
   Create a `.env.local` file in the root directory with:

   ```
   MONGODB_URI=mongodb://localhost:27017/costume-voting
   CLOUDINARY_CLOUD_NAME=your_cloud_name
   CLOUDINARY_API_KEY=your_api_key
   CLOUDINARY_API_SECRET=your_api_secret
   ```

3. **Set up MongoDB:**

   - Install MongoDB locally or use MongoDB Atlas
   - Update the `MONGODB_URI` in your `.env.local` file

4. **Set up Cloudinary:**

   - Create a Cloudinary account
   - Get your cloud name, API key, and API secret
   - Update the Cloudinary variables in your `.env.local` file

5. **Run the development server:**

   ```bash
   npm run dev
   ```

6. **Open your browser:**
   Navigate to `http://localhost:3000`

## Usage

1. Go to `/admin` to upload a costume image
2. Go to `/vote` to vote on costumes (like/dislike)
3. Go to `/winners` to see the top 2 costumes

## Tech Stack

- Next.js 15
- MongoDB
- Cloudinary
- Tailwind CSS
- TypeScript
