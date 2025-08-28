# 🏗️ Event Management System - Architecture Notes

## 📋 Table of Contents

- [System Overview](#-system-overview)
- [Architecture Diagram](#-architecture-diagram)
- [Technology Stack Decisions](#-technology-stack-decisions)
- [Database Design](#-database-design)
- [Backend Architecture](#-backend-architecture)
- [Frontend Architecture](#-frontend-architecture)
- [Security Implementation](#-security-implementation)
- [Key Design Patterns](#-key-design-patterns)
- [Performance Optimizations](#-performance-optimizations)
- [Scalability Considerations](#-scalability-considerations)

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
- **Alternatives Considered**: MySQL, MongoDB, SQLite
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

## 🗄️ Database Design

### Schema Implementation

```sql
-- Users Table
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  name VARCHAR(255) NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Events Table
CREATE TABLE events (
  id SERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  date_time TIMESTAMP NOT NULL,
  location VARCHAR(255),
  max_capacity INTEGER NOT NULL,
  created_by INTEGER REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Registrations Table
CREATE TABLE registrations (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  event_id INTEGER REFERENCES events(id) ON DELETE CASCADE,
  registration_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  status VARCHAR(50) DEFAULT 'confirmed',
  UNIQUE(user_id, event_id)
);

-- Performance Indexes
CREATE INDEX idx_events_date_time ON events(date_time);
CREATE INDEX idx_registrations_user_id ON registrations(user_id);
CREATE INDEX idx_registrations_event_id ON registrations(event_id);
```

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

## 🔧 Backend Architecture

### Middleware Stack

```javascript
// Security & Performance Middleware
app.use(helmet());                    // Security headers
app.use(cors(corsOptions));           // CORS protection
app.use(express.json());              // JSON parsing
app.use(express.urlencoded());        // Form data parsing
app.use(rateLimit(limiter));          // Rate limiting

// Route-specific Middleware
app.use('/api/auth', authRoutes);     // Public auth routes
app.use('/api/events', eventRoutes);  // Protected event routes
app.use('/api/events', registrationRoutes); // Registration routes
app.use('/api/users', userRoutes);    // User management routes
```

### Authentication Flow

```javascript
// 1. User Registration/Login
POST /api/auth/register → bcrypt.hash() → JWT.sign() → Return token

// 2. Token Validation
authenticateToken middleware → jwt.verify() → Database validation → req.user

// 3. Authorization
authorizeEventCreator middleware → Check ownership → Allow/Deny action

// 4. Protected Routes
Route handler → Access req.user → Perform action with user context
```

### Error Handling Strategy

```javascript
// Global Error Handler
app.use((error, req, res, next) => {
  console.error('Global error:', error);
  res.status(error.status || 500).json({
    message: error.message || 'Internal server error',
    ...(process.env.NODE_ENV === 'development' && { stack: error.stack })
  });
});

// Validation Error Handler
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      message: 'Validation failed',
      errors: errors.array()
    });
  }
  next();
};
```

### Input Validation Strategy

```javascript
// Event Validation
const validateEvent = [
  body('title').trim().isLength({ min: 1, max: 255 })
    .withMessage('Title is required and must be less than 255 characters'),
  body('description').optional().trim().isLength({ max: 1000 })
    .withMessage('Description must be less than 1000 characters'),
  body('date_time').isISO8601()
    .withMessage('Date must be a valid ISO date'),
  body('location').trim().isLength({ min: 1, max: 255 })
    .withMessage('Location is required and must be less than 255 characters'),
  body('max_capacity').isInt({ min: 1 })
    .withMessage('Max capacity must be a positive integer'),
  handleValidationErrors
];

// User Validation
const validateUser = [
  body('email').isEmail().normalizeEmail()
    .withMessage('Valid email is required'),
  body('name').trim().isLength({ min: 1, max: 255 })
    .withMessage('Name is required and must be less than 255 characters'),
  body('password').isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long'),
  handleValidationErrors
];
```

---

## 🎨 Frontend Architecture

### Component Structure

```
frontend/src/
├── components/           # Reusable UI components
│   ├── Auth.css         # Login/register styling
│   ├── EventList.js     # Event browsing component
│   ├── EventForm.js     # Event creation form
│   ├── EventEdit.js     # Event editing form
│   ├── UserDashboard.js # Dashboard with statistics
│   ├── UserRegistrations.js # Registration management
│   ├── NotificationSystem.js # Toast notifications
│   └── Navbar.js        # Navigation component
├── contexts/            # React context providers
│   └── AuthContext.js   # Authentication state management
├── services/            # External service integrations
│   └── api.js           # Axios configuration
└── App.js               # Main application component
```

### State Management Architecture

```javascript
// AuthContext Provider
const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const login = async (email, password) => {
    const response = await api.post('/auth/login', { email, password });
    const { user: userData, token } = response.data;

    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(userData));
    setUser(userData);
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};
```

### API Integration Pattern

```javascript
// Axios Configuration
const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:5000/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request Interceptor
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Handle token expiration
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);
```

### Component Architecture Patterns

#### Container/Presentational Pattern
```javascript
// Container Component (Business Logic)
const EventListContainer = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const { showSuccess, showError } = useNotification();

  const handleRegister = async (eventId) => {
    try {
      await api.post(`/events/${eventId}/register`);
      showSuccess('Successfully registered for event!');
      // Update state
    } catch (error) {
      showError(error.response?.data?.message);
    }
  };

  return <EventList events={events} onRegister={handleRegister} loading={loading} />;
};

// Presentational Component (UI Only)
const EventList = ({ events, onRegister, loading }) => {
  if (loading) return <div>Loading events...</div>;

  return (
    <div className="event-list">
      {events.map(event => (
        <EventCard key={event.id} event={event} onRegister={onRegister} />
      ))}
    </div>
  );
};
```

#### Custom Hooks for Logic Reuse
```javascript
// Custom Hook for Event Management
const useEvents = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(false);
  const { showSuccess, showError } = useNotification();

  const fetchEvents = async (searchParams = {}) => {
    setLoading(true);
    try {
      const response = await api.get('/events', { params: searchParams });
      setEvents(response.data.events);
    } catch (error) {
      showError('Failed to fetch events');
    } finally {
      setLoading(false);
    }
  };

  const createEvent = async (eventData) => {
    try {
      const response = await api.post('/events', eventData);
      showSuccess('Event created successfully!');
      return response.data.event;
    } catch (error) {
      showError(error.response?.data?.message);
      throw error;
    }
  };

  return { events, loading, fetchEvents, createEvent };
};
```

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

### Authorization Security

#### Role-based Access Control
```javascript
const authorizeEventCreator = async (req, res, next) => {
  try {
    const eventId = req.params.id;
    const userId = req.user.id;

    // Verify event ownership
    const result = await pool.query(
      'SELECT created_by FROM events WHERE id = $1',
      [eventId]
    );

    if (result.rows[0].created_by !== userId) {
      return res.status(403).json({
        message: 'Only event creator can perform this action'
      });
    }

    next();
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};
```

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

### Rate Limiting Implementation

```javascript
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
});

app.use('/api/', limiter);
```

### Security Headers

```javascript
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  },
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true
  }
}));
```

---

## 🎭 Key Design Patterns

### Repository Pattern (Backend)

```javascript
// Data Access Layer
class EventRepository {
  async findAll(searchParams = {}) {
    const query = this.buildSearchQuery(searchParams);
    const result = await pool.query(query, searchParams.values);
    return result.rows;
  }

  async findById(id) {
    const result = await pool.query(
      'SELECT * FROM events WHERE id = $1',
      [id]
    );
    return result.rows[0];
  }

  async create(eventData) {
    const result = await pool.query(
      'INSERT INTO events (title, description, date_time, location, max_capacity, created_by) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
      [eventData.title, eventData.description, eventData.date_time, eventData.location, eventData.max_capacity, eventData.created_by]
    );
    return result.rows[0];
  }

  async update(id, eventData) {
    const result = await pool.query(
      'UPDATE events SET title = $1, description = $2, date_time = $3, location = $4, max_capacity = $5 WHERE id = $6 RETURNING *',
      [eventData.title, eventData.description, eventData.date_time, eventData.location, eventData.max_capacity, id]
    );
    return result.rows[0];
  }

  async delete(id) {
    await pool.query('DELETE FROM events WHERE id = $1', [id]);
    return true;
  }
}
```

### Service Layer Pattern

```javascript
// Business Logic Layer
class EventService {
  constructor(eventRepository, registrationRepository) {
    this.eventRepository = eventRepository;
    this.registrationRepository = registrationRepository;
  }

  async createEvent(eventData, userId) {
    // Validate business rules
    await this.validateEventData(eventData);

    // Check for scheduling conflicts
    await this.checkSchedulingConflicts(eventData.date_time, userId);

    // Create event
    const event = await this.eventRepository.create({
      ...eventData,
      created_by: userId
    });

    return event;
  }

  async registerForEvent(eventId, userId) {
    // Check event exists and has capacity
    const event = await this.eventRepository.findById(eventId);
    if (!event) {
      throw new Error('Event not found');
    }

    // Check capacity
    const currentRegistrations = await this.registrationRepository.countByEventId(eventId);
    if (currentRegistrations >= event.max_capacity) {
      throw new Error('Event is at full capacity');
    }

    // Check user not already registered
    const existingRegistration = await this.registrationRepository.findByUserAndEvent(userId, eventId);
    if (existingRegistration) {
      throw new Error('You are already registered for this event');
    }

    // Create registration
    return await this.registrationRepository.create({
      user_id: userId,
      event_id: eventId
    });
  }
}
```

### Controller Pattern

```javascript
// Presentation Layer
class EventController {
  constructor(eventService) {
    this.eventService = eventService;
  }

  async createEvent(req, res) {
    try {
      const eventData = req.body;
      const userId = req.user.id;

      const event = await this.eventService.createEvent(eventData, userId);

      res.status(201).json({
        message: 'Event created successfully',
        event
      });
    } catch (error) {
      if (error.message === 'Event not found') {
        return res.status(404).json({ message: error.message });
      }
      if (error.message === 'Event is at full capacity') {
        return res.status(400).json({ message: error.message });
      }
      res.status(500).json({ message: 'Server error creating event' });
    }
  }
}
```

### Observer Pattern (Frontend Notifications)

```javascript
// Notification System
const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([]);

  const addNotification = (message, type = 'success', duration = 4000) => {
    const id = Date.now() + Math.random();
    const notification = { id, message, type, duration };

    setNotifications(prev => [...prev, notification]);

    // Auto remove after duration
    if (duration > 0) {
      setTimeout(() => {
        removeNotification(id);
      }, duration);
    }

    return id;
  };

  const removeNotification = (id) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  // Observer pattern - components can subscribe to notifications
  const showSuccess = (message, duration) => addNotification(message, 'success', duration);
  const showError = (message, duration) => addNotification(message, 'error', duration);
  const showWarning = (message, duration) => addNotification(message, 'warning', duration);
  const showInfo = (message, duration) => addNotification(message, 'info', duration);

  return (
    <NotificationContext.Provider value={{
      notifications,
      addNotification,
      removeNotification,
      showSuccess,
      showError,
      showWarning,
      showInfo
    }}>
      {children}
      <NotificationContainer />
    </NotificationContext.Provider>
  );
};
```

---

## ⚡ Performance Optimizations

### Database Optimizations

#### Query Optimization
```sql
-- Optimized query with JOINs to reduce round trips
SELECT
  e.*,
  u.name as creator_name,
  COUNT(r.id) as current_registrations,
  (e.max_capacity - COUNT(r.id)) as available_spots
FROM events e
LEFT JOIN users u ON e.created_by = u.id
LEFT JOIN registrations r ON e.id = r.event_id AND r.status = 'confirmed'
WHERE e.date_time > NOW()
GROUP BY e.id, u.name
ORDER BY e.date_time ASC;
```

#### Connection Pooling
```javascript
const pool = new Pool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  max: 20, // Maximum number of clients in the pool
  idleTimeoutMillis: 30000, // Close idle clients after 30 seconds
  connectionTimeoutMillis: 2000, // Return an error after 2 seconds if connection could not be established
});
```

#### Indexing Strategy
```sql
-- Performance indexes
CREATE INDEX idx_events_date_time ON events(date_time);
CREATE INDEX idx_registrations_user_id ON registrations(user_id);
CREATE INDEX idx_registrations_event_id ON registrations(event_id);

-- Composite index for complex queries
CREATE INDEX idx_events_search ON events(title, description, location);
```

### API Optimizations

#### Response Caching
```javascript
const cache = new Map();

const getCachedEvents = async (cacheKey) => {
  if (cache.has(cacheKey)) {
    return cache.get(cacheKey);
  }

  const events = await fetchEventsFromDatabase();
  cache.set(cacheKey, events);

  // Expire cache after 5 minutes
  setTimeout(() => {
    cache.delete(cacheKey);
  }, 5 * 60 * 1000);

  return events;
};
```

#### Request Debouncing (Frontend)
```javascript
const useDebounce = (value, delay) => {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
};

// Usage in search component
const SearchComponent = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const debouncedSearchTerm = useDebounce(searchTerm, 500);

  useEffect(() => {
    if (debouncedSearchTerm) {
      performSearch(debouncedSearchTerm);
    }
  }, [debouncedSearchTerm]);

  return (
    <input
      value={searchTerm}
      onChange={(e) => setSearchTerm(e.target.value)}
      placeholder="Search events..."
    />
  );
};
```

#### Image Optimization
```css
/* Optimized image loading */
.event-image {
  width: 100%;
  height: 200px;
  object-fit: cover;
  loading: lazy; /* Native lazy loading */
}

/* Progressive loading */
.event-image-blur {
  filter: blur(10px);
  transition: filter 0.3s ease;
}

.event-image-blur.loaded {
  filter: blur(0);
}
```

### Bundle Optimization

#### Code Splitting
```javascript
// Route-based code splitting
const EventList = lazy(() => import('./components/EventList'));
const EventForm = lazy(() => import('./components/EventForm'));
const UserDashboard = lazy(() => import('./components/UserDashboard'));

const App = () => {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <Routes>
        <Route path="/events" element={<EventList />} />
        <Route path="/create-event" element={<EventForm />} />
        <Route path="/dashboard" element={<UserDashboard />} />
      </Routes>
    </Suspense>
  );
};
```

#### Bundle Analysis
```bash
# Analyze bundle size
npm install --save-dev webpack-bundle-analyzer

# Add to package.json scripts
"analyze": "npm run build && npx webpack-bundle-analyzer build/static/js/*.js"

npm run analyze
```

---

## 📈 Scalability Considerations

### Horizontal Scaling

#### Database Scaling
```sql
-- Read replicas for read-heavy operations
-- Connection pooling with multiple instances
-- Sharding strategy for large datasets
-- Query optimization and indexing

-- Example: Read replica configuration
const readPool = new Pool({
  host: process.env.DB_READ_HOST,
  port: process.env.DB_PORT,
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
});

const writePool = new Pool({
  host: process.env.DB_WRITE_HOST,
  port: process.env.DB_PORT,
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
});
```

#### Application Scaling
```javascript
// Cluster mode for utilizing multiple CPU cores
const cluster = require('cluster');
const numCPUs = require('os').cpus().length;

if (cluster.isMaster) {
  console.log(`Master ${process.pid} is running`);

  // Fork workers
  for (let i = 0; i < numCPUs; i++) {
    cluster.fork();
  }

  cluster.on('exit', (worker, code, signal) => {
    console.log(`Worker ${worker.process.pid} died`);
    cluster.fork(); // Restart worker
  });
} else {
  // Worker process
  app.listen(PORT);
  console.log(`Worker ${process.pid} started`);
}
```

### Caching Strategies

#### Redis Integration (Future Enhancement)
```javascript
const redis = require('redis');
const client = redis.createClient();

// Cache frequently accessed data
const cacheEvent = async (eventId, eventData) => {
  await client.setex(`event:${eventId}`, 3600, JSON.stringify(eventData));
};

const getCachedEvent = async (eventId) => {
  const cached = await client.get(`event:${eventId}`);
  return cached ? JSON.parse(cached) : null;
};

// Cache user sessions
const cacheUserSession = async (token, userData) => {
  await client.setex(`session:${token}`, 86400, JSON.stringify(userData));
};

const getCachedUser = async (token) => {
  const cached = await client.get(`session:${token}`);
  return cached ? JSON.parse(cached) : null;
};
```

### Load Balancing

#### Nginx Configuration
```nginx
upstream event_app {
    server 127.0.0.1:5000;
    server 127.0.0.1:5001;
    server 127.0.0.1:5002;
}

server {
    listen 80;
    server_name yourdomain.com;

    location / {
        proxy_pass http://event_app;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

### Monitoring and Observability

#### Application Metrics
```javascript
// Prometheus metrics
const promClient = require('prom-client');
const collectDefaultMetrics = promClient.collectDefaultMetrics;
collectDefaultMetrics({ prefix: 'event_management_' });

// Custom metrics
const httpRequestsTotal = new promClient.Counter({
  name: 'http_requests_total',
  help: 'Total number of HTTP requests',
  labelNames: ['method', 'route', 'status_code']
});

// Middleware to track requests
app.use((req, res, next) => {
  res.on('finish', () => {
    httpRequestsTotal
      .labels(req.method, req.route?.path || req.path, res.statusCode)
      .inc();
  });
  next();
});
```

#### Health Checks
```javascript
// Health check endpoint
app.get('/health', async (req, res) => {
  const health = {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    memory: process.memoryUsage(),
    version: process.env.npm_package_version
  };

  // Check database connectivity
  try {
    await pool.query('SELECT 1');
    health.database = 'connected';
  } catch (error) {
    health.database = 'disconnected';
    health.status = 'unhealthy';
  }

  const statusCode = health.status === 'healthy' ? 200 : 503;
  res.status(statusCode).json(health);
});
```

---

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





*Last updated: January 2024*
