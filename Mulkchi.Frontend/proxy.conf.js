const backendTarget = process.env.API_PROXY_TARGET || 'http://localhost:5009';

module.exports = {
  '/api': {
    target: backendTarget,
    secure: false,
    changeOrigin: true,
    logLevel: 'warn',
  },
  '/hubs': {
    target: backendTarget,
    secure: false,
    changeOrigin: true,
    ws: true,
    logLevel: 'warn',
  },
  '/avatars': {
    target: backendTarget,
    secure: false,
    changeOrigin: true,
    logLevel: 'warn',
  },
  '/uploads': {
    target: backendTarget,
    secure: false,
    changeOrigin: true,
    logLevel: 'warn',
  },
};
