#  Event Management System - Architecture Notes

---

## 🎯 System Overview

The **Event Management System** is a full-stack web application that allows users to create, manage, and register for events with capacity limitations. The system implements modern web development practices with a focus on security, performance, and user experience.

### Core Features Implemented
- ✅ **User Authentication** - JWT-based registration and login
- ✅ **Event Management** - Full CRUD operations with creator permissions
- ✅ **Event Registration** - Capacity-limited registration with duplicate prevention
- ✅ **User Dashboard** - Statistics and profile management
- ✅ **Search Functionality** - Advanced event search and filtering
- ✅ **Responsive UI** - Mobile-first design with cloud-themed styling
- ✅ **Real-time Updates** - Live registration counts and availability
- ✅ **Notification System** - Beautiful toast notifications

---

## 🏛️ Architecture Diagram

```
┌─────────────────────┐    ┌─────────────────────┐    ┌─────────────────────┐
│                     │    │                     │    │                     │
│   React Frontend    │◄──►│   Express Backend   │◄──►│  PostgreSQL Database │
│                     │    │                     │    │                     │
│ • SPA Architecture  │    │ • RESTful API       │    │ • Relational Schema  │
│ • Component-based   │    │ • JWT Authentication│    │ • ACID Compliance    │
│ • Responsive Design │    │ • Input Validation  │    │ • Data Integrity     │
│ • State Management  │    │ • Rate Limiting     │    │ • Optimized Queries  │
│                     │    │ • CORS Protection   │    │                     │
└─────────────────────┘    └─────────────────────┘    └─────────────────────┘
         │                            │                            │
         ▼                            ▼                            ▼
┌─────────────────────┐    ┌─────────────────────┐    ┌─────────────────────┐
│                     │    │                     │    │                     │
│   Axios HTTP Client │    │   Middleware Stack  │    │   Connection Pool    │
│                     │    │                     │    │                     │
│ • Request/Response  │    │ • Authentication    │    │ • Efficient DB Conn  │
│ • Interceptors      │    │ • Authorization      │    │ • Query Optimization │
│ • Error Handling    │    │ • Validation         │    │ • Transaction Mgmt   │
│                     │    │ • Security Headers   │    │                     │
└─────────────────────┄────┴─────────────────────┴────┴─────────────────────┘
```

---

## 🛠️ Technology Stack Decisions

### Backend Framework: Express.js

**Decision**: Express.js with middleware architecture
- **Why Express?** Mature ecosystem, middleware-first approach, excellent for REST APIs
- **Alternatives Considered**: Fastify, Koa, NestJS
- **Rationale**: Simplicity, large community, excellent middleware support
- **Benefits**: Rapid development, extensive middleware ecosystem, proven stability

### Database: PostgreSQL

**Decision**: PostgreSQL with relational design
- **Why PostgreSQL?** Advanced features, JSON support, excellent performance
- **Rationale**: Data integrity requirements, complex relationships, ACID compliance
- **Benefits**: Prevents data corruption, supports complex queries, excellent concurrency

### Authentication: JWT + bcrypt

**Decision**: JWT tokens with bcrypt password hashing
- **Why JWT?** Stateless, scalable, mobile-friendly
- **Why bcrypt?** Industry standard, configurable cost factor, secure
- **Rationale**: Stateless architecture, better scalability, industry best practices
- **Benefits**: No server-side sessions, works with mobile apps, secure password storage

### Frontend: React with Hooks

**Decision**: React 18 with functional components and hooks
- **Why React?** Component-based architecture, excellent performance, large ecosystem
- **Why Hooks?** Modern React patterns, better code reuse, cleaner code
- **Rationale**: Developer productivity, maintainability, future-proof architecture
- **Benefits**: Better performance with concurrent features, improved developer experience

### State Management: React Context API

**Decision**: Built-in React Context API for global state
- **Why Context API?** Built-in React solution, no additional dependencies
- **Alternatives Considered**: Redux, Zustand, Recoil
- **Rationale**: Simpler architecture for our use case, React ecosystem integration
- **Benefits**: Better TypeScript support, easier testing, reduced bundle size

---


### Design Decisions

#### Foreign Key Constraints
- **Cascade Deletes**: Ensures data consistency when users/events are deleted
- **Referential Integrity**: Prevents orphaned records
- **Performance Impact**: Minimal with proper indexing

#### Unique Constraints
- **Email Uniqueness**: Prevents duplicate user accounts
- **Registration Uniqueness**: Prevents duplicate event registrations
- **Atomic Operations**: Database-level enforcement

#### Indexing Strategy
- **Date-based Queries**: Optimized for upcoming events filtering
- **User-based Queries**: Fast user-specific data retrieval
- **Foreign Key Indexes**: Automatic optimization for joins

---

## 🔐 Security Implementation

### Authentication Security

#### Password Security
- **bcrypt hashing** with configurable salt rounds (10)
- **Minimum password length** enforced (6 characters)
- **No plaintext password storage**

#### JWT Token Security
- **Expiration time** set to 24 hours
- **Token validation** on every protected request
- **User verification** against database on each request
- **Secure token storage** in localStorage


#### Data Isolation
- Users can only access their own data
- Event creators can only modify their own events
- Registration data properly scoped to user

### Input Validation & Sanitization

#### Server-side Validation
- **express-validator** for comprehensive input validation
- **Type checking** for all input fields
- **Length limits** to prevent buffer overflow
- **Email normalization** for consistent storage

#### SQL Injection Prevention
- **Parameterized queries** using pg library
- **No dynamic SQL construction**
- **Input sanitization** before database operations


## 🎯 Summary

This **Event Management System** implements a robust, scalable architecture with modern development practices:

### ✅ **Implemented Features:**
- **Full-stack Architecture** with React + Express + PostgreSQL
- **JWT Authentication** with secure password hashing
- **Role-based Authorization** with creator permissions
- **Capacity Management** with real-time availability tracking
- **Duplicate Prevention** at database level
- **Advanced Search** with multiple filters
- **Responsive UI** with cloud-themed design
- **Toast Notifications** replacing popup alerts
- **Input Validation** on both frontend and backend
- **Rate Limiting** for security
- **User Dashboard** with statistics
- **Profile Management** features

