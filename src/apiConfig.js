// src/apiConfig.js
const api = window.env?.REACT_APP_API_URL || process.env?.REACT_APP_API_URL || "https://untrumpeted-sallie-shallowly.ngrok-free.dev/";

export default api;
