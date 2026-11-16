import React, { useState, useEffect, useCallback } from "react";
import { ShieldCheck, CheckCircle2, XCircle, RefreshCw, Building2, MapPin, Mail, Calendar } from "lucide-react";
import { API_BASE_URL } from "../services/api";

const DEFAULT_ACTIVE_EMAILS = [
  "tourism@bayombong.gov.ph",
  "bayombongtourism@gmail.com",
  "bayombong@gmail.com"
];

export default function LGUApprovals({ user, onRefreshCount }) {
  const [pendingList, setPendingList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoadingId, setActionLoadingId] = useState(null);
  const [toast, setToast] = useState(null);

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(null), 4000);
  };

  const fetchPending = useCallback(async (isSilent = false) => {
    if (!isSilent) setLoading(true);
    try {
      let list = [];
      // 1. Try dedicated pending approvals endpoint
      try {
        const res = await fetch(`${API_BASE_URL}/auth/pending-approvals?role=Provincial&_t=${Date.now()}`);
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data.pendingMunicipals) && data.pendingMunicipals.length > 0) {
            list = data.pendingMunicipals;
          }
        }
      } catch (e) {}

      // 2. Fetch all municipal accounts from users endpoint
      try {
        const usersRes = await fetch(`${API_BASE_URL}/users?_t=${Date.now()}`);
        if (usersRes.ok) {
          const allUsers = await usersRes.json();
          const raw = Array.isArray(allUsers) ? allUsers : (Array.isArray(allUsers?.data) ? allUsers.data : []);
          raw.forEach((u) => {
            const role = String(u.role || "").toLowerCase();
            const estType = String(u.establishmentType || "").toLowerCase();
            const isMuni = role.includes("municipality") || role.includes("muni") || estType.includes("municipal");
            const uEmail = String(u.email || "").toLowerCase().trim();
            const status = String(u.status || "").toLowerCase();
            const verif = String(u.verificationStatus || "").toLowerCase();

            // Account is pending if explicitly pending OR newly registered municipal account not in default baseline list
            const isPending = status === "pending" || verif === "pending" || u.isRegistered === false || !DEFAULT_ACTIVE_EMAILS.includes(uEmail);

            if (isMuni && isPending) {
              const alreadyInList = list.some(l => (l.email || "").toLowerCase() === uEmail || String(l._id || l.id) === String(u._id || u.id));
              if (!alreadyInList) {
                const detectedMuni = u.municipality || (u.name && u.name.replace(/Municipal|Tourism|Office/gi, '').trim()) || 'Municipal';
                list.push({
                  _id: u._id || u.id || `muni_${Date.now()}`,
                  id: u.id || u._id,
                  name: u.name || u.officeName || `${detectedMuni} Municipal Tourism Office`,
                  officeName: u.officeName || u.name || `${detectedMuni} Municipal Tourism Office`,
                  municipality: detectedMuni,
                  email: u.email,
                  role: u.role || 'Municipality Admin',
                  status: 'pending',
                  createdAt: u.createdAt || new Date().toISOString(),
                });
              }
            }
          });
        }
      } catch (e) {}

      // 3. Incorporate locally recorded pending registrations
      try {
        const storedPending = JSON.parse(localStorage.getItem("turismotrack_pending_munis") || "[]");
        storedPending.forEach((sp) => {
          const spEmail = (sp.email || "").toLowerCase().trim();
          const alreadyInList = list.some((l) => (l.email || "").toLowerCase() === spEmail);
          if (!alreadyInList) {
            list.push({
              _id: sp._id || `muni_${Date.now()}`,
              id: sp.id || sp._id,
              name: sp.name || sp.officeName || `${sp.municipality} Municipal Tourism Office`,
              officeName: sp.officeName || sp.name || `${sp.municipality} Municipal Tourism Office`,
              municipality: sp.municipality,
              email: sp.email,
              role: sp.role || "Municipality Admin",
              status: "pending",
              createdAt: sp.createdAt || new Date().toISOString(),
            });
          }
        });
      } catch (e) {}

      // 4. Filter out accounts that have already been approved or rejected by PTCO
      const approvedAccounts = (() => {
        try {
          return JSON.parse(localStorage.getItem("turismotrack_approved_accounts") || "[]");
        } catch { return []; }
      })();

      const approvedMunis = (() => {
        try {
          return JSON.parse(localStorage.getItem("turismotrack_approved_munis") || "[]");
        } catch { return []; }
      })();

      const rejectedAccounts = (() => {
        try {
          return JSON.parse(localStorage.getItem("turismotrack_rejected_accounts") || "[]");
        } catch { return []; }
      })();

      list = list.filter(item => {
        const email = (item.email || "").toLowerCase().trim();
        const id = String(item._id || item.id || "");
        const muni = String(item.municipality || "").toLowerCase().trim();
        const status = String(item.status || "").toLowerCase();
        const verif = String(item.verificationStatus || "").toLowerCase();

        // Baseline active accounts are never pending
        if (DEFAULT_ACTIVE_EMAILS.includes(email)) return false;

        const isApproved = approvedAccounts.includes(email) ||
                           approvedAccounts.includes(id) ||
                           (muni && approvedMunis.some(m => String(m).toLowerCase().trim() === muni)) ||
                           verif === "approved";
        const isRejected = rejectedAccounts.includes(email) ||
                           rejectedAccounts.includes(id) ||
                           status === "rejected" ||
                           verif === "rejected";

        return !isApproved && !isRejected;
      });

      setPendingList(list);
      if (onRefreshCount) onRefreshCount(list.length);
    } catch (err) {
      console.error("Failed to fetch pending municipal accounts:", err);
    } finally {
      if (!isSilent) setLoading(false);
    }
  }, [onRefreshCount]);

  useEffect(() => {
    fetchPending(false);
    let ch = null;
    if (typeof window !== "undefined" && "BroadcastChannel" in window) {
      try {
        ch = new BroadcastChannel("turismotrack_realtime");
        ch.onmessage = (event) => {
          if (event.data?.type?.includes("municipal") || event.data?.type?.includes("user") || event.data?.type?.includes("lgu")) {
            fetchPending(true);
          }
        };
      } catch {}
    }

    // Refresh immediately whenever admin switches tabs or window gains focus
    const onFocus = () => fetchPending(true);
    const onVisibilityChange = () => {
      if (document.visibilityState === "visible") fetchPending(true);
    };
    window.addEventListener("focus", onFocus);
    document.addEventListener("visibilitychange", onVisibilityChange);

    // Fast polling every 4 seconds to catch new registrations in real time
    const interval = setInterval(() => fetchPending(true), 4000);
    return () => {
      if (ch) ch.close();
      window.removeEventListener("focus", onFocus);
      document.removeEventListener("visibilitychange", onVisibilityChange);
      clearInterval(interval);
    };
  }, [fetchPending]);

  const handleApprove = async (id, muniName, email) => {
    if (!window.confirm(`Aprubahan at i-activate ang Municipal Tourism Office ng "${muniName}"? Magkakaroon na sila ng access sa Municipal Portal.`)) return;
    setActionLoadingId(id);
    try {
      fetch(`${API_BASE_URL}/auth/approve-municipal/${id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ approvedBy: user?.name || "Provincial Tourism Officer (PTCO)", email }),
      }).catch(() => {});

      try {
        const approved = JSON.parse(localStorage.getItem("turismotrack_approved_accounts") || "[]");
        if (email && !approved.includes(email.toLowerCase().trim())) approved.push(email.toLowerCase().trim());
        if (id && !approved.includes(String(id))) approved.push(String(id));
        localStorage.setItem("turismotrack_approved_accounts", JSON.stringify(approved));

        const approvedMunis = JSON.parse(localStorage.getItem("turismotrack_approved_munis") || "[]");
        if (muniName && !approvedMunis.includes(muniName)) approvedMunis.push(muniName);
        localStorage.setItem("turismotrack_approved_munis", JSON.stringify(approvedMunis));
      } catch (e) {}

      const updated = pendingList.filter(p => p._id !== id && p.id !== id && (email ? (p.email || "").toLowerCase() !== email.toLowerCase() : true));
      setPendingList(updated);
      if (onRefreshCount) onRefreshCount(updated.length);

      showToast(`✅ Naaprubahan na ang Munisipalidad ng ${muniName}! Maaari na silang mag-log in.`);
      window.dispatchEvent(new CustomEvent("tt-muni-approved", { detail: { municipality: muniName, email } }));
    } catch {
      showToast("❌ Network error habang nag-aapruba.");
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleReject = async (id, muniName, email) => {
    if (!window.confirm(`Sigurado ka bang tatanggihan ang registration ng Munisipalidad ng "${muniName}"?`)) return;
    setActionLoadingId(id);
    try {
      fetch(`${API_BASE_URL}/auth/reject-municipal/${id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, municipality: muniName }),
      }).catch(() => {});

      try {
        const rejected = JSON.parse(localStorage.getItem("turismotrack_rejected_accounts") || "[]");
        if (email && !rejected.includes(email.toLowerCase().trim())) rejected.push(email.toLowerCase().trim());
        if (id && !rejected.includes(String(id))) rejected.push(String(id));
        localStorage.setItem("turismotrack_rejected_accounts", JSON.stringify(rejected));
      } catch (e) {}

      const updated = pendingList.filter(p => p._id !== id && p.id !== id && (email ? (p.email || "").toLowerCase() !== email.toLowerCase() : true));
      setPendingList(updated);
      if (onRefreshCount) onRefreshCount(updated.length);

      showToast(`ℹ️ Tinanggihan ang account para sa ${muniName}.`);

      if (typeof window !== "undefined" && "BroadcastChannel" in window) {
        try {
          const ch = new BroadcastChannel("turismotrack_realtime");
          ch.postMessage({ type: "municipal:rejected", email, id, municipality: muniName });
          ch.close();
        } catch {}
      }
    } catch {
      showToast("❌ Network error habang nagre-reject.");
    } finally {
      setActionLoadingId(null);
    }
  };

  return (
    <div style={{ padding: "24px", maxWidth: "1200px", margin: "0 auto" }}>
      {toast && (
        <div style={{
          position: "fixed",
          top: "24px",
          right: "24px",
          zIndex: 9999,
          background: "#1e293b",
          color: "#fff",
          padding: "12px 20px",
          borderRadius: "10px",
          boxShadow: "0 8px 24px rgba(0,0,0,0.2)",
          fontSize: "14px",
          fontWeight: 600,
          border: "1px solid rgba(255,255,255,0.1)"
        }}>
          {toast}
        </div>
      )}

      {/* Header Banner */}
      <div style={{
        background: "linear-gradient(135deg, #064e3b 0%, #065f46 50%, #047857 100%)",
        color: "#fff",
        borderRadius: "16px",
        padding: "24px 28px",
        marginBottom: "24px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        boxShadow: "0 8px 24px rgba(6, 78, 59, 0.18)",
        flexWrap: "wrap",
        gap: "16px"
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
          <div style={{
            width: "52px",
            height: "52px",
            borderRadius: "12px",
            background: "rgba(255, 255, 255, 0.15)",
            border: "1px solid rgba(255, 255, 255, 0.3)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "#fff"
          }}>
            <ShieldCheck size={28} />
          </div>
          <div>
            <h1 style={{ margin: 0, fontSize: "22px", fontWeight: 800, letterSpacing: "-0.02em" }}>
              LGU Account Approvals (PTCO)
            </h1>
            <p style={{ margin: "4px 0 0", fontSize: "13px", color: "#a7f3d0" }}>
              Pagsusuri at pag-apruba ng Provincial Tourism Office para sa mga bagong rehistradong Municipal Tourism Offices.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => fetchPending(false)}
          style={{
            padding: "8px 16px",
            borderRadius: "8px",
            background: "rgba(255,255,255,0.15)",
            border: "1px solid rgba(255,255,255,0.3)",
            color: "#fff",
            fontSize: "13px",
            fontWeight: 600,
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            gap: "6px"
          }}
        >
          <RefreshCw size={14} />
          Refresh List
        </button>
      </div>

      {/* Content */}
      {loading ? (
        <div style={{ textAlign: "center", padding: "60px 20px", color: "#64748b" }}>
          <div style={{ fontSize: "15px", fontWeight: 600 }}>Kinukuha ang mga nakabinbing LGU accounts...</div>
        </div>
      ) : pendingList.length === 0 ? (
        <div style={{
          background: "#fff",
          borderRadius: "16px",
          border: "1px solid #e2e8f0",
          padding: "60px 24px",
          textAlign: "center",
          boxShadow: "0 2px 10px rgba(0,0,0,0.02)"
        }}>
          <div style={{
            width: "56px",
            height: "56px",
            borderRadius: "50%",
            background: "#ecfdf5",
            color: "#059669",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            margin: "0 auto 16px"
          }}>
            <CheckCircle2 size={32} />
          </div>
          <h3 style={{ margin: "0 0 6px", fontSize: "17px", fontWeight: 700, color: "#1e293b" }}>
            Walang Nakabinbing Munisipalidad
          </h3>
          <p style={{ margin: 0, fontSize: "14px", color: "#64748b", maxWidth: "480px", marginInline: "auto" }}>
            Lahat ng 15 munisipalidad sa Lalawigan ng Nueva Vizcaya ay maayos na beripikado at aktibo sa sistema.
          </p>
        </div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(360px, 1fr))", gap: "16px" }}>
          {pendingList.map((item) => {
            const isProcessing = actionLoadingId === item._id;
            return (
              <div
                key={item._id}
                style={{
                  background: "#fff",
                  borderRadius: "14px",
                  border: "1px solid #e2e8f0",
                  padding: "20px",
                  boxShadow: "0 4px 12px rgba(0,0,0,0.03)",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "space-between",
                  gap: "16px"
                }}
              >
                <div>
                  <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "10px", marginBottom: "8px" }}>
                    <h3 style={{ margin: 0, fontSize: "16px", fontWeight: 700, color: "#0f172a" }}>
                      {item.officeName || item.name}
                    </h3>
                    <span style={{
                      padding: "3px 8px",
                      borderRadius: "12px",
                      fontSize: "11px",
                      fontWeight: 700,
                      background: "#fef3c7",
                      color: "#92400e",
                      whiteSpace: "nowrap"
                    }}>
                      ⏳ For PTCO Verification
                    </span>
                  </div>

                  <div style={{ display: "flex", flexDirection: "column", gap: "6px", fontSize: "13px", color: "#475569", marginTop: "12px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                      <MapPin size={16} color="#059669" />
                      <strong>Munisipalidad:</strong>
                      <span>{item.municipality}</span>
                    </div>
                    {item.email && (
                      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                        <Mail size={16} color="#059669" />
                        <strong>Email:</strong>
                        <span>{item.email}</span>
                      </div>
                    )}
                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                      <Building2 size={16} color="#059669" />
                      <strong>Role:</strong>
                      <span>{item.role || "Municipality Admin"}</span>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "11px", color: "#94a3b8", marginTop: "4px" }}>
                      <Calendar size={14} />
                      <span>Rehistro: {item.createdAt ? new Date(item.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : "Kamakailan"}</span>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div style={{
                  display: "flex",
                  gap: "10px",
                  borderTop: "1px solid #f1f5f9",
                  paddingTop: "14px"
                }}>
                  <button
                    type="button"
                    disabled={isProcessing}
                    onClick={() => handleApprove(item._id || item.id, item.municipality, item.email)}
                    style={{
                      flex: 1,
                      padding: "9px 14px",
                      borderRadius: "8px",
                      background: "#059669",
                      border: "none",
                      color: "#fff",
                      fontSize: "13px",
                      fontWeight: 700,
                      cursor: isProcessing ? "not-allowed" : "pointer",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: "6px",
                      boxShadow: "0 2px 6px rgba(5, 150, 105, 0.3)"
                    }}
                  >
                    <CheckCircle2 size={16} />
                    {isProcessing ? "Processing..." : "Verify & Activate LGU"}
                  </button>

                  <button
                    type="button"
                    disabled={isProcessing}
                    onClick={() => handleReject(item._id || item.id, item.municipality, item.email)}
                    style={{
                      padding: "9px 14px",
                      borderRadius: "8px",
                      background: "#fff",
                      border: "1px solid #fca5a5",
                      color: "#ef4444",
                      fontSize: "13px",
                      fontWeight: 600,
                      cursor: isProcessing ? "not-allowed" : "pointer",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: "4px"
                    }}
                  >
                    <XCircle size={16} />
                    Reject
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

