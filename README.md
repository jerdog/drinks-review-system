# Wine & Cocktail Review Platform

A modern web application for reviewing wines and cocktails, similar to Untappd but focused on wine and cocktail enthusiasts.

## Features

- **Social Review Platform**: Rate and review wines, cocktails, and liquors
- **Social Features**: Follow users, like/comment on reviews, share reviews
- **Gamification**: Badges, achievements, leaderboards
- **Check-ins**: Track where you had your drinks
- **Discovery**: Search and discover new beverages
- **Mobile-First**: Responsive design with future React Native mobile app
- **Modern Tech Stack**: Fastify API, PostgreSQL (Neon), Bulma CSS, React frontend

## Tech Stack

### Backend
- **API**: Fastify 5.x (REST API)
- **Database**: PostgreSQL with Prisma ORM (hosted on Neon)
- **Authentication**: JWT tokens with bcrypt password hashing
- **File Storage**: Cloudflare Images / AWS S3 (planned)
- **Caching**: Redis / Cloudflare (planned)
- **Image Processing**: Sharp for optimization (planned)

### Frontend
- **Framework**: React 18 with Vite
- **CSS Framework**: Bulma
- **State Management**: React Context API
- **Routing**: React Router DOM
- **Icons**: Font Awesome

### Mobile (Future)
- **Framework**: React Native
- **Navigation**: React Navigation

### DevOps
- **CI/CD**: GitHub Actions
- **Deployment**: Vercel / Netlify (frontend), Railway / Render (backend)
- **Monitoring**: Sentry / LogRocket

## Project Structure

```
/
├── apps/
│   ├── web/                 # React frontend (Vite)
│   └── api/                 # Fastify API
├── packages/
│   ├── types/               # Shared JavaScript types (JSDoc)
│   ├── utils/               # Shared utilities
│   └── database/            # Prisma schema and client
├── docs/                    # Documentation
└── scripts/                 # Development scripts
```

## Getting Started

### Prerequisites
- Node.js 18+
- npm (currently using npm for compatibility)
- PostgreSQL (Neon account recommended)

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
   ```

5. **Start development servers**
   ```bash
   # Terminal 1 - API
   cd apps/api
   npm run dev

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

## Phase 2: Beverage & Review System (Backend) ✅

- **Status:** Complete
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
- **Seed Data:**
  - Run `npm run seed` in `packages/database` to populate beverages and categories
- **Troubleshooting:**
  - Ensure `.env` and `DATABASE_URL` are consistent across all packages
  - If you see `@prisma/client did not initialize yet`, run `npx prisma generate` in the correct package
  - Restart the API after seeding or schema changes

## Phase 2: Frontend Integration ✅

- **Status:** Complete
- **Frontend Pages:**
  - `/beverages` - Beverage listing with search, filter, and pagination
  - `/beverages/:id` - Beverage detail page with reviews and review creation
- **Features:**
  - Responsive design with Tailwind CSS
  - Search beverages by name, region, varietal
  - Filter by category and type
  - Pagination for large datasets
  - Review creation with rating, notes, price, serving type
  - Anonymous and public/private review options
  - Star rating system (1-5 stars)
  - Authentication integration
  - Accessibility features (ARIA labels, keyboard navigation)
- **Test Credentials:**
  - Email: `test2@example.com`
  - Password: `password123`
  - Username: `testuser2`
- **Testing:**
  - Frontend: `http://localhost:3000`
  - API: `http://localhost:3001`
  - Status Page: `http://localhost:3000/status`

## API Endpoints

### Authentication
- `POST /auth/register` - Register new user
- `POST /auth/login` - Login user
- `GET /auth/:provider` - Social login (placeholder)

### User Management
- `GET /users/me` - Get current user profile (protected)
- `PUT /users/me` - Update current user profile (protected)
- `GET /users/:username` - Get public user profile
- `POST /users/:username/follow` - Follow user (protected)
- `DELETE /users/:username/follow` - Unfollow user (protected)
- `GET /users/:username/followers` - Get user followers
- `GET /users/:username/following` - Get user following

### Beverages
- `GET /beverages` - List beverages (filters: type, category, search, approved)
- `GET /beverages/:id` - Get beverage details
- `GET /beverages/categories` - List beverage categories
- `GET /beverages/search` - Search beverages
- `POST /beverages` - Suggest or create beverage (auth required)
- `PUT /beverages/:id` - Update beverage (admin only)
- `DELETE /beverages/:id` - Delete beverage (admin only)

### Reviews
- `GET /reviews` - List reviews (filters: beverageId, userId, rating, sort)
- `GET /reviews/:id` - Get review details
- `POST /reviews` - Create review (auth required)
- `PUT /reviews/:id` - Update review (auth required)
- `DELETE /reviews/:id` - Delete review (auth required)
- `GET /users/:userId/reviews` - List reviews by user
- `POST /reviews/:id/like` - Like/unlike a review (auth required)

### Utility
- `GET /health` - Health check
- `GET /debug/routes` - List all registered routes

## Frontend Pages

### Public Pages
- `/` - Homepage with features and recent reviews
- `/login` - User login page
- `/register` - User registration page
- `/search` - Beverage search and discovery
- `/leaderboard` - Top reviewers and achievements

### Protected Pages
- `/dashboard` - User dashboard
- `/profile/:username` - User profile pages
- `/review/:id` - Individual review page

### Development Pages
- `/status` - System status and integration tests

## Current Status

### ✅ Phase 1 - Authentication System (COMPLETED)
- [x] Project structure and monorepo setup
- [x] Fastify API with all major plugins
- [x] React frontend with Vite and Bulma
- [x] Complete Prisma database schema
- [x] User authentication (JWT + bcrypt)
- [x] User registration and login
- [x] Protected routes and middleware
- [x] User profile management
- [x] Social features (follow/unfollow)
- [x] Frontend authentication context
- [x] Login and registration pages
- [x] Database deployment (Neon PostgreSQL)
- [x] All authentication endpoints working
- [x] Frontend-backend integration complete
- [x] Status page for system monitoring
- [x] Comprehensive integration tests

### 🚧 Phase 2 - Core Features (NEXT)
- [ ] Beverage review system
- [ ] Search and discovery
- [ ] Photo upload functionality
- [ ] Comments and likes
- [ ] Check-ins and venues
- [ ] Badges and achievements

### 📋 Phase 3 - Advanced Features (PLANNED)
- [ ] OAuth social login (Google, GitHub)
- [ ] Mobile app (React Native)
- [ ] Real-time notifications
- [ ] Advanced search filters
- [ ] Admin dashboard
- [ ] Production deployment

## Testing & Monitoring

### Status Page (`/status`)
The application includes a comprehensive status page for monitoring and testing:

- **API Status Check** - Real-time backend connectivity
- **Authentication Status** - Current user login state
- **Integration Tests** - Test registration, login, protected endpoints, database
- **System Information** - Environment and configuration details

### Running Tests
1. Visit http://localhost:3000/status
2. Click "Run All Tests" for comprehensive system verification
3. Use individual test buttons for specific functionality testing

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Make your changes
4. Add tests if applicable
5. Commit your changes (`git commit -m 'Add some amazing feature'`)
6. Push to the branch (`git push origin feature/amazing-feature`)
7. Open a Pull Request

## License

MIT License - see LICENSE file for details.

## Support

For questions or issues, please open an issue on GitHub.