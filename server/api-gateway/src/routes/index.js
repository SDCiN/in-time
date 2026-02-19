import { createProxyMiddleware } from 'http-proxy-middleware'

export const setupRoutes = (app) => {
  const proxyOptions = {
    changeOrigin: true,
    onError: (err, req, res) => {
      console.error('Proxy Error:', err)
      res.status(502).json({
        success: false,
        message: 'Service unavailable',
      })
    },
  }

  // Auth Service
  app.use('/api/v1/auth', createProxyMiddleware({
    target: process.env.AUTH_SERVICE_URL || 'http://localhost:3001',
    ...proxyOptions,
  }))

  // User Service
  app.use('/api/v1/users', createProxyMiddleware({
    target: process.env.USER_SERVICE_URL || 'http://localhost:3002',
    ...proxyOptions,
  }))

  // Project Service
  app.use('/api/v1/projects', createProxyMiddleware({
    target: process.env.PROJECT_SERVICE_URL || 'http://localhost:3003',
    ...proxyOptions,
  }))
  app.use('/api/v1/portfolios', createProxyMiddleware({
    target: process.env.PROJECT_SERVICE_URL || 'http://localhost:3003',
    ...proxyOptions,
  }))

  // Timesheet Service
  app.use('/api/v1/timesheets', createProxyMiddleware({
    target: process.env.TIMESHEET_SERVICE_URL || 'http://localhost:3004',
    ...proxyOptions,
  }))

  // Allocation Service
  app.use('/api/v1/allocations', createProxyMiddleware({
    target: process.env.ALLOCATION_SERVICE_URL || 'http://localhost:3005',
    ...proxyOptions,
  }))
  app.use('/api/v1/rate-cards', createProxyMiddleware({
    target: process.env.ALLOCATION_SERVICE_URL || 'http://localhost:3005',
    ...proxyOptions,
  }))

  // Contract Service
  app.use('/api/v1/clients', createProxyMiddleware({
    target: process.env.CONTRACT_SERVICE_URL || 'http://localhost:3006',
    ...proxyOptions,
  }))
  app.use('/api/v1/contracts', createProxyMiddleware({
    target: process.env.CONTRACT_SERVICE_URL || 'http://localhost:3006',
    ...proxyOptions,
  }))
  app.use('/api/v1/frames', createProxyMiddleware({
    target: process.env.CONTRACT_SERVICE_URL || 'http://localhost:3006',
    ...proxyOptions,
  }))

  // Financial Service
  app.use('/api/v1/financial', createProxyMiddleware({
    target: process.env.FINANCIAL_SERVICE_URL || 'http://localhost:3007',
    ...proxyOptions,
  }))

  // Notification Service
  app.use('/api/v1/notifications', createProxyMiddleware({
    target: process.env.NOTIFICATION_SERVICE_URL || 'http://localhost:3008',
    ...proxyOptions,
  }))

  // Export Service
  app.use('/api/v1/exports', createProxyMiddleware({
    target: process.env.EXPORT_SERVICE_URL || 'http://localhost:3009',
    ...proxyOptions,
  }))

  // Audit Service
  app.use('/api/v1/audit', createProxyMiddleware({
    target: process.env.AUDIT_SERVICE_URL || 'http://localhost:3010',
    ...proxyOptions,
  }))
}
