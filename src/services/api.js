// TurismoTrack API Client Service

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

/**
 * Fetch LGUs from MongoDB backend API
 * Returns null if server is unreachable so frontend can use fallback data
 */
export async function fetchLGUs(params = {}) {
  try {
    const query = new URLSearchParams();
    if (params.district && params.district !== "All") query.append("district", params.district);
    if (params.search) query.append("search", params.search);
    if (params.sort) query.append("sort", params.sort);

    const res = await fetch(`${API_BASE_URL}/lgus?${query.toString()}`, {
      signal: AbortSignal.timeout(3000),
    });

    if (!res.ok) throw new Error(`HTTP Error: ${res.status}`);
    const data = await res.json();
    return Array.isArray(data) && data.length > 0 ? data : null;
  } catch {
    // Graceful fallback when backend / MongoDB is not active
    return null;
  }
}

/**
 * Fetch Establishments from MongoDB backend API
 * Returns null if server is unreachable so frontend can use fallback data
 */
export async function fetchEstablishments(params = {}) {
  try {
    const query = new URLSearchParams();
    if (params.category && params.category !== "All") query.append("category", params.category);
    if (params.district && params.district !== "All") query.append("district", params.district);
    if (params.search) query.append("search", params.search);
    if (params.sort) query.append("sort", params.sort);

    const res = await fetch(`${API_BASE_URL}/establishments?${query.toString()}`, {
      signal: AbortSignal.timeout(3000),
    });

    if (!res.ok) throw new Error(`HTTP Error: ${res.status}`);
    const data = await res.json();
    return Array.isArray(data) && data.length > 0 ? data : null;
  } catch {
    // Graceful fallback when backend / MongoDB is not active
    return null;
  }
}

/**
 * Check backend health status
 */
export async function checkServerHealth() {
  try {
    const res = await fetch(`${API_BASE_URL}/health`, {
      signal: AbortSignal.timeout(2000),
    });
    return res.ok;
  } catch {
    return false;
  }
}
