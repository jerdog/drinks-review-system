# Wine & Cocktail Review Platform

A modern web application for reviewing wines and cocktails, similar to Untappd but focused on wine and cocktail enthusiasts.

## Features

- **Social Review Platform**: Rate and review wines, cocktails, and liquors
- **Social Features**: Follow users, like/comment on reviews, share reviews
- **Gamification**: Badges, achievements, leaderboards
- **Check-ins**: Track where you had your drinks
- **Discovery**: Search and discover new beverages
- **Mobile-First**: Responsive design with future React Native mobile app
- **Modern Tech Stack**: Fastify API, PostgreSQL (Neon), Tailwind CSS, React frontend

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
- **CSS Framework**: Tailwind CSS
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

## Current Status

### ✅ Phase 1: Authentication System (Complete)
- **Backend**: JWT authentication with bcrypt password hashing
- **Frontend**: Login/register pages with AuthContext
- **Features**: User registration, login, logout, profile management
- **Test Credentials**: `test2@example.com` / `password123`

### ✅ Phase 2: Beverage & Review System (Complete)
- **Backend**: Complete beverage and review API with full CRUD operations
- **Frontend**: Beverage listing, detail pages, review creation and display
- **Features**:
  - Search and filter beverages
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

### 🔄 Phase 3: Social Features (In Progress)
- User profiles and following system
- Like/unlike reviews
- Comments on reviews
- Activity feed
- Notifications

### 📋 Phase 4: Advanced Features (Planned)
- Venue integration
- Check-ins
- Gamification (badges, achievements)
- Mobile app (React Native)
- Advanced search and recommendations

## Testing

### Quick Test
1. Visit http://localhost:3000/status
2. Use the "Quick Login" button
3. Test the various API endpoints
4. Try creating reviews with different ratings

### Manual Testing
1. Register a new account or use test credentials
2. Browse beverages at http://localhost:3000/beverages
3. Click on a beverage to view details
4. Create a review with rating and notes
5. Verify the review displays correctly

## Troubleshooting

### Common Issues
- **Database Connection**: Ensure `DATABASE_URL` is set correctly in all packages
- **Prisma Client**: Run `npx prisma generate` in `packages/database` if you see initialization errors
- **Authentication**: Check that JWT_SECRET is set and consistent
- **CORS**: Ensure CORS_ORIGIN matches your frontend URL

### Development Tips
- Use the Status page (`/status`) for quick API testing
- Check API logs for detailed error information
- Use browser dev tools to inspect network requests
- Restart servers after environment variable changes

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

MIT License - see LICENSE file for details