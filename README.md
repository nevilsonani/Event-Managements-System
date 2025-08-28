# 🎉 Event Management System

A **complete full-stack event management application** built with modern technologies. Users can create events, register for events, and manage event capacity with a beautiful, responsive UI.


---

## 📋 Table of Contents

- [✨ What We've Built](#-what-weve-built)
- [🛠️ Tech Stack](#️-tech-stack)
- [🚀 Quick Setup](#-quick-setup)
- [🏃‍♂️ Running the Application](#️-running-the-application)
- [🧪 Testing Your Setup](#-testing-your-setup)
- [🎯 How to Use](#-how-to-use)
- [🔧 Development](#-development)

---

## ✨ What We've Built

### ✅ **Core Features - 100% Complete**

| Feature | Status | Description |
|---------|--------|-------------|
| **User Authentication** | ✅ **COMPLETE** | JWT-based registration and login |
| **Event Management** | ✅ **COMPLETE** | Full CRUD operations with creator permissions |
| **Event Registration** | ✅ **COMPLETE** | Capacity-limited registration with duplicate prevention |
| **Capacity Management** | ✅ **COMPLETE** | Real-time availability tracking |
| **Advanced Search** | ✅ **COMPLETE** | Search by keyword, location, and date range |
| **User Dashboard** | ✅ **COMPLETE** | Statistics, profile management, and quick actions |
| **Beautiful UI** | ✅ **COMPLETE** | Cloud-themed design with animations |
| **Notification System** | ✅ **COMPLETE** | Toast notifications replacing browser alerts |
| **Mobile Responsive** | ✅ **COMPLETE** | Works perfectly on all devices |
| **Input Validation** | ✅ **COMPLETE** | Frontend + backend validation |
| **Security Features** | ✅ **COMPLETE** | Rate limiting, CORS, security headers |

### 🎯 **Key Requirements Met**

- ✅ **Database Design**: 3 tables with proper relationships
- ✅ **User Authentication**: Secure JWT-based system
- ✅ **Event CRUD**: Create, read, update, delete events
- ✅ **Registration System**: Capacity limits + duplicate prevention
- ✅ **Authorization**: Creator-only permissions
- ✅ **Input Validation**: Comprehensive validation
- ✅ **Responsive UI**: Modern, mobile-first design

---

## 🛠️ Tech Stack

### Backend
- **🟢 Node.js** - Runtime environment
- **🚂 Express.js** - Web framework with middleware
- **🐘 PostgreSQL** - Relational database
- **🔐 JWT** - Authentication
- **🔒 bcryptjs** - Password hashing
- **✅ express-validator** - Input validation
- **🛡️ Helmet** - Security headers
- **⏱️ express-rate-limit** - Rate limiting

### Frontend
- **⚛️ React 18** - UI framework with hooks
- **🛣️ React Router v6** - Navigation
- **📡 Axios** - HTTP client
- **📅 date-fns** - Date formatting
- **🎨 CSS3** - Modern styling with animations

---


## 🚀 Complete Setup Guide

### Prerequisites
- Node.js (v16 or higher)
- npm (v8 or higher)
- PostgreSQL (v12 or higher)
- Git

### 🖥️ Backend Setup

1. **Clone the Repository**
   ```bash
   git clone https://github.com/nevilsonani/Event-Managements-System.git
   cd event-management-system/backend
   ```

2. **Install Dependencies**
   ```bash
   npm install
   ```

3. **Database Setup**
   - Ensure PostgreSQL is running
   - Create a new database:
     ```sql
     CREATE DATABASE event_management;
     ```

4. **Configure Environment**
   ```bash
   cp .env.example .env
   ```
   
   Edit `.env` with your configuration:
   ```env
   # Database
   DB_HOST=localhost
   DB_PORT=5432
   DB_NAME=event_management
   DB_USER=your_db_user
   DB_PASSWORD=your_db_password
   
   # JWT
   JWT_SECRET=your_secure_jwt_secret
   JWT_EXPIRES_IN=24h
   
   # Server
   PORT=5000
   NODE_ENV=development
   
   # CORS
   FRONTEND_URL=http://localhost:3000
   ```

5. **Run Database Migrations**
   ```bash
   npm run db:setup
   ```

6. **Start Backend Server**
   ```bash
   npm start
   ```
   - API will be available at: http://localhost:5000/api

### 💻 Frontend Setup

1. **Navigate to Frontend Directory**
   ```bash
   cd ../frontend
   ```

2. **Install Dependencies**
   ```bash
   npm install
   ```

3. **Configure Environment**
   ```bash
   cp .env.example .env
   ```
   
   Edit `.env`:
   ```env
   REACT_APP_API_URL=http://localhost:5000
   ```

4. **Start Development Server**
   ```bash
   npm start
   ```
   - Frontend will be available at: http://localhost:3000

### 🚀 Running Both Servers

1. **Using Concurrently (Recommended)**
   From project root:
   ```bash
   npm run install-all  # Installs both frontend and backend deps
   npm run dev         # Starts both servers
   ```

2. **Separate Terminals**
   - Terminal 1 (Backend):
     ```bash
     cd backend
     npm start
     ```
   - Terminal 2 (Frontend):
     ```bash
     cd frontend
     npm start
     ```

### 🔍 Verifying the Setup

1. **Check Backend**
   ```bash
   curl http://localhost:5000/api/health
   # Should return: {"status":"OK"}
   ```

2. **Check Frontend**
   - Open http://localhost:3000 in your browser
   - You should see the application home page

### 🔧 Troubleshooting

- **Database Connection Issues**
  - Verify PostgreSQL is running
  - Check database credentials in `.env`
  - Ensure user has proper permissions

- **Port Conflicts**
  - Change `PORT` in `.env` if 5000/3000 are in use
  - Update CORS and frontend API URLs accordingly

- **Dependency Issues**
  ```bash
  # In both frontend and backend:
  rm -rf node_modules package-lock.json
  npm install
  ```

---

## 🏃‍♂️ Running the Application

### Development Mode (Recommended)
```bash
npm run dev
```


### Production Mode
```bash
# Build and start production
npm run build
npm start
```

---






### 🔧 Technical Choices Rationale

#### **Backend Framework: Express.js**
- **Why Express?**: Mature, large ecosystem, middleware-first approach
- **Alternatives Considered**: Fastify, Koa
- **Decision Factor**: Developer experience, community support, simplicity

#### **Database: PostgreSQL**
- **Why PostgreSQL?**: Advanced features, JSON support, excellent performance
- **Alternatives Considered**: MySQL, MongoDB
- **Decision Factor**: Data integrity requirements, complex queries needed

#### **Authentication: JWT + bcrypt**
- **Why JWT?**: Stateless, scalable, mobile-friendly
- **Why bcrypt?**: Industry standard, configurable cost factor
- **Decision Factor**: Security best practices, performance requirements

#### **Frontend: React with Hooks**
- **Why React?**: Component-based, large ecosystem, excellent performance
- **Why Hooks?**: Modern React patterns, better code reuse, cleaner code
- **Decision Factor**: Developer productivity, maintainability, future-proofing

### 📊 Performance Optimizations

#### **Database Optimizations**
- **Indexes**: Optimized indexes on frequently queried columns
- **Connection Pooling**: Efficient database connection management
- **Query Optimization**: Complex queries with JOINs for reduced round trips

#### **API Optimizations**
- **Rate Limiting**: Prevents abuse and ensures fair resource usage
- **Input Validation**: Server-side validation prevents invalid data
- **Error Handling**: Comprehensive error handling with appropriate HTTP codes

#### **Frontend Optimizations**
- **Code Splitting**: React.lazy for route-based splitting
- **Image Optimization**: Efficient loading and caching strategies
- **Bundle Optimization**: Webpack optimization for smaller bundles

### 🔒 Security Considerations

#### **Authentication Security**
- **Password Hashing**: bcrypt with salt rounds for secure password storage
- **JWT Expiration**: Configurable token expiration for security
- **Token Validation**: Server-side token validation on each request

#### **API Security**
- **Input Validation**: Comprehensive input validation and sanitization
- **Rate Limiting**: Prevents brute force and DoS attacks
- **CORS Policy**: Configured for specific frontend origin
- **Security Headers**: Helmet.js provides security headers

#### **Data Protection**
- **SQL Injection Prevention**: Parameterized queries
- **XSS Protection**: Input sanitization and validation
- **CSRF Protection**: Proper CORS configuration

