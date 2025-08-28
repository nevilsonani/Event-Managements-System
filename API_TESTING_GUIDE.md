# 🚀 Complete API Testing Guide

## 📋 Prerequisites
- Backend server running on `http://localhost:5000`
- PostgreSQL database set up and running
- Database tables created using `npm run db:setup`

## 🔐 Authentication Endpoints

### 1. User Registration
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "john@example.com",
    "password": "password123"
  }'
```

### 2. User Login
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "password": "password123"
  }'
```

**Save the token from the response for authenticated requests!**

## 🎉 Event Management Endpoints

### 3. Create Event (Requires Auth)
```bash
curl -X POST http://localhost:5000/api/events \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -d '{
    "title": "Tech Conference 2024",
    "description": "Annual technology conference with industry leaders",
    "date_time": "2024-06-15T09:00:00.000Z",
    "location": "Convention Center, Downtown",
    "max_capacity": 200
  }'
```

### 4. List All Upcoming Events
```bash
curl -X GET http://localhost:5000/api/events
```

### 5. Search Events
```bash
# Search by keyword
curl -X GET "http://localhost:5000/api/events/search?q=tech"

# Search by location
curl -X GET "http://localhost:5000/api/events/search?location=downtown"

# Search by date range
curl -X GET "http://localhost:5000/api/events/search?date_from=2024-06-01&date_to=2024-06-30"

# Combined search
curl -X GET "http://localhost:5000/api/events/search?q=conference&location=downtown&date_from=2024-06-01"
```

### 6. Get Event Details
```bash
curl -X GET http://localhost:5000/api/events/1
```

### 7. Get Events by Creator (Requires Auth)
```bash
curl -X GET http://localhost:5000/api/events/creator/1 \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

### 8. Update Event (Requires Auth + Creator)
```bash
curl -X PUT http://localhost:5000/api/events/1 \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -d '{
    "title": "Updated Tech Conference 2024",
    "description": "Updated description",
    "date_time": "2024-06-15T10:00:00.000Z",
    "location": "Updated Convention Center",
    "max_capacity": 250
  }'
```

### 9. Delete Event (Requires Auth + Creator)
```bash
curl -X DELETE http://localhost:5000/api/events/1 \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

## 👥 User Registration Endpoints

### 10. Register for Event (Requires Auth)
```bash
curl -X POST http://localhost:5000/api/events/1/register \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

### 11. Cancel Registration (Requires Auth)
```bash
curl -X DELETE http://localhost:5000/api/events/1/register \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

### 12. Get User's Registrations (Requires Auth)
```bash
curl -X GET http://localhost:5000/api/events/users/1/registrations \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

## 👤 User Management Endpoints

### 13. Get User Profile (Requires Auth)
```bash
curl -X GET http://localhost:5000/api/users/profile \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

### 14. Update User Profile (Requires Auth)
```bash
curl -X PUT http://localhost:5000/api/users/profile \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -d '{
    "name": "John Smith",
    "email": "johnsmith@example.com"
  }'
```

### 15. Change Password (Requires Auth)
```bash
curl -X PUT http://localhost:5000/api/users/change-password \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -d '{
    "currentPassword": "password123",
    "newPassword": "newpassword123"
  }'
```

### 16. Get User Statistics (Requires Auth)
```bash
curl -X GET http://localhost:5000/api/users/stats \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

## 🧪 Testing Workflow

### Step 1: Health Check
```bash
curl -X GET http://localhost:5000/api/health
```

### Step 2: Create Test User
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "test@example.com",
    "password": "testpass123"
  }'
```

### Step 3: Login and Get Token
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "testpass123"
  }'
```

### Step 4: Create Event
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

### Step 5: Test All Endpoints
Use the token from Step 3 to test all authenticated endpoints.

## ❌ Error Testing

### Test Invalid Token
```bash
curl -X GET http://localhost:5000/api/users/profile \
  -H "Authorization: Bearer invalid_token"
```

### Test Unauthorized Access
```bash
# Try to update event created by another user
curl -X PUT http://localhost:5000/api/events/1 \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -d '{
    "title": "Unauthorized Update",
    "description": "This should fail",
    "date_time": "2024-12-31T18:00:00.000Z",
    "location": "Test Location",
    "max_capacity": 50
  }'
```

### Test Validation Errors
```bash
# Test invalid event data
curl -X POST http://localhost:5000/api/events \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -d '{
    "title": "",
    "max_capacity": -5
  }'
```
