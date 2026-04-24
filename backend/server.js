// database autocheck before start
const { db, initializeDatabase } = require('./config/database');

require('dotenv').config();

db.raw('SELECT 1')
  .then(() => console.log('✅ DB Connected'))
  .catch((err) => {
    console.error('❌ DB Connection Error:', err.message);
    process.exit(1);
  });

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const { createServer } = require('http');
const { Server } = require('socket.io');

const authRoutes = require('./routes/auth');
const crimeRoutes = require('./routes/crimes');
const userRoutes = require('./routes/users');
const alertRoutes = require('./routes/alerts');
const predictionRoutes = require('./routes/predictions');
const assignmentRoutes = require('./routes/assignments');
const notificationRoutes = require('./routes/notifications');

const app = express();
const server = createServer(app);

const io = new Server(server, {
  cors: {
    origin: process.env.FRONTEND_URL || "http://localhost:3000",
    methods: ["GET", "POST"],
    credentials: true
  }
});

const PORT = process.env.PORT || 5000;

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100
});

// CORS configuration
const corsOptions = {
  origin: function (origin, callback) {
    const allowedOrigins = [
      process.env.FRONTEND_URL,
      'http://localhost:3000',
      'https://localhost:3000'
    ].filter(Boolean);
    
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
};

// Middleware
app.use(helmet());
app.use(cors(corsOptions));
app.use(limiter);
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/crimes', crimeRoutes);
app.use('/api/users', userRoutes);
app.use('/api/alerts', alertRoutes);
app.use('/api/predictions', predictionRoutes);
app.use('/api/assignments', assignmentRoutes);
app.use('/api/notifications', notificationRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    message: 'Smart Crime Prediction System API is running',
    timestamp: new Date().toISOString()
  });
});

// Socket.io
io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  // Join user-specific room for notifications
  socket.on('join-user-room', (userId) => {
    socket.join(`user_${userId}`);
    console.log(`User ${socket.id} joined user room: user_${userId}`);
  });

  // Join general rooms
  socket.on('join-room', (room) => {
    socket.join(room);
    console.log(`User ${socket.id} joined room: ${room}`);
  });

  // Handle new crime reports
  socket.on('new-crime', (crimeData) => {
    io.emit('crime-update', crimeData);
    io.emit('new-crime-report', crimeData);
  });

  // Handle alerts
  socket.on('alert', (alertData) => {
    io.emit('alert-notification', alertData);
  });

  // Handle role assignments (admin)
  socket.on('role-assigned', (data) => {
    // Send to specific user
    io.to(`user_${data.user_id}`).emit('role-assigned', {
      type: 'role_assigned',
      title: data.title || 'Role Assignment',
      message: data.message,
      assigned_by: data.assigned_by,
      assignedAt: new Date().toISOString(),
      role: data.role,
      department: data.department,
      priority: 'high',
      actionUrl: '/profile'
    });

    // Broadcast to admin room
    io.to('admin_room').emit('role-assigned-global', data);
  });

  // Handle crime assignments (IGP/Admin)
  socket.on('crime-assigned', (data) => {
    // Send to assigned officer
    io.to(`user_${data.officer_id}`).emit('crime-assigned', {
      type: 'crime_assigned',
      title: 'New Crime Assignment',
      message: `You have been assigned to investigate: ${data.crime_title}`,
      crime_id: data.crime_id,
      assigned_by: data.assigned_by,
      assignedAt: new Date().toISOString(),
      priority: 'high',
      actionUrl: `/crimes/${data.crime_id}`
    });

    // Broadcast to admin room
    io.to('admin_room').emit('crime-assigned-global', data);
  });

  // Handle assignment updates
  socket.on('assignment-updated', (data) => {
    io.emit('assignment-updated', data);
    
    // Send to specific officer if applicable
    if (data.officer_id) {
      io.to(`user_${data.officer_id}`).emit('my-assignment-updated', data);
    }
  });

  // Join admin room for admins
  socket.on('join-admin-room', () => {
    socket.join('admin_room');
    console.log(`Admin ${socket.id} joined admin room`);
  });

  // Handle user typing indicators (for future chat features)
  socket.on('typing', (data) => {
    socket.to(data.room || 'general').emit('user-typing', {
      userId: data.userId,
      userName: data.userName
    });
  });

  socket.on('stop-typing', (data) => {
    socket.to(data.room || 'general').emit('user-stopped-typing', {
      userId: data.userId
    });
  });

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});

// Error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    error: 'Something went wrong!',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error'
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Start server
async function startServer() {
  try {
    await initializeDatabase();

    server.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
      console.log(`📊 API Health: http://localhost:${PORT}/api/health`);
    });

  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
}

startServer();

module.exports = { app, io };