# Wine, Cocktail, and Spirit Review Platform

A comprehensive platform for wine, cocktail, and spirit enthusiasts to discover, review, and share their experiences with beverages and venues.

## 🚀 Features

### Core Features
- **User Authentication**: Secure login/register with JWT tokens
- **Beverage Management**: Add, edit, and categorize wines, cocktails, and spirits
- **Review System**: Rate and review beverages with detailed feedback
- **Search & Discovery**: Advanced search with filters and recommendations
- **User Profiles**: Personal profiles with review history and preferences

### Social Features ✅
- **Follow System**: Follow other users and see their activity
- **Like System**: Like and unlike reviews
- **Comments**: Comment on reviews with threaded discussions
- **Activity Feed**: Real-time user activity updates
- **User Search**: Find and connect with other users

### Advanced Features ✅
- **Photo Uploads**: Upload and manage photos for reviews and beverages
- **Venue Integration**: Add venues, check-ins, and location-based features
- **Notification System**: Real-time notifications for social interactions
- **Admin Dashboard**: Complete administrative tools and content moderation

### Admin Features ✅
- **User Management**: Ban/unban users, manage roles and verification
- **Content Moderation**: Approve/reject beverage submissions
- **Audit Logging**: Complete tracking of administrative actions
- **System Analytics**: Platform statistics and performance metrics
- **Admin Interface**: Responsive admin dashboard with sidebar navigation

## 🛠 Tech Stack

### Backend
- **Fastify**: High-performance web framework
- **Prisma ORM**: Type-safe database access
- **PostgreSQL**: Robust relational database
- **JWT**: Secure authentication
- **Multer**: File upload handling
- **Sharp**: Image optimization

### Frontend
- **React 18**: Modern UI library
- **Vite**: Fast build tool
- **Tailwind CSS**: Utility-first styling
- **React Router**: Client-side routing
- **React Query**: Server state management
- **React Hot Toast**: User notifications

### Development
- **TypeScript**: Type safety across the stack
- **ESLint**: Code quality and consistency
- **Prettier**: Code formatting
- **Monorepo**: Shared packages and types

## 📁 Project Structure

```
drinks-review-system/
├── apps/
│   ├── api/                 # Fastify backend
│   │   ├── src/
│   │   │   ├── routes/      # API endpoints
│   │   │   ├── middleware/  # Auth, validation
│   │   │   └── index.js     # Server entry
│   └── web/                 # React frontend
│       ├── src/
│       │   ├── components/  # Reusable components
│       │   ├── pages/       # Page components
│       │   ├── contexts/    # React contexts
│       │   └── App.jsx      # App entry
├── packages/
│   ├── database/            # Prisma schema
│   ├── types/               # Shared TypeScript types
│   └── utils/               # Shared utilities
└── docs/                    # Documentation
```

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- PostgreSQL 14+
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd drinks-review-system
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp apps/api/.env.example apps/api/.env
   cp apps/web/.env.example apps/web/.env
   ```

4. **Configure database**
   ```bash
   # Update database URL in apps/api/.env
   DATABASE_URL="postgresql://username:password@localhost:5432/drinks_review"
   ```

5. **Run database migrations**
   ```bash
   npm run db:migrate
   ```

6. **Start development servers**
   ```bash
   # Terminal 1: Start backend
   npm run dev:api

   # Terminal 2: Start frontend
   npm run dev:web
   ```

7. **Access the application**
   - Frontend: http://localhost:5173
   - Backend API: http://localhost:3000
   - Admin Dashboard: http://localhost:5173/admin

## 📚 API Documentation

### Authentication Endpoints
- `POST /auth/register` - User registration
- `POST /auth/login` - User login
- `GET /auth/profile` - Get user profile
- `PUT /auth/profile` - Update user profile

### Beverage Endpoints
- `GET /beverages` - List beverages with filters
- `POST /beverages` - Create new beverage
- `GET /beverages/:id` - Get beverage details
- `PUT /beverages/:id` - Update beverage
- `DELETE /beverages/:id` - Delete beverage

### Review Endpoints
- `GET /reviews` - List reviews with filters
- `POST /reviews` - Create new review
- `GET /reviews/:id` - Get review details
- `PUT /reviews/:id` - Update review
- `DELETE /reviews/:id` - Delete review

### Social Endpoints
- `POST /social/follow/:userId` - Follow user
- `DELETE /social/follow/:userId` - Unfollow user
- `POST /social/like/:reviewId` - Like review
- `DELETE /social/like/:reviewId` - Unlike review
- `POST /social/comment` - Add comment
- `GET /social/followers/:userId` - Get user followers
- `GET /social/following/:userId` - Get user following

### Venue Endpoints
- `GET /venues` - List venues with filters
- `POST /venues` - Create new venue
- `GET /venues/:id` - Get venue details
- `PUT /venues/:id` - Update venue
- `DELETE /venues/:id` - Delete venue
- `POST /venues/:id/checkin` - Check in to venue

### Notification Endpoints
- `GET /notifications` - Get user notifications
- `PUT /notifications/:id/read` - Mark notification as read
- `GET /notifications/preferences` - Get notification preferences
- `PUT /notifications/preferences` - Update notification preferences

### Admin Endpoints
- `GET /admin/dashboard` - Get admin dashboard stats
- `GET /admin/users` - List users with filters
- `PUT /admin/users/:userId` - Update user (ban/unban, roles)
- `GET /admin/beverages/pending` - Get pending beverage approvals
- `PUT /admin/beverages/:id/approve` - Approve/reject beverage
- `GET /admin/audit-logs` - Get audit logs
- `DELETE /admin/content/:type/:id` - Delete content

### Upload Endpoints
- `POST /upload/image` - Upload image with optimization
- `DELETE /upload/image/:filename` - Delete uploaded image

## 🧪 Testing

### Running Tests
```bash
# Run all tests
npm test

# Run backend tests only
npm run test:api

# Run frontend tests only
npm run test:web

# Run tests with coverage
npm run test:coverage
```

### Test Structure
- **Unit Tests**: Individual component and function testing
- **Integration Tests**: API endpoint and database testing
- **End-to-End Tests**: Complete user journey testing

## 🚀 Deployment

### Environment Setup
1. Set production environment variables
2. Configure database for production
3. Set up file storage (S3, Cloudflare, etc.)
4. Configure domain and SSL certificates

### Deployment Options
- **Vercel**: Full-stack deployment
- **Railway**: Easy deployment with PostgreSQL
- **Render**: Static site + API deployment
- **DigitalOcean**: VPS deployment
- **Docker**: Containerized deployment

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new features
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

For support and questions:
- Create an issue in the repository
- Check the documentation in `/docs`
- Review the API documentation

---

**Built with ❤️ for the beverage community**