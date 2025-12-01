const origin = window.location.origin;          // https://44.219.174.212
const wsOrigin = origin.replace('http', 'ws');  // wss://44.219.174.212

export const environment = {
  production: true,
  API_URL: '/api',
  signalingUrl: wsOrigin,                       // 👈 sin /socket.io
};