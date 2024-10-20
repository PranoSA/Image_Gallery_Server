"use strict";

var express = require('express');

var _require = require('http-proxy-middleware'),
    createProxyMiddleware = _require.createProxyMiddleware;

var app = express(); // Proxy /api/v1 requests to the Express server running on port 5000

app.use('/api/v1', createProxyMiddleware({
  target: 'http://localhost:5000',
  changeOrigin: true,
  pathRewrite: {
    '^/api/v1': '/api/v1' // Keep the /api/v1 prefix

  }
})); // Proxy all other requests to the Next.js app running on port 3000

app.use('*', createProxyMiddleware({
  target: 'http://localhost:3000',
  changeOrigin: true
}));
var PORT = 8080;
app.listen(PORT, function () {
  console.log("Reverse proxy server is running on http://localhost:".concat(PORT));
});