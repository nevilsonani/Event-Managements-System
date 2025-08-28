# 🚀 Event Management System API Documentation

## 📋 Table of Contents

- [Base URL](#-base-url)
- [Authentication](#-authentication)
- [Authentication Endpoints](#-authentication-endpoints)
- [Event Management Endpoints](#-event-management-endpoints)
- [Registration Endpoints](#-registration-endpoints)
- [User Management Endpoints](#-user-management-endpoints)
- [Error Responses](#-error-responses)
- [Rate Limiting](#-rate-limiting)

---

## 🔗 Base URL

```
http://localhost:5000/api
```

All API endpoints are prefixed with `/api`. The frontend runs on `http://localhost:3000` and backend on `http://localhost:5000`.

---

## 🔐 Authentication

### JWT Token Usage

All protected endpoints require a JWT token in the Authorization header:

```
Authorization: Bearer <your_jwt_token>
```

### Token Expiration

- Tokens expire after **24 hours** by default
- Refresh tokens are not implemented
- Expired tokens return `401 Unauthorized`

---

## 🔐 Authentication Endpoints

### **POST** `/auth/register`

Register a new user account.

#### Request

```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "john@example.com",
    "password": "securepassword123"
  }'
```

#### Response (201 Created)

```json
{
  "message": "User registered successfully",
  "user": {
    "id": 1,
    "email": "john@example.com",
    "name": "John Doe",
    "created_at": "2024-01-01T00:00:00.000Z"
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

#### Error Response (400 Bad Request)

```json
{
  "message": "User with this email already exists"
}
```

---

### **POST** `/auth/login`

Authenticate user and get JWT token.

#### Request

```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "password": "securepassword123"
  }'
```

#### Response (200 OK)

```json
{
  "message": "Login successful",
  "user": {
    "id": 1,
    "email": "john@example.com",
    "name": "John Doe",
    "created_at": "2024-01-01T00:00:00.000Z"
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

#### Error Response (401 Unauthorized)

```json
{
  "message": "Invalid email or password"
}
```

---

## 🎪 Event Management Endpoints

### **GET** `/events`

Get all upcoming events with registration counts and search functionality.

#### Parameters

| Parameter | Type | Description | Required |
|-----------|------|-------------|----------|
| `q` | string | Search keyword (title/description) | No |
| `location` | string | Location filter | No |
| `date_from` | string | Start date (ISO format) | No |
| `date_to` | string | End date (ISO format) | No |

#### Request

```bash
# Get all upcoming events
curl -X GET http://localhost:5000/api/events

# Search events by keyword
curl -X GET "http://localhost:5000/api/events/search?q=conference"

# Search by location
curl -X GET "http://localhost:5000/api/events/search?location=downtown"

# Combined search
curl -X GET "http://localhost:5000/api/events/search?q=workshop&location=downtown&date_from=2024-06-01"
```

#### Response (200 OK)

```json
{
  "events": [
    {
      "id": 1,
      "title": "Tech Conference 2024",
      "description": "Annual technology conference",
      "date_time": "2024-06-15T09:00:00.000Z",
      "location": "Convention Center",
      "max_capacity": 200,
      "created_by": 1,
      "created_at": "2024-01-01T00:00:00.000Z",
      "creator_name": "John Doe",
      "current_registrations": 45,
      "available_spots": 155
    }
  ],
  "total": 1
}
```

---

### **POST** `/events`

Create a new event (requires authentication).

#### Request

```bash
curl -X POST http://localhost:5000/api/events \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN_HERE" \
  -d '{
    "title": "Tech Conference 2024",
    "description": "Annual technology conference with industry leaders",
    "date_time": "2024-06-15T09:00:00.000Z",
    "location": "Convention Center, Downtown",
    "max_capacity": 200
  }'
```

#### Response (201 Created)

```json
{
  "message": "Event created successfully",
  "event": {
    "id": 1,
    "title": "Tech Conference 2024",
    "description": "Annual technology conference with industry leaders",
    "date_time": "2024-06-15T09:00:00.000Z",
    "location": "Convention Center, Downtown",
    "max_capacity": 200,
    "created_by": 1,
    "created_at": "2024-01-01T00:00:00.000Z"
  }
}
```

#### Error Response (400 Bad Request)

```json
{
  "message": "Validation failed",
  "errors": [
    {
      "field": "title",
      "message": "Title is required and must be less than 255 characters"
    }
  ]
}
```

---

### **GET** `/events/:id`

Get specific event details with registration count.

#### Request

```bash
curl -X GET http://localhost:5000/api/events/1
```

#### Response (200 OK)

```json
{
  "event": {
    "id": 1,
    "title": "Tech Conference 2024",
    "description": "Annual technology conference",
    "date_time": "2024-06-15T09:00:00.000Z",
    "location": "Convention Center",
    "max_capacity": 200,
    "created_by": 1,
    "creator_name": "John Doe",
    "current_registrations": 45,
    "available_spots": 155
  }
}
```

#### Error Response (404 Not Found)

```json
{
  "message": "Event not found"
}
```

---

### **PUT** `/events/:id`

Update an event (creator only, requires authentication).

#### Request

```bash
curl -X PUT http://localhost:5000/api/events/1 \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN_HERE" \
  -d '{
    "title": "Updated Tech Conference 2024",
    "description": "Updated description",
    "date_time": "2024-06-15T10:00:00.000Z",
    "location": "Updated Convention Center",
    "max_capacity": 250
  }'
```

#### Response (200 OK)

```json
{
  "message": "Event updated successfully",
  "event": {
    "id": 1,
    "title": "Updated Tech Conference 2024",
    "description": "Updated description",
    "date_time": "2024-06-15T10:00:00.000Z",
    "location": "Updated Convention Center",
    "max_capacity": 250,
    "created_by": 1,
    "created_at": "2024-01-01T00:00:00.000Z"
  }
}
```

#### Error Response (403 Forbidden)

```json
{
  "message": "Only event creator can perform this action"
}
```

---

### **DELETE** `/events/:id`

Delete an event (creator only, requires authentication).

#### Request

```bash
curl -X DELETE http://localhost:5000/api/events/1 \
  -H "Authorization: Bearer YOUR_JWT_TOKEN_HERE"
```

#### Response (200 OK)

```json
{
  "message": "Event deleted successfully"
}
```

---

### **GET** `/events/creator/:userId`

Get events created by a specific user (requires authentication, users can only view their own events).

#### Request

```bash
curl -X GET http://localhost:5000/api/events/creator/1 \
  -H "Authorization: Bearer YOUR_JWT_TOKEN_HERE"
```

#### Response (200 OK)

```json
{
  "events": [
    {
      "id": 1,
      "title": "Tech Conference 2024",
      "description": "Annual technology conference",
      "date_time": "2024-06-15T09:00:00.000Z",
      "location": "Convention Center",
      "max_capacity": 200,
      "created_by": 1,
      "created_at": "2024-01-01T00:00:00.000Z",
      "current_registrations": 45,
      "available_spots": 155
    }
  ],
  "total": 1
}
```

---

## 👥 Registration Endpoints

### **POST** `/events/:id/register`

Register for an event (requires authentication).

#### Request

```bash
curl -X POST http://localhost:5000/api/events/1/register \
  -H "Authorization: Bearer YOUR_JWT_TOKEN_HERE"
```

#### Response (201 Created)

```json
{
  "message": "Successfully registered for event",
  "registration": {
    "id": 1,
    "user_id": 1,
    "event_id": 1,
    "registration_date": "2024-01-01T00:00:00.000Z",
    "status": "confirmed"
  }
}
```

#### Error Response (400 Bad Request)

```json
{
  "message": "Event is at full capacity"
}
```

#### Error Response (400 Bad Request)

```json
{
  "message": "You are already registered for this event"
}
```

---

### **DELETE** `/events/:id/register`

Cancel event registration (requires authentication).

#### Request

```bash
curl -X DELETE http://localhost:5000/api/events/1/register \
  -H "Authorization: Bearer YOUR_JWT_TOKEN_HERE"
```

#### Response (200 OK)

```json
{
  "message": "Registration cancelled successfully"
}
```

#### Error Response (404 Not Found)

```json
{
  "message": "Registration not found"
}
```

---

### **GET** `/events/users/:id/registrations`

Get user's event registrations (requires authentication, users can only view their own registrations).

#### Request

```bash
curl -X GET http://localhost:5000/api/events/users/1/registrations \
  -H "Authorization: Bearer YOUR_JWT_TOKEN_HERE"
```

#### Response (200 OK)

```json
{
  "registrations": [
    {
      "id": 1,
      "user_id": 1,
      "event_id": 1,
      "registration_date": "2024-01-01T00:00:00.000Z",
      "status": "confirmed",
      "title": "Tech Conference 2024",
      "description": "Annual technology conference",
      "date_time": "2024-06-15T09:00:00.000Z",
      "location": "Convention Center",
      "max_capacity": 200,
      "creator_name": "John Doe"
    }
  ],
  "total": 1
}
```

---

## 👤 User Management Endpoints

### **GET** `/users/profile`

Get user profile information (requires authentication).

#### Request

```bash
curl -X GET http://localhost:5000/api/users/profile \
  -H "Authorization: Bearer YOUR_JWT_TOKEN_HERE"
```

#### Response (200 OK)

```json
{
  "user": {
    "id": 1,
    "email": "john@example.com",
    "name": "John Doe",
    "created_at": "2024-01-01T00:00:00.000Z"
  }
}
```

---

### **PUT** `/users/profile`

Update user profile information (requires authentication).

#### Request

```bash
curl -X PUT http://localhost:5000/api/users/profile \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN_HERE" \
  -d '{
    "name": "John Smith",
    "email": "johnsmith@example.com"
  }'
```

#### Response (200 OK)

```json
{
  "message": "Profile updated successfully",
  "user": {
    "id": 1,
    "email": "johnsmith@example.com",
    "name": "John Smith",
    "created_at": "2024-01-01T00:00:00.000Z"
  }
}
```

#### Error Response (400 Bad Request)

```json
{
  "message": "Email is already taken by another user"
}
```

---

### **PUT** `/users/change-password`

Change user password (requires authentication).

#### Request

```bash
curl -X PUT http://localhost:5000/api/users/change-password \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN_HERE" \
  -d '{
    "currentPassword": "currentpassword123",
    "newPassword": "newpassword123"
  }'
```

#### Response (200 OK)

```json
{
  "message": "Password changed successfully"
}
```

#### Error Response (400 Bad Request)

```json
{
  "message": "Current password is incorrect"
}
```

---

### **GET** `/users/stats`

Get user statistics and dashboard data (requires authentication).

#### Request

```bash
curl -X GET http://localhost:5000/api/users/stats \
  -H "Authorization: Bearer YOUR_JWT_TOKEN_HERE"
```

#### Response (200 OK)

```json
{
  "stats": {
    "events_created": 3,
    "events_registered": 5,
    "upcoming_events": 2
  }
}
```

---

## ❌ Error Responses

### Common Error Codes

#### **400 Bad Request**
```json
{
  "message": "Validation failed",
  "errors": [
    {
      "field": "email",
      "message": "Valid email is required"
    }
  ]
}
```

#### **401 Unauthorized**
```json
{
  "message": "Access token required"
}
```
```json
{
  "message": "Invalid or expired token"
}
```

#### **403 Forbidden**
```json
{
  "message": "Only event creator can perform this action"
}
```

#### **404 Not Found**
```json
{
  "message": "Event not found"
}
```
```json
{
  "message": "Registration not found"
}
```

#### **500 Internal Server Error**
```json
{
  "message": "Server error during registration"
}
```

---

## ⏱️ Rate Limiting

### Rate Limits

- **100 requests per 15 minutes** per IP address
- Applied to all `/api/` endpoints
- Includes authentication and public endpoints

### Rate Limit Headers

```bash
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 99
X-RateLimit-Reset: 1640995200
```

### Rate Limit Exceeded Response (429)

```json
{
  "message": "Too many requests from this IP, please try again later."
}
```

---

## 🧪 Testing Workflow

### Complete API Testing Flow

#### 1. Health Check
```bash
curl -X GET http://localhost:5000/api/health
```

#### 2. User Registration
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "test@example.com",
    "password": "testpass123"
  }'
```

#### 3. User Login (Save Token)
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "testpass123"
  }'
```

#### 4. Create Event
```bash
curl -X POST http://localhost:5000/api/events \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -d '{
    "title": "Test Event",
    "description": "This is a test event",
    "date_time": "2024-12-31T18:00:00.000Z",
    "location": "Test Location",
    "max_capacity": 50
  }'
```

#### 5. Browse Events
```bash
curl -X GET http://localhost:5000/api/events
```

#### 6. Register for Event
```bash
curl -X POST http://localhost:5000/api/events/1/register \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

#### 7. View Registrations
```bash
curl -X GET http://localhost:5000/api/events/users/YOUR_USER_ID/registrations \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

---

## 📝 Notes

### Request Format
- All requests use JSON format
- Content-Type header required for POST/PUT requests
- Authorization header required for protected endpoints

### Response Format
- All responses use JSON format
- Success responses include relevant data
- Error responses include error message and details

### Data Types
- **Dates**: ISO 8601 format (`2024-01-01T00:00:00.000Z`)
- **IDs**: Integer values
- **Strings**: UTF-8 encoded, max 255 characters for most fields
- **Booleans**: Standard JSON boolean values

### Security
- All passwords are hashed using bcrypt
- JWT tokens are validated on each request
- Input validation prevents injection attacks
- Rate limiting prevents abuse
