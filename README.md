# Golf Community App ⛳

A comprehensive platform designed to connect golf enthusiasts, enhance their playing experience, and build a vibrant digital community around the sport. The fully responsive web application serves as a central hub for course discovery, performance tracking, social connections, and golf news consumption.

## Features

- **User Authentication**: Secure login and registration system with JWT and Supabase
- **Course Explorer**: Browse and filter golf courses with advanced search, sorting, and filtering options
- **Course Check-In**: Check in at golf courses, share photos, and tag friends to track your golfing journey
- **Course Reviews & Ratings**: Read and write detailed reviews with ratings and filter by review criteria
- **User Profiles**: Personalized profiles with statistics and history
- **Scorecard Tracking**: Log and analyze your golf scores with detailed statistics
- **Performance Analytics**: Track your improvement over time with visual data representation
- **Social Feed**: Connect with other golfers, share posts, and engage with content
- **News Section**: Stay updated with golf news, tournaments, and tips

## Recent Updates

- **Scorecard Entry**: Added a component for logging round details including score, course played, and date.
- **Scorecard History**: Implemented tracking of past scorecards with filtering capabilities.
- **Enhanced Course Explorer**: Improved with advanced filtering and sorting options.
- **Course Check-In**: New feature allowing users to check-in at courses with photo uploads and friend tagging.
- **Course Rating System**: Added comprehensive course rating and review functionality with filtering options.
- **Improved UI**: Enhanced with animations and responsive design across all components.

## Tech Stack

- **Frontend**: React, TypeScript, Tailwind CSS
- **State Management**: React Context API
- **Form Handling**: React Hook Form, Zod
- **UI Components**: Shadcn UI
- **Animations**: Framer Motion
- **Database**: Supabase PostgreSQL
- **API**: Supabase REST API and Edge Functions

## Getting Started

### Prerequisites

- Node.js (v14.0.0 or later)
- npm or yarn

### Installation

1. Clone the repository:
   ```
   git clone https://github.com/your-username/golf-community-app.git
   cd golf-community-app
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Start the development server:
   ```
   npm run dev
   ```

4. Open your browser and navigate to:
   ```
   http://localhost:8081
   ```

## Test Credentials

You can use the following test credentials to log in:

- **Email**: john.smith@example.com
- **Password**: password123

Other test accounts:
- Email: emma.johnson@example.com, Password: password123
- Email: michael.williams@example.com, Password: password123
- Email: sophia.brown@example.com, Password: password123
- Email: david.jones@example.com, Password: password123

## Project Structure

```
golf-community-app/
├── src/
│   ├── components/        # Reusable UI components
│   ├── context/           # React Context providers
│   ├── features/          # Feature-based modules
│   │   ├── auth/          # Authentication components
│   │   ├── courses/       # Course explorer components
│   │   ├── dashboard/     # Dashboard components
│   │   ├── news/          # News components
│   │   ├── profile/       # User profile components
│   │   └── social/        # Social feed components
│   ├── layouts/           # Layout components
│   ├── lib/               # Utility functions and helpers
│   ├── pages/             # Page components
│   ├── services/          # API services
│   └── config/            # Configuration files
└── public/                # Static assets
```

## Database Schema

The application uses a PostgreSQL database with the following tables:

- **users**: User profiles and authentication
- **courses**: Golf course information
- **course_reviews**: User reviews for courses
- **course_checkins**: User check-ins at courses
- **scores**: User game scores
- **friends**: User friend connections
- **posts**: Social media posts
- **comments**: Comments on posts
- **likes**: Post and comment likes
- **news_articles**: Golf news articles
- **tournaments**: Golf tournament information
- **golf_tips**: Golf tips and tutorials

## Future Enhancements

- Mobile app version using React Native
- Real-time notifications
- Advanced statistics and analytics
- Tournament creation and management
- Equipment tracking and recommendations
- Weather integration

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License - see the LICENSE file for details.
