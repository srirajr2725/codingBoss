// utils/apiClient.js

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

  // Get token
  const token = localStorage.getItem("token");

  // Headers
  const headers = {
    Accept: "application/json",
    "Content-Type": "application/json",
    "ngrok-skip-browser-warning": "true",
    ...customHeaders,
  };

  // Attach token
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const options = {
    method,
    headers,
  };

  // ✅ IMPORTANT: Only stringify if body is OBJECT
  if (body && method !== "GET") {

    if (typeof body === "string") {
      // Already JSON → send directly
      options.body = body;
    } else {
      // Convert object → JSON
      options.body = JSON.stringify(body);
    }

  }

  try {

    const response = await fetch(url, options);

    // Unauthorized
    if (response.status === 401) {
      localStorage.clear();
      window.location.href = "/LoginPage";
      return;
    }

    // Read response
    const contentType = response.headers.get("content-type");
    const isJson = contentType?.includes("application/json");

    const data = isJson ? await response.json() : null;

    // Error handling
    if (!response.ok) {

      const errorMsg =
        data?.message ||
        data?.detail ||
        `Request failed (${response.status})`;

      throw new Error(errorMsg);
    }

    return data;

  } catch (error) {

    console.error("API Error:", {
      url,
      method,
      message: error.message,
    });

    throw error;
  }
};

export default apiClient;
