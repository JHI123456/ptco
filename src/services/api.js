// TurismoTrack API Client Service

const API_BASE_URL = import.meta.env.VITE_API_URL || "/api";

/**
 * Fetch LGUs from MongoDB backend API
 * Returns empty array if none registered or server is unreachable
 */
export async function fetchLGUs(params = {}) {
  try {
    const query = new URLSearchParams();
    if (params.district && params.district !== "All") query.append("district", params.district);
    if (params.search) query.append("search", params.search);
    if (params.sort) query.append("sort", params.sort);

    const res = await fetch(`${API_BASE_URL}/lgus?${query.toString()}`, {
      signal: AbortSignal.timeout(4000),
    });

    if (!res.ok) throw new Error(`HTTP Error: ${res.status}`);
    const resData = await res.json();
    const items = Array.isArray(resData) ? resData : (Array.isArray(resData?.data) ? resData.data : []);
    return items;
  } catch (err) {
    console.warn("fetchLGUs error:", err.message);
    return [];
  }
}

/**
 * Fetch Establishments from MongoDB backend API
 * Returns empty array if none registered or server is unreachable
 */
export async function fetchEstablishments(params = {}) {
  try {
    const query = new URLSearchParams();
    if (params.category && params.category !== "All") query.append("category", params.category);
    if (params.district && params.district !== "All") query.append("district", params.district);
    if (params.search) query.append("search", params.search);
    if (params.sort) query.append("sort", params.sort);

    const res = await fetch(`${API_BASE_URL}/establishments?${query.toString()}`, {
      signal: AbortSignal.timeout(4000),
    });

    if (!res.ok) throw new Error(`HTTP Error: ${res.status}`);
    const resData = await res.json();
    const items = Array.isArray(resData) ? resData : (Array.isArray(resData?.data) ? resData.data : []);
    return items;
  } catch (err) {
    console.warn("fetchEstablishments error:", err.message);
    return [];
  }
}

/**
 * Fetch Registered Municipal Tourism Personnel/Officers from backend
 */
export async function fetchUsers(_params = {}) {
  try {
    const res = await fetch(`${API_BASE_URL}/users`, {
      signal: AbortSignal.timeout(4000),
    });

    if (!res.ok) throw new Error(`HTTP Error: ${res.status}`);
    const resData = await res.json();
    const items = Array.isArray(resData) ? resData : (Array.isArray(resData?.data) ? resData.data : []);
    return items;
  } catch (err) {
    console.warn("fetchUsers error:", err.message);
    return [];
  }
}

/**
 * Fetch dynamic Monthly Visitor Analytics aggregated across submissions & establishments
 */
export async function fetchVisitorAnalytics(params = {}) {
  try {
    const query = new URLSearchParams();
    if (params.year) query.append("year", params.year);

    const res = await fetch(`${API_BASE_URL}/reports/visitor-analytics?${query.toString()}`, {
      signal: AbortSignal.timeout(4000),
    });

    if (!res.ok) throw new Error(`HTTP Error: ${res.status}`);
    const resData = await res.json();
    return resData;
  } catch (err) {
    console.warn("fetchVisitorAnalytics error:", err.message);
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
