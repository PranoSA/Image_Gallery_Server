const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');

const app = express();

// Proxy /api/v1 requests to the Express server running on port 5000
app.use(
  '/api/v1',
  createProxyMiddleware({
    target: 'http://localhost:5000',
    changeOrigin: true,
    pathRewrite: {
      '^/api/v1': '/api/v1', // Keep the /api/v1 prefix
    },
  })
);

// Proxy all other requests to the Next.js app running on port 3000
app.use(
  '*',
  createProxyMiddleware({
    target: 'http://localhost:3000',
    changeOrigin: true,
  })
);

const PORT = 8080;
app.listen(PORT, () => {
  console.log(`Reverse proxy server is running on http://localhost:${PORT}`);
});
