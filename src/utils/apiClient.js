// src/utils/apiClient.js

const BASE_URL = "https://api.codingboss.in/";

const apiClient = async (
  endpoint,
  method = "GET",
  body = null,
  customHeaders = {}
) => {
  // Clean endpoint
  const cleanEndpoint = endpoint.replace(/^\/+/, "");
  const url = `${BASE_URL.replace(/\/$/, "")}/${cleanEndpoint}`;

  // Automatically grab the token no matter what you named it
  const token = 
    localStorage.getItem("token") || 
    localStorage.getItem("user_token") || 
    localStorage.getItem("access_token");

  // Headers
  const headers = {
    Accept: "application/json",
    "Content-Type": "application/json",
    "ngrok-skip-browser-warning": "true",
    ...customHeaders,
  };

  // Attach token automatically
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const options = {
    method,
    headers,
  };

  if (body && method !== "GET") {
    if (typeof body === "string") {
      options.body = body;
    } else {
      options.body = JSON.stringify(body);
    }
  }

  try {
    const response = await fetch(url, options);

    if (response.status === 401) {
      localStorage.clear();
      window.location.href = "/#/LoginPage";
      return;
    }

    const contentType = response.headers.get("content-type");
    const isJson = contentType?.includes("application/json");
    const data = isJson ? await response.json() : null;

    if (!response.ok) {
      const errorMsg =
        data?.message ||
        data?.detail ||
        `Request failed (${response.status})`;
      throw new Error(errorMsg);
    }

    return data;
  } catch (error) {
    console.error("API Error:", { url, method, message: error.message });
    throw error;
  }
};

export default apiClient;