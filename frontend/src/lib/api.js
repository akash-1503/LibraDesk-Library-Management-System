
const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

export async function apiRequest(path, options = {}) {
  let response;

  try {
    response = await fetch(`${API_BASE_URL}${path}`, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...options.headers,
      },
      cache: "no-store",
    });
  } catch {
    throw new Error(
      "Cannot connect to the backend. Check that the API server is running."
    );
  }

const contentType = response.headers.get("content-type") || "";
const result = contentType.includes("application/json")
  ? await response.json().catch(() => null)
  : null;

  if (!response.ok || result?.success === false) {
    throw new Error(
      result?.message || `Request failed with status ${response.status}.`
    );
  }

  return result;
}
