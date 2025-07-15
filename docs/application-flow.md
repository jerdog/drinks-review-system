# Wine & Cocktail Review Platform - Application Flow

## System Architecture Overview

```mermaid
graph TB
    subgraph "Frontend (React + Vite)"
        A[User Interface]
        B[AuthContext]
        C[React Router]
        D[API Client]
    end

    subgraph "Backend (Fastify API)"
        E[Authentication Middleware]
        F[Route Handlers]
        G[Prisma ORM]
        H[JWT Token Validation]
    end

    subgraph "Database (PostgreSQL + Neon)"
        I[User Data]
        J[Beverage Data]
        K[Review Data]
        L[Social Data]
    end

    A --> D
    D --> E
    E --> F
    F --> G
    G --> I
    G --> J
    G --> K
    G --> L
```

## Complete User Journey Flow

```mermaid
flowchart TD
    A[User Visits App] --> B{Authenticated?}

    B -->|No| C[Landing Page]
    B -->|Yes| D[Dashboard]

    C --> E[Login/Register]
    E --> F[Authentication Process]
    F --> G{JWT Token Valid?}

    G -->|No| H[Login Failed]
    G -->|Yes| I[Token Stored in localStorage]

    I --> D
    D --> J[Browse Beverages]
    D --> K[View Profile]
    D --> L[Search Reviews]

    J --> M[Select Beverage]
    M --> N[Beverage Detail Page]
    N --> O{User Reviewed This?}

    O -->|No| P[Review Form]
    O -->|Yes| Q[View Existing Review]

    P --> R[Rate (1-5 Stars)]
    R --> S[Add Notes]
    S --> T[Set Price/Serving Type]
    T --> U[Submit Review]

    U --> V[API: POST /reviews]
    V --> W[Database: Create Review]
    W --> X[Update UI]

    Q --> Y[Edit Review]
    Y --> Z[API: PUT /reviews/:id]
    Z --> W

    N --> AA[View All Reviews]
    AA --> BB[Like/Unlike Reviews]
    BB --> CC[API: POST /reviews/:id/like]

    K --> DD[Profile Management]
    DD --> EE[Update Profile]
    EE --> FF[API: PUT /users/me]

    L --> GG[Search & Filter]
    GG --> HH[API: GET /beverages/search]
    HH --> II[Display Results]
```

## Authentication Flow

```mermaid
sequenceDiagram
    participant U as User
    participant F as Frontend
    participant A as API
    participant D as Database

    U->>F: Enter credentials
    F->>A: POST /auth/login
    A->>D: Query user by email
    D->>A: Return user data
    A->>A: Hash password comparison
    A->>A: Generate JWT token
    A->>F: Return token + user data
    F->>F: Store token in localStorage
    F->>F: Update AuthContext
    F->>U: Redirect to dashboard

    Note over F,A: Subsequent requests
    F->>A: GET /users/me (with Bearer token)
    A->>A: Verify JWT token
    A->>D: Query user by userId
    D->>A: Return user data
    A->>F: Return user profile
```

## Review Creation Flow

```mermaid
sequenceDiagram
    participant U as User
    participant F as Frontend
    participant A as API
    participant D as Database

    U->>F: Select beverage
    F->>A: GET /beverages/:id
    A->>D: Query beverage + reviews
    D->>A: Return beverage data
    A->>F: Return beverage details
    F->>U: Display beverage page

    U->>F: Fill review form
    F->>F: Validate form data
    F->>A: POST /reviews (with Bearer token)
    A->>A: Verify JWT token
    A->>A: Validate review data
    A->>D: Check existing review
    D->>A: No existing review
    A->>D: Create new review
    D->>A: Return created review
    A->>F: Return review data
    F->>F: Update UI state
    F->>U: Show success message
```

## Database Schema Relationships

```mermaid
erDiagram
    User {
        string id PK
        string email UK
        string username UK
        string password
        string displayName
        string bio
        string location
        string avatar
        boolean isPrivate
        boolean isAdmin
        boolean isVerified
        json preferences
        datetime createdAt
        datetime updatedAt
    }

    Beverage {
        string id PK
        string name
        string slug UK
        string description
        string type
        string region
        string varietal
        float abv
        int vintage
        boolean isApproved
        string suggestedBy FK
        string categoryId FK
        datetime createdAt
        datetime updatedAt
    }

    Review {
        string id PK
        int rating
        string notes
        float price
        string servingType
        boolean isAnonymous
        boolean isPublic
        string userId FK
        string beverageId FK
        string venueId FK
        datetime createdAt
        datetime updatedAt
    }

    BeverageCategory {
        string id PK
        string name
        string slug UK
        string description
        string parentId FK
        datetime createdAt
        datetime updatedAt
    }

    Venue {
        string id PK
        string name
        string slug UK
        string description
        string address
        string city
        string state
        string country
        float latitude
        float longitude
        string website
        string phone
        boolean isVerified
        datetime createdAt
        datetime updatedAt
    }

    User ||--o{ Review : "creates"
    Beverage ||--o{ Review : "has"
    Venue ||--o{ Review : "hosts"
    BeverageCategory ||--o{ Beverage : "categorizes"
    BeverageCategory ||--o{ BeverageCategory : "parent-child"
```

## API Endpoints Flow

```mermaid
graph LR
    subgraph "Authentication"
        A1[POST /auth/register]
        A2[POST /auth/login]
        A3[GET /auth/logout]
    end

    subgraph "User Management"
        B1[GET /users/me]
        B2[PUT /users/me]
        B3[GET /users/:id]
    end

    subgraph "Beverage Management"
        C1[GET /beverages]
        C2[GET /beverages/:id]
        C3[GET /beverages/categories]
        C4[GET /beverages/search]
        C5[POST /beverages]
    end

    subgraph "Review Management"
        D1[GET /reviews]
        D2[GET /reviews/:id]
        D3[POST /reviews]
        D4[PUT /reviews/:id]
        D5[DELETE /reviews/:id]
        D6[POST /reviews/:id/like]
    end

    subgraph "Social Features"
        E1[POST /social/follow/:userId]
        E2[DELETE /social/follow/:userId]
        E3[POST /social/like/:reviewId]
        E4[DELETE /social/like/:reviewId]
    end

    A1 --> B1
    A2 --> B1
    C1 --> C2
    C2 --> D3
    D3 --> D1
    D1 --> D6
    D6 --> E3
```

## Frontend Component Architecture

```mermaid
graph TD
    subgraph "App Structure"
        A[App.jsx]
        B[AuthProvider]
        C[Router]
    end

    subgraph "Pages"
        D[LoginPage]
        E[RegisterPage]
        F[DashboardPage]
        G[BeverageListPage]
        H[BeverageDetailPage]
        I[ProfilePage]
        J[StatusPage]
    end

    subgraph "Components"
        K[ReviewCard]
        L[ReviewForm]
        M[BeverageCard]
        N[SearchBar]
        O[Navigation]
        P[StarRating]
    end

    subgraph "Context"
        Q[AuthContext]
        R[User State]
        S[Token Management]
    end

    A --> B
    B --> C
    C --> D
    C --> E
    C --> F
    C --> G
    C --> H
    C --> I
    C --> J

    H --> K
    H --> L
    G --> M
    G --> N
    A --> O
    L --> P

    B --> Q
    Q --> R
    Q --> S
```

## Error Handling Flow

```mermaid
flowchart TD
    A[API Request] --> B{Request Valid?}

    B -->|No| C[400 Bad Request]
    B -->|Yes| D{Authenticated?}

    D -->|No| E[401 Unauthorized]
    D -->|Yes| F{Authorized?}

    F -->|No| G[403 Forbidden]
    F -->|Yes| H{Resource Exists?}

    H -->|No| I[404 Not Found]
    H -->|Yes| J[Process Request]

    J --> K{Database Success?}
    K -->|No| L[500 Internal Server Error]
    K -->|Yes| M[200 Success Response]

    C --> N[Frontend Error Handling]
    E --> N
    G --> N
    I --> N
    L --> N
    M --> O[Update UI]
```

## Data Flow Summary

```mermaid
graph LR
    subgraph "User Input"
        A[Login Form]
        B[Review Form]
        C[Search Input]
    end

    subgraph "Frontend Processing"
        D[Form Validation]
        E[State Management]
        F[API Calls]
    end

    subgraph "Backend Processing"
        G[Request Validation]
        H[Authentication]
        I[Business Logic]
        J[Database Operations]
    end

    subgraph "Data Storage"
        K[PostgreSQL Database]
        L[Neon Hosting]
    end

    subgraph "Response"
        M[JSON Response]
        N[Error Handling]
        O[UI Updates]
    end

    A --> D
    B --> D
    C --> D
    D --> E
    E --> F
    F --> G
    G --> H
    H --> I
    I --> J
    J --> K
    K --> L
    J --> M
    M --> N
    N --> O
    O --> E
```

This diagram shows the complete flow of the Wine & Cocktail Review Platform, from user authentication through beverage browsing, review creation, and social interactions. The system uses a modern stack with React frontend, Fastify backend, Prisma ORM, and PostgreSQL database hosted on Neon.