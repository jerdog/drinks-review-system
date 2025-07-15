# System Architecture Documentation

This document provides comprehensive Mermaid diagrams showing how the Wine, Cocktail, and Spirit Review Platform functions, including the newly implemented social features.

## 1. System Architecture Overview

```mermaid
graph TB
    subgraph "Frontend (React + Vite)"
        UI[User Interface]
        Auth[Authentication Context]
        Router[React Router]
        Components[Social Components]
    end

    subgraph "Backend (Fastify API)"
        API[API Server]
        AuthAPI[Authentication Routes]
        BeverageAPI[Beverage Routes]
        ReviewAPI[Review Routes]
        SocialAPI[Social Routes]
    end

    subgraph "Database (PostgreSQL + Prisma)"
        DB[(PostgreSQL Database)]
        UserTable[Users Table]
        BeverageTable[Beverages Table]
        ReviewTable[Reviews Table]
        FollowTable[Follows Table]
        LikeTable[Likes Table]
        CommentTable[Comments Table]
    end

    subgraph "External Services"
        NeonDB[Neon PostgreSQL]
        Cloudflare[Cloudflare Images]
    end

    UI --> API
    Auth --> AuthAPI
    Components --> SocialAPI
    API --> DB
    DB --> NeonDB
    API --> Cloudflare
```

## 2. User Journey Flow

```mermaid
journey
    title User Journey: Social Features
    section Registration & Onboarding
      Visit Platform: 5: User
      Register Account: 4: User
      Complete Profile: 3: User
    section Discovery & Social
      Browse Beverages: 5: User
      Follow Other Users: 4: User
      Like Reviews: 5: User
      Comment on Reviews: 4: User
    section Content Creation
      Create Review: 5: User
      Upload Photos: 3: User
      Check-in at Venue: 2: User
    section Community Engagement
      View Activity Feed: 4: User
      Respond to Comments: 3: User
      Share Reviews: 3: User
```

## 3. Authentication Flow

```mermaid
sequenceDiagram
    participant U as User
    participant F as Frontend
    participant A as API
    participant D as Database

    U->>F: Register/Login
    F->>A: POST /auth/register or /auth/login
    A->>D: Create/Verify User
    D-->>A: User Data
    A->>A: Generate JWT Token
    A-->>F: JWT Token + User Data
    F->>F: Store Token in Context
    F-->>U: Redirect to Dashboard

    Note over U,F: Social Features Require Authentication
    U->>F: Follow User
    F->>A: POST /social/follow/:userId (with JWT)
    A->>A: Verify JWT Token
    A->>D: Create Follow Relationship
    D-->>A: Success
    A-->>F: Updated Follow Status
    F-->>U: UI Updates (Follow → Unfollow)
```

## 4. Review Creation Flow

```mermaid
flowchart TD
    A[User Searches Beverage] --> B{Find Beverage?}
    B -->|Yes| C[Select Existing Beverage]
    B -->|No| D[Create New Beverage]
    D --> E[Admin Approval Required]
    C --> F[Write Review]
    F --> G[Rate 1-5 Stars]
    G --> H[Add Tasting Notes]
    H --> I[Upload Photos]
    I --> J[Submit Review]
    J --> K[Review Saved]
    K --> L[Social Features Available]
    L --> M[Others Can Like/Comment]
    M --> N[User Gets Notifications]
```

## 5. Social Features Flow

```mermaid
flowchart TD
    A[User Views Review] --> B{Authenticated?}
    B -->|No| C[Show Login Prompt]
    B -->|Yes| D[Display Like Button]
    D --> E[User Clicks Like]
    E --> F[API: POST /social/like/:reviewId]
    F --> G[Database: Create Like Record]
    G --> H[UI Updates: Heart Fills]
    H --> I[Like Counter Updates]

    A --> J[User Views Profile]
    J --> K[Display Follow Button]
    K --> L[User Clicks Follow]
    L --> M[API: POST /social/follow/:userId]
    M --> N[Database: Create Follow Record]
    N --> O[UI Updates: Follow → Unfollow]

    A --> P[User Adds Comment]
    P --> Q[API: POST /social/comment/:reviewId]
    Q --> R[Database: Create Comment Record]
    R --> S[UI Updates: Comment Appears]
    S --> T[Review Author Gets Notification]
```

## 6. Database Schema Relationships

```mermaid
erDiagram
    USERS {
        int id PK
        string email
        string username
        string password_hash
        string avatar_url
        text bio
        string location
        datetime created_at
        datetime updated_at
    }

    BEVERAGES {
        int id PK
        string name
        string category
        string region
        string producer
        string description
        string image_url
        datetime created_at
        datetime updated_at
    }

    REVIEWS {
        int id PK
        int user_id FK
        int beverage_id FK
        int rating
        text notes
        string photo_url
        datetime created_at
        datetime updated_at
    }

    FOLLOWS {
        int id PK
        int follower_id FK
        int following_id FK
        datetime created_at
    }

    LIKES {
        int id PK
        int user_id FK
        int review_id FK
        datetime created_at
    }

    COMMENTS {
        int id PK
        int user_id FK
        int review_id FK
        text content
        datetime created_at
        datetime updated_at
    }

    NOTIFICATIONS {
        int id PK
        int user_id FK
        string type
        text message
        boolean read
        datetime created_at
    }

    USERS ||--o{ REVIEWS : "creates"
    USERS ||--o{ FOLLOWS : "follows"
    USERS ||--o{ LIKES : "likes"
    USERS ||--o{ COMMENTS : "comments"
    USERS ||--o{ NOTIFICATIONS : "receives"
    BEVERAGES ||--o{ REVIEWS : "reviewed_in"
    REVIEWS ||--o{ LIKES : "liked_by"
    REVIEWS ||--o{ COMMENTS : "commented_on"
```

## 7. API Endpoints Architecture

```mermaid
graph LR
    subgraph "Authentication"
        A1[POST /auth/register]
        A2[POST /auth/login]
        A3[GET /users/me]
    end

    subgraph "Beverages"
        B1[GET /beverages]
        B2[GET /beverages/:id]
        B3[POST /beverages]
        B4[GET /beverages/search]
        B5[GET /beverages/categories]
    end

    subgraph "Reviews"
        R1[GET /reviews]
        R2[GET /reviews/:id]
        R3[POST /reviews]
        R4[PUT /reviews/:id]
        R5[DELETE /reviews/:id]
        R6[GET /users/:userId/reviews]
    end

    subgraph "Social Features"
        S1[POST /social/follow/:userId]
        S2[DELETE /social/follow/:userId]
        S3[GET /social/follow/check/:userId]
        S4[POST /social/like/:reviewId]
        S5[DELETE /social/like/:reviewId]
        S6[GET /social/like/check/:reviewId]
        S7[POST /social/comment/:reviewId]
    end

    subgraph "Health & Status"
        H1[GET /health]
        H2[GET /status]
    end
```

## 8. Frontend Component Architecture

```mermaid
graph TD
    subgraph "Pages"
        P1[LoginPage]
        P2[RegisterPage]
        P3[BeverageListPage]
        P4[BeverageDetailPage]
        P5[ProfilePage]
        P6[StatusPage]
    end

    subgraph "Components"
        C1[Navigation]
        C2[AuthContext]
        C3[ReviewCard]
        C4[ReviewForm]
        C5[StarRating]
        C6[LikeButton]
        C7[FollowButton]
        C8[CommentForm]
        C9[CommentList]
    end

    subgraph "Social Components"
        SC1[LikeButton]
        SC2[FollowButton]
        SC3[CommentForm]
        SC4[CommentList]
        SC5[UserProfile]
    end

    P1 --> C2
    P2 --> C2
    P3 --> C3
    P4 --> C3
    P4 --> C4
    P4 --> C6
    P4 --> C8
    P4 --> C9
    P5 --> C7
    C3 --> C5
    C3 --> C6
    C3 --> C8
    C3 --> C9
```

## 9. Error Handling & Data Flow

```mermaid
flowchart TD
    A[User Action] --> B{Valid Request?}
    B -->|No| C[Show Error Message]
    B -->|Yes| D[API Call]
    D --> E{Authentication Required?}
    E -->|Yes| F{Valid Token?}
    F -->|No| G[Redirect to Login]
    F -->|Yes| H[Process Request]
    E -->|No| H
    H --> I{Database Operation}
    I -->|Success| J[Update UI]
    I -->|Error| K[Show Error Message]
    J --> L[Real-time Updates]
    K --> M[Log Error]
    L --> N[User Sees Changes]
```

## 10. Social Features Data Flow Summary

```mermaid
graph LR
    subgraph "User Actions"
        UA1[Follow User]
        UA2[Like Review]
        UA3[Comment on Review]
    end

    subgraph "API Processing"
        AP1[Validate JWT Token]
        AP2[Check User Permissions]
        AP3[Create Database Record]
        AP4[Generate Notification]
    end

    subgraph "Database Updates"
        DU1[Follows Table]
        DU2[Likes Table]
        DU3[Comments Table]
        DU4[Notifications Table]
    end

    subgraph "UI Updates"
        UI1[Button State Changes]
        UI2[Counter Updates]
        UI3[Real-time Display]
        UI4[Notification Badge]
    end

    UA1 --> AP1
    UA2 --> AP1
    UA3 --> AP1
    AP1 --> AP2
    AP2 --> AP3
    AP3 --> DU1
    AP3 --> DU2
    AP3 --> DU3
    AP4 --> DU4
    DU1 --> UI1
    DU2 --> UI2
    DU3 --> UI3
    DU4 --> UI4
```

## 11. Current Implementation Status

### ✅ Completed Features
- **Authentication System**: JWT-based auth with bcrypt hashing
- **Beverage Management**: Full CRUD operations with search and filtering
- **Review System**: Star ratings, tasting notes, photo support
- **Social Features**: Follow/unfollow, like/unlike, comments
- **User Profiles**: Enhanced profiles with social statistics
- **Real-time UI**: Immediate updates for social actions

### 🔄 In Progress
- **Photo Uploads**: Image upload system for reviews
- **Venue Integration**: Check-in system and venue database
- **Advanced Search**: Enhanced filtering and recommendations
- **Admin Dashboard**: Content moderation tools

### 📋 Planned Features
- **Mobile App**: React Native implementation
- **Gamification**: Badges, achievements, leaderboards
- **OAuth Integration**: Google and GitHub login
- **Real-time Features**: WebSocket for live updates

## 12. Technical Stack Summary

- **Frontend**: React 18 + Vite + Tailwind CSS
- **Backend**: Fastify API + Prisma ORM
- **Database**: PostgreSQL (Neon)
- **Authentication**: JWT tokens with bcrypt
- **Social Features**: Real-time UI updates with state management
- **Deployment**: Development environment fully functional

The system now provides a complete social platform for wine, cocktail, and spirit enthusiasts with robust authentication, comprehensive beverage management, and engaging social features that encourage community interaction and content creation.