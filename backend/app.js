require('dotenv').config();

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const { errorHandler } = require('./middleware/errorHandler');
const authRoutes = require('./routes/auth');
const worldRoutes = require('./routes/worlds');
const entryRoutes = require('./routes/entries');
const friendRoutes = require('./routes/friends');
const resonanceRoutes = require('./routes/resonances');
const userRoutes = require('./routes/users');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
  credentials: true,
}));
app.use(helmet());
app.use(morgan('dev'));
app.use(express.json({ limit: '2mb' }));
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/worlds', worldRoutes);
app.use('/api/entries', entryRoutes);
app.use('/api/friends', friendRoutes);
app.use('/api/resonances', resonanceRoutes);
app.use('/api/users', userRoutes);

// 404
app.use((req, res) => {
  res.status(404).json({ code: 404, message: '接口不存在', data: null });
});

// Global error handler
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`私域小世界后端服务已启动: http://localhost:${PORT}`);
});
