# Wine, Cocktail, and Spirit Review Platform

A modern, social platform for wine, cocktail, and spirit enthusiasts to discover, review, and share their beverage experiences. Built with React, Fastify, Prisma, and PostgreSQL.

## 🍷 Features

### ✅ Phase 1: Authentication System (Complete)
- **Backend**: JWT authentication with bcrypt password hashing
- **Frontend**: Login/register pages with AuthContext
- **Features**: User registration, login, logout, profile management
- **Test Credentials**: `test2@example.com` / `password123`

### ✅ Phase 2: Beverage & Review System (Complete)
- **Backend**: Complete beverage and review API with full CRUD operations
- **Frontend**: Beverage listing, detail pages, review creation and display
- **Features**:
  - Search and filter beverages (wines, cocktails, spirits)
  - Create reviews with ratings (1-5 stars)
  - View reviews with proper star display
  - Responsive design with Tailwind CSS
- **API Endpoints:**
  - `GET /beverages` - List beverages (with filters, pagination)
  - `GET /beverages/:id` - Get beverage details
  - `GET /beverages/categories` - List beverage categories
  - `GET /beverages/search` - Search beverages
  - `POST /beverages` - Suggest or create beverage (auth required)
  - `PUT /beverages/:id` - Update beverage (admin only)
  - `DELETE /beverages/:id` - Delete beverage (admin only)
  - `GET /reviews` - List reviews (with filters, pagination)
  - `GET /reviews/:id` - Get review details
  - `POST /reviews` - Create review (auth required)
  - `PUT /reviews/:id` - Update review (auth required)
  - `DELETE /reviews/:id` - Delete review (auth required)
  - `GET /users/:userId/reviews` - List reviews by user
  - `POST /reviews/:id/like` - Like/unlike a review (auth required)

### ✅ Phase 3: Social Features (Complete)
- **Backend**: Complete social API with follow, like, and comment functionality
- **Frontend**: Interactive social components with real-time updates
- **Features**:
  - Follow/unfollow users with FollowButton component
  - Like/unlike reviews with LikeButton component
  - Comment on reviews with CommentForm and CommentList
  - User profiles with social statistics
  - Real-time UI updates for social actions
  - Notification system for social interactions
- **API Endpoints:**
  - `POST /social/follow/:userId` - Follow a user
  - `DELETE /social/follow/:userId` - Unfollow a user
  - `GET /social/follow/check/:userId` - Check follow status
  - `GET /social/followers/:userId` - Get user's followers
  - `GET /social/following/:userId` - Get user's following
  - `POST /social/like/:reviewId` - Like a review
  - `DELETE /social/like/:reviewId` - Unlike a review
  - `GET /social/like/check/:reviewId` - Check like status
  - `POST /social/comment/:reviewId` - Comment on a review
- **Components**:
  - `LikeButton` - Interactive like/unlike with heart icon
  - `FollowButton` - Follow/unfollow with loading states
  - `CommentForm` - Comment creation with validation
  - `CommentList` - Comment display with user avatars
  - `UserProfilePage` - Enhanced user profiles with social features

### 🔄 Phase 4: Advanced Features (In Progress)
- User profiles and following system
- Like/unlike reviews
- Comments on reviews
- Activity feed
- Notifications

### 📋 Phase 5: Advanced Features (Planned)
- Photo uploads for reviews
- Venue check-ins
- Advanced search and filtering
- Admin dashboard
- Mobile app

## 🛠 Tech Stack

### Frontend
- **React 18** with Vite
- **React Router** for navigation
- **Tailwind CSS** for styling
- **React Hot Toast** for notifications
- **React Query** for data fetching

### Backend
- **Fastify** for API server
- **Prisma ORM** for database operations
- **PostgreSQL** (Neon) for database
- **JWT** for authentication
- **bcryptjs** for password hashing

### Development Tools
- **TypeScript** for type safety
- **ESLint** for code linting
- **Prettier** for code formatting
- **Git** for version control

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ and npm
- PostgreSQL database (Neon account recommended)

### Development Setup

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd drinks-review-system
   ```

2. **Install dependencies**
   ```bash
   npm install
   cd apps/api && npm install
   cd ../web && npm install
   cd ../../packages/database && npm install
   ```

3. **Set up environment variables**
   - Copy `env.example` to `.env` in the root directory
   - Copy `.env` to `packages/database/.env`
   - Add your database URL and JWT secret

4. **Set up the database**
   ```bash
   cd packages/database
   npm run generate
   npx prisma db push
   npm run seed
   ```

5. **Start development servers**
   ```bash
   # Terminal 1 - API
   cd apps/api
   npm start

   # Terminal 2 - Web
   cd apps/web
   npm run dev
   ```

6. **Access the application**
   - Frontend: http://localhost:3000
   - API: http://localhost:3001/health
   - Status Page: http://localhost:3000/status

## Environment Variables

Create a `.env` file based on `env.example`:

```env
# Database
DATABASE_URL=postgresql://...

# API Configuration
PORT=3001
HOST=0.0.0.0
NODE_ENV=development

# JWT
JWT_SECRET=your-secret-key-here

# CORS
CORS_ORIGIN=http://localhost:3000

# OAuth (for future implementation)
GOOGLE_CLIENT_ID=...
GOOGLE_CLIENT_SECRET=...
GITHUB_CLIENT_ID=...
GITHUB_CLIENT_SECRET=...

# File Storage (for future implementation)
CLOUDFLARE_ACCOUNT_ID=...
CLOUDFLARE_API_TOKEN=...
# or AWS S3
AWS_ACCESS_KEY_ID=...
AWS_SECRET_ACCESS_KEY=...
AWS_REGION=...
AWS_S3_BUCKET=...
```

## Available Scripts

### Root Level
- `npm install` - Install all dependencies

### API (`apps/api/`)
- `npm run dev` - Start API server with hot reload
- `npm start` - Start API server in production mode
- `npm test` - Run tests
- `npm run lint` - Lint code

### Web (`apps/web/`)
- `npm run dev` - Start Vite dev server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Lint code

### Database (`packages/database/`)
- `npm run generate` - Generate Prisma client
- `npm run db:push` - Push schema to database
- `npm run migrate` - Run database migrations
- `npm run seed` - Seed database with sample data
- `npm run studio` - Open Prisma Studio

## Social Features Guide

### Following Users
- Click the "Follow" button on any user's profile
- The button will change to "Unfollow" when following
- Users can't follow themselves

### Liking Reviews
- Click the heart icon on any review to like it
- The heart will fill with red when liked
- Like count updates in real-time

### Commenting on Reviews
- Click the comment icon to expand the comment section
- Type your comment (max 1000 characters)
- Click "Post Comment" to submit
- Comments appear with user avatars and timestamps

### User Profiles
- Visit `/profile/:username` to see user profiles
- View user's reviews, bio, and location
- See follow/unfollow button if not your own profile
- Tabs for Reviews, Following, and Followers (coming soon)

## API Documentation

### Authentication Endpoints
- `POST /auth/register` - Register new user
- `POST /auth/login` - Login user
- `GET /users/me` - Get current user profile

### Social Endpoints
- `POST /social/follow/:userId` - Follow a user
- `DELETE /social/follow/:userId` - Unfollow a user
- `GET /social/follow/check/:userId` - Check if following
- `POST /social/like/:reviewId` - Like a review
- `DELETE /social/like/:reviewId` - Unlike a review
- `GET /social/like/check/:reviewId` - Check if liked
- `POST /social/comment/:reviewId` - Comment on review

### Beverage Endpoints
- `GET /beverages` - List beverages with filters
- `GET /beverages/:id` - Get beverage details
- `POST /beverages` - Create new beverage (auth required)

### Review Endpoints
- `GET /reviews` - List reviews with filters
- `POST /reviews` - Create review (auth required)
- `PUT /reviews/:id` - Update review (auth required)
- `DELETE /reviews/:id` - Delete review (auth required)

## Testing

### Test Credentials
- **Email**: `test2@example.com`
- **Password**: `password123`

### Manual Testing
1. Register a new account or use test credentials
2. Browse beverages and create reviews
3. Test social features:
   - Follow other users
   - Like reviews
   - Comment on reviews
4. Visit user profiles to see social interactions

## Troubleshooting

### Common Issues

**API Server Won't Start**
- Check if port 3001 is already in use
- Kill existing process: `lsof -ti:3001 | xargs kill -9`
- Restart API server

**Database Connection Issues**
- Verify DATABASE_URL in `.env` files
- Check if database is accessible
- Run `npm run generate` in packages/database

**Frontend Build Issues**
- Clear node_modules and reinstall: `rm -rf node_modules && npm install`
- Check for TypeScript errors
- Verify all environment variables are set

**Social Features Not Working**
- Ensure user is authenticated
- Check browser console for API errors
- Verify API server is running on port 3001

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

MIT License - see LICENSE file for details

## Support

For support, please open an issue on GitHub or contact the development team.