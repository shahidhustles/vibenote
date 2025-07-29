/**
 * API endpoint configuration for external services
 * Change these values when deploying to production
 */

// Python ingest API configuration
export const PYTHON_API = {
  baseUrl: process.env.NEXT_PUBLIC_PYTHON_API_URL || "http://127.0.0.1:5001",
  endpoints: {
    ingest: "/api/v1/ingest",
    retrieval: "/api/v1/retrieval",
  },
};

/**
 * Get the full URL for a Python API endpoint
 */
export function getPythonApiUrl(
  endpoint: keyof typeof PYTHON_API.endpoints
): string {
  return `${PYTHON_API.baseUrl}${PYTHON_API.endpoints[endpoint]}`;
}
