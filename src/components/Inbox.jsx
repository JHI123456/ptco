import React, { useState, useMemo } from 'react';
import { API_BASE_URL } from '../services/api';
import {
  Search,
  Plus,
  RotateCw,
  Eye,
  Edit3,
  Check,
  X,
  Trash2,
  Lock,
  Send,
  AlertCircle,
  CheckCircle2,
} from 'lucide-react';
import './Inbox.css';
import OfficialFormViewer from './OfficialFormViewer';

// Initial sample data representing municipal submissions across Nueva Vizcaya
const INITIAL_SAMPLE_MESSAGES = [];

export default function Inbox({ user: _user }) {
  const currentRole = (_user?.role || '').toLowerCase().includes('staff') ? 'staff' : 'admin';
  // Messages state (starts empty or with items)
  const [messages, setMessages] = useState(() => {
    try {
      const saved = localStorage.getItem('turismotrack_inbox_items');
      if (saved) return JSON.parse(saved);
    } catch {}
    // Default to empty array to match the user's reference screenshot initially!
    return [];
  });

  // Live API Inbox Sync with Backend
  const fetchLiveInbox = React.useCallback(async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/inbox`, {
        headers: {
          'x-user-role': 'provincial',
          'x-user-municipality': 'all',
        },
      });
      if (res.ok) {
        const json = await res.json();
        const rawItems = Array.isArray(json?.data) ? json.data : (Array.isArray(json) ? json : []);
        // Provincial Office ONLY sees official consolidated municipal reports (e.g. VAR 2, municipal filings)
        // Individual accommodation filings (Form A, DAE-1A, DAE-3B2, CUS, DOT, Holiday) are for the Municipality ONLY!
        const items = rawItems.filter((s) => {
          const fType = String(s.formType || '').toUpperCase();
          const senderRole = String(s.senderRole || '').toLowerCase();
          const sender = String(s.sender || s.establishmentName || s.senderName || '').toLowerCase();

          const isEstForm = [
            'FORM A', 'DAE 1A', 'DAE 3B2', 'DAE 3B.2', 'DAE 2', 'DAE 4A', 'DOT', 'CUS', 'HOLIDAY', 'CHECK-IN', 'CHECKIN'
          ].some((x) => fType.includes(x));
          if (isEstForm) return false;
          if ((senderRole.includes('accommodation') || senderRole.includes('manager')) && !fType.includes('VAR 2') && !fType.includes('REPORT')) return false;

          const isReport = fType.includes('VAR 2') || fType.includes('REPORT') || s.type === 'report' || s.category === 'report' || String(s.status || '').toLowerCase().includes('province');
          const isFromMuni = sender.includes('municipal') || sender.includes('lgu') || sender.includes('ptco') || s.category === 'broadcast' || s.type === 'broadcast';
          return isReport || isFromMuni;
        });

        if (items.length > 0) {
          const normalized = items.map((s) => ({
            id: s._id || s.id,
            subject: s.subject || `${s.formType || 'Submission'}: ${s.establishmentName || s.sender || 'Municipal Submission'}`,
            body: s.body || `Official submission for ${s.formType || 'Tourism compliance'} from ${s.municipality || s.municipalityId}. Recorded ${s.visitors || 0} visitors.`,
            sender: s.sender || s.establishmentName || `${s.municipality || 'Municipal'} Tourism Office`,
            municipality: s.municipality || s.municipalityId || '',
            formType: s.formType || 'VAR 2',
            category: 'submission',
            status: (s.status || 'pending').toLowerCase().replace(/\s+/g, '-'),
            date: s.submittedAt ? new Date(s.submittedAt).toLocaleString() : new Date().toLocaleString(),
            unread: s.isRead === false,
            isLocked: s.isLocked || false,
            details: {
              totalVisitors: s.visitors || s.formData?.grandTotal || 0,
              domesticGuests: s.formData?.localVisitors || 0,
              foreignGuests: s.formData?.foreignVisitors || 0,
              reportingPeriod: s.formData?.monthYear || s.formData?.reportingPeriod || 'Sep-26',
              complianceScore: '100%',
            },
            formData: s.formData,
          }));
          setMessages((prev) => {
            const combined = [...normalized];
            prev.forEach((p) => {
              if (!combined.some((c) => c.id === p.id || c.subject === p.subject)) {
                combined.push(p);
              }
            });
            try {
              localStorage.setItem('turismotrack_inbox_items', JSON.stringify(combined));
            } catch {}
            return combined;
          });
        } else {
          setMessages([]);
          try {
            localStorage.removeItem('turismotrack_inbox_items');
          } catch {}
        }
      }
    } catch (e) {
      console.warn('Could not fetch live inbox:', e);
    }
  }, []);

  React.useEffect(() => {
    fetchLiveInbox();

    // Auto-polling every 4 seconds for municipal submissions
    const interval = setInterval(fetchLiveInbox, 4000);

    // Cross-tab / cross-window realtime BroadcastChannel listener
    let channel = null;
    if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
      try {
        channel = new BroadcastChannel('turismotrack_realtime');
        channel.onmessage = (event) => {
          const type = event.data?.type;
          if (
            type === 'inbox:new' ||
            type === 'submission:new' ||
            type === 'data:updated' ||
            type === 'visitors:updated'
          ) {
            fetchLiveInbox();
          }
        };
      } catch {}
    }

    return () => {
      clearInterval(interval);
      if (channel) channel.close();
    };
  }, [fetchLiveInbox]);

  React.useEffect(() => {
    const handleStorageChange = (e) => {
      if (e.key === 'turismotrack_inbox_items' && e.newValue) {
        try {
          setMessages(JSON.parse(e.newValue));
        } catch {}
      }
    };
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const [activeTab, setActiveTab] = useState('all'); // all | submissions | needs-revision | pending | approved | broadcast | drafts
  const [searchQuery, setSearchQuery] = useState('');
  const [formTypeFilter, setFormTypeFilter] = useState('All');
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Modals state
  const [selectedItem, setSelectedItem] = useState(null);
  const [composeOpen, setComposeOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [toastMessage, setToastMessage] = useState('');

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 3500);
  };

  // Sync to local storage
  const updateMessages = (newMessages) => {
    setMessages(newMessages);
    try {
      localStorage.setItem('turismotrack_inbox_items', JSON.stringify(newMessages));
    } catch {}
  };

  // Populate or Clear helper
  const handleLoadSamples = () => {
    updateMessages(INITIAL_SAMPLE_MESSAGES);
    showToast('Loaded sample municipal filings & dispatches.');
  };

  const handleClearAll = () => {
    updateMessages([]);
    showToast('Cleared inbox to empty state.');
  };

  // Refresh trigger with smooth rotation
  const handleRefresh = () => {
    setIsRefreshing(true);
    fetchLiveInbox()
      .catch(() => {})
      .finally(() => {
        setTimeout(() => {
          setIsRefreshing(false);
          showToast('Inbox synced with municipal servers.');
        }, 400);
      });
  };

  // Counts for tabs
  const tabCounts = useMemo(() => {
    return {
      all: messages.length,
      submissions: messages.filter((m) => m.category === 'submission').length,
      needsRevision: messages.filter((m) => m.status === 'needs-revision').length,
      pending: messages.filter((m) => m.status === 'pending').length,
      approved: messages.filter((m) => m.status === 'approved').length,
      broadcast: messages.filter((m) => m.category === 'broadcast' || m.formType === 'Broadcast').length,
      drafts: messages.filter((m) => m.status === 'draft').length,
    };
  }, [messages]);

  // Filtered message list
  const filteredMessages = useMemo(() => {
    return messages.filter((item) => {
      // Tab filter
      if (activeTab === 'submissions' && item.category !== 'submission') return false;
      if (activeTab === 'needs-revision' && item.status !== 'needs-revision') return false;
      if (activeTab === 'pending' && item.status !== 'pending') return false;
      if (activeTab === 'approved' && item.status !== 'approved') return false;
      if (activeTab === 'broadcast' && item.category !== 'broadcast' && item.formType !== 'Broadcast') return false;
      if (activeTab === 'drafts' && item.status !== 'draft') return false;

      // Form type dropdown
      if (formTypeFilter !== 'All' && item.formType !== formTypeFilter) return false;

      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesSubject = item.subject?.toLowerCase().includes(q);
        const matchesBody = item.body?.toLowerCase().includes(q);
        const matchesSender = item.sender?.toLowerCase().includes(q);
        const matchesType = item.formType?.toLowerCase().includes(q);
        const matchesMun = item.municipality?.toLowerCase().includes(q);
        if (!matchesSubject && !matchesBody && !matchesSender && !matchesType && !matchesMun) {
          return false;
        }
      }

      return true;
    });
  }, [messages, activeTab, formTypeFilter, searchQuery]);

  // Actions
  const handleApprove = (id, e) => {
    if (e) e.stopPropagation();
    const updated = messages.map((m) =>
      m.id === id ? { ...m, status: 'approved', isLocked: true, unread: false } : m
    );
    updateMessages(updated);
    showToast('Submission approved & locked for official records.');
    if (selectedItem?.id === id) {
      setSelectedItem((prev) => (prev ? { ...prev, status: 'approved', isLocked: true } : null));
    }
  };

  const handleReturnRevision = (id, e) => {
    if (e) e.stopPropagation();
    const reason = window.prompt(
      'Enter audit notes or required corrections for this filing:',
      'Please verify foreign visitor breakdowns and resubmit.'
    );
    if (reason === null) return;

    const updated = messages.map((m) =>
      m.id === id
        ? {
            ...m,
            status: 'needs-revision',
            revisionReason: reason,
            isLocked: false,
          }
        : m
    );
    updateMessages(updated);
    showToast('Filing returned to municipality for revision.');
    if (selectedItem?.id === id) {
      setSelectedItem((prev) => (prev ? { ...prev, status: 'needs-revision', revisionReason: reason } : null));
    }
  };

  const handleDelete = (id, e) => {
    if (e) e.stopPropagation();
    if (window.confirm('Are you sure you want to remove this filing record?')) {
      const updated = messages.filter((m) => m.id !== id);
      updateMessages(updated);
      showToast('Record deleted.');
      if (selectedItem?.id === id) setSelectedItem(null);
    }
  };

  const handleSaveEdit = (e) => {
    e.preventDefault();
    if (!editingItem) return;
    const updated = messages.map((m) =>
      m.id === editingItem.id
        ? {
            ...m,
            subject: editingItem.subject,
            body: editingItem.body,
            formType: editingItem.formType,
            lastEdited: new Date().toLocaleDateString(),
            editedBy: currentRole === 'admin' ? 'Municipality Admin' : 'Staff Member',
          }
        : m
    );
    updateMessages(updated);
    setEditingItem(null);
    showToast('Filing revisions saved.');
  };

  const handleSendCompose = (e) => {
    e.preventDefault();
    const form = e.target;
    const newMsg = {
      id: `msg-${Date.now()}`,
      subject: form.subject.value,
      body: form.body.value,
      sender: currentRole === 'admin' ? 'Provincial Tourism Officer (Admin)' : 'Tourism Staff Member',
      municipality: form.recipient.value,
      formType: form.formType.value || 'Direct Notice',
      category: form.recipient.value === 'All Municipalities' ? 'broadcast' : 'message',
      status: 'sent',
      date: new Date().toLocaleString(),
      unread: false,
      isLocked: false,
    };
    updateMessages([newMsg, ...messages]);
    setComposeOpen(false);
    showToast('Message dispatched successfully.');
  };

  const getFormBadgeClass = (type) => {
    switch (type) {
      case 'DOT Form':
        return 'dot';
      case 'CUS Form':
        return 'cus';
      case 'DAE 1A':
        return 'dae-1a';
      case 'DAE 4A':
        return 'dae-4a';
      case 'VAR 2':
      case 'VAR-2':
        return 'var-2';
      case 'Holiday':
      case 'Holiday Tracker':
        return 'holiday';
      default:
        return 'broadcast';
    }
  };

  return (
    <div className="tt-inbox-wrapper">
      {/* 1. TOP TOOLBAR: Search, Form Dropdown, New Message, Refresh */}
      <div className="tt-inbox-toolbar">
        <div className="tt-inbox-search-box">
          <span className="tt-inbox-search-icon">
            <Search size={16} />
          </span>
          <input
            type="text"
            className="tt-inbox-search-input"
            placeholder="Search subject, body, sender, form type..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div className="tt-inbox-toolbar-actions">
          <select
            className="tt-inbox-filter-select"
            value={formTypeFilter}
            onChange={(e) => setFormTypeFilter(e.target.value)}
          >
            <option value="All">All Form Types</option>
            <option value="DOT Form">DOT Form</option>
            <option value="CUS Form">CUS Form</option>
            <option value="DAE 1A">DAE 1A</option>
            <option value="DAE 4A">DAE 4A</option>
            <option value="Holiday Tracker">Holiday Tracker</option>
            <option value="Broadcast">Broadcast / Memos</option>
          </select>

          <button
            type="button"
            className="tt-inbox-btn-compose"
            onClick={() => setComposeOpen(true)}
          >
            <Plus size={16} />
            <span>New Message / Broadcast</span>
          </button>

          <button
            type="button"
            className={`tt-inbox-btn-refresh ${isRefreshing ? 'spinning' : ''}`}
            title="Refresh Inbox"
            onClick={handleRefresh}
          >
            <RotateCw size={16} />
          </button>
        </div>
      </div>

      {/* 3. CATEGORY FILTER TABS (PILLS) */}
      <div className="tt-inbox-tabs">
        <button
          type="button"
          className={`tt-inbox-tab-btn ${activeTab === 'all' ? 'active' : ''}`}
          onClick={() => setActiveTab('all')}
        >
          <span>All Items</span>
          <span className="tt-inbox-tab-badge">{tabCounts.all}</span>
        </button>

        <button
          type="button"
          className={`tt-inbox-tab-btn ${activeTab === 'submissions' ? 'active' : ''}`}
          onClick={() => setActiveTab('submissions')}
        >
          <span>Form Submissions</span>
          <span className="tt-inbox-tab-badge">{tabCounts.submissions}</span>
        </button>

        <button
          type="button"
          className={`tt-inbox-tab-btn ${activeTab === 'needs-revision' ? 'active' : ''}`}
          onClick={() => setActiveTab('needs-revision')}
        >
          <span>Needs Revision</span>
          <span className="tt-inbox-tab-badge">{tabCounts.needsRevision}</span>
        </button>

        <button
          type="button"
          className={`tt-inbox-tab-btn ${activeTab === 'pending' ? 'active' : ''}`}
          onClick={() => setActiveTab('pending')}
        >
          <span>Pending</span>
          <span className="tt-inbox-tab-badge">{tabCounts.pending}</span>
        </button>

        <button
          type="button"
          className={`tt-inbox-tab-btn ${activeTab === 'approved' ? 'active' : ''}`}
          onClick={() => setActiveTab('approved')}
        >
          <span>Approved (Locked)</span>
          <span className="tt-inbox-tab-badge">{tabCounts.approved}</span>
        </button>

        <button
          type="button"
          className={`tt-inbox-tab-btn ${activeTab === 'broadcast' ? 'active' : ''}`}
          onClick={() => setActiveTab('broadcast')}
        >
          <span>Direct & Broadcast</span>
          <span className="tt-inbox-tab-badge">{tabCounts.broadcast}</span>
        </button>

        <button
          type="button"
          className={`tt-inbox-tab-btn ${activeTab === 'drafts' ? 'active' : ''}`}
          onClick={() => setActiveTab('drafts')}
        >
          <span>Drafts</span>
          <span className="tt-inbox-tab-badge">{tabCounts.drafts}</span>
        </button>
      </div>

      {/* 4. MAIN CONTENT CARD */}
      <div className="tt-inbox-card">
        {filteredMessages.length === 0 ? (
          /* EXACT EMPTY STATE MATCHING SCREENSHOT */
          <div className="tt-inbox-empty-state">
            <div className="tt-inbox-empty-mailbox" aria-hidden="true">
              {/* Detailed 3D Mailbox SVG matching the reference image */}
              <svg width="68" height="68" viewBox="0 0 72 72" fill="none">
                {/* Mailbox Stand Base */}
                <path d="M34 50v14a2 2 0 0 0 4 0V50h-4Z" fill="#94a3b8" />
                {/* Main Blue Body */}
                <rect x="18" y="24" width="36" height="26" rx="13" fill="#2563eb" />
                <path d="M18 37h36v13H18V37Z" fill="#1d4ed8" />
                {/* Mail Opening & Letter */}
                <rect x="22" y="27" width="28" height="15" rx="3" fill="#f8fafc" />
                <path d="M22 28l14 8 14-8" stroke="#cbd5e1" strokeWidth="2" />
                <rect x="33" y="28" width="6" height="5" rx="1" fill="#ef4444" />
                {/* Red Flag */}
                <path d="M54 36v-12h10l-3 4 3 4H54" fill="#ef4444" />
                <circle cx="54" cy="36" r="3" fill="#b91c1c" />
              </svg>
            </div>
            <div className="tt-inbox-empty-text">No messages or submissions found</div>
            <div className="tt-inbox-empty-subtext">Your inbox is all caught up!</div>

            {/* QUICK CONTROLS TO TOGGLE DEMO DATA */}
            <div className="tt-inbox-demo-controls">
              <button
                type="button"
                className="tt-inbox-demo-btn primary"
                onClick={handleLoadSamples}
              >
                + Load Sample Filings & Dispatches
              </button>
            </div>
          </div>
        ) : (
          /* POPULATED TABLE VIEW */
          <div className="tt-inbox-table-container">
            <table className="tt-inbox-table">
              <thead>
                <tr>
                  <th style={{ width: '130px' }}>Form / Type</th>
                  <th>Subject & Summary</th>
                  <th style={{ width: '180px' }}>Origin</th>
                  <th style={{ width: '140px' }}>Status</th>
                  <th style={{ width: '140px' }}>Date</th>
                  <th style={{ width: '110px', textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredMessages.map((item) => (
                  <tr
                    key={item.id}
                    className={item.unread ? 'unread' : ''}
                    onClick={() => setSelectedItem(item)}
                  >
                    {/* Form Type Badge */}
                    <td>
                      <span className={`tt-inbox-form-badge ${getFormBadgeClass(item.formType)}`}>
                        {item.formType}
                      </span>
                    </td>

                    {/* Subject & Snippet */}
                    <td className="tt-inbox-subject-cell">
                      <div className="tt-inbox-subject-row">
                        <span className="tt-inbox-item-subject">{item.subject}</span>
                        {item.isLocked && (
                          <span className="tt-inbox-lock-badge" title="Official Approved Record">
                            <Lock size={11} /> Locked
                          </span>
                        )}
                        {item.lastEdited && (
                          <span className="tt-inbox-edited-badge">
                            <Edit3 size={10} /> Edited
                          </span>
                        )}
                      </div>
                      <div className="tt-inbox-item-snippet">{item.body}</div>
                    </td>

                    {/* Origin / Municipality */}
                    <td>
                      <div style={{ fontWeight: 600, color: '#334155' }}>{item.municipality}</div>
                      <div style={{ fontSize: '11px', color: '#64748b' }}>{item.sender}</div>
                    </td>

                    {/* Status Pill */}
                    <td>
                      <span className={`tt-inbox-status-pill ${item.status}`}>
                        {item.status === 'needs-revision' && <AlertCircle size={12} />}
                        {item.status === 'approved' && <CheckCircle2 size={12} />}
                        {item.status === 'pending' && 'Pending Review'}
                        {item.status === 'approved' && 'Approved (Locked)'}
                        {item.status === 'needs-revision' && 'Needs Revision'}
                        {item.status === 'sent' && 'Sent'}
                        {item.status === 'draft' && 'Draft'}
                      </span>
                    </td>

                    {/* Date */}
                    <td style={{ fontSize: '12px', color: '#64748b', whiteSpace: 'nowrap' }}>
                      {item.date}
                    </td>

                    {/* Actions Group */}
                    <td style={{ textAlign: 'right' }}>
                      <div
                        className="tt-inbox-actions-group"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <button
                          type="button"
                          className="tt-inbox-action-btn view-btn"
                          title="View Filing Details"
                          onClick={() => setSelectedItem(item)}
                        >
                          <Eye size={15} />
                        </button>

                        {currentRole === 'admin' && !item.isLocked && (
                          <>
                            <button
                              type="button"
                              className="tt-inbox-action-btn edit-btn"
                              title="Revise Filing"
                              onClick={() => setEditingItem(item)}
                            >
                              <Edit3 size={15} />
                            </button>
                            <button
                              type="button"
                              className="tt-inbox-action-btn approve-btn"
                              title="Approve & Lock"
                              onClick={(e) => handleApprove(item.id, e)}
                            >
                              <Check size={15} />
                            </button>
                            <button
                              type="button"
                              className="tt-inbox-action-btn reject-btn"
                              title="Return for Revision"
                              onClick={(e) => handleReturnRevision(item.id, e)}
                            >
                              <X size={15} />
                            </button>
                          </>
                        )}

                        {currentRole === 'admin' && (
                          <button
                            type="button"
                            className="tt-inbox-action-btn delete-btn"
                            title="Delete Record"
                            onClick={(e) => handleDelete(item.id, e)}
                          >
                            <Trash2 size={15} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Quick Demo Reset Footer */}
            <div className="tt-inbox-demo-controls" style={{ padding: '16px' }}>
              <button
                type="button"
                className="tt-inbox-demo-btn"
                onClick={handleClearAll}
              >
                Clear to Empty View (Match 0 Items Reference)
              </button>
            </div>
          </div>
        )}
      </div>

      {/* DETAIL / AUDIT MODAL */}
      {selectedItem && (
        <div className="tt-modal-backdrop" onClick={() => setSelectedItem(null)}>
          <div className="tt-modal-container large-document-modal" onClick={(e) => e.stopPropagation()}>
            <div className="tt-modal-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <h3 className="tt-modal-title">Official Municipal Filing</h3>
                <span className={`tt-inbox-status-pill ${selectedItem.status}`}>
                  {selectedItem.status}
                </span>
                {selectedItem.isLocked && (
                  <span className="tt-inbox-lock-badge">
                    <Lock size={12} /> Approved & Locked
                  </span>
                )}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <button
                  type="button"
                  className="tt-btn-secondary"
                  style={{ padding: '4px 10px', fontSize: '12px' }}
                  onClick={() => window.print()}
                >
                  Print Form
                </button>
                <button
                  type="button"
                  className="tt-modal-close-btn"
                  onClick={() => setSelectedItem(null)}
                >
                  <X size={20} />
                </button>
              </div>
            </div>

            <div className="tt-modal-body" style={{ padding: '20px', overflowX: 'auto' }}>
              {selectedItem.revisionReason && (
                <div
                  style={{
                    background: '#fff7ed',
                    border: '1px solid #fed7aa',
                    padding: '12px 14px',
                    borderRadius: '8px',
                    fontSize: '12.5px',
                    color: '#c2410c',
                    marginBottom: '14px',
                  }}
                >
                  <strong>Return for Revision Notes:</strong> {selectedItem.revisionReason}
                </div>
              )}

              {/* Authentic Form Table / Official Document Sheet */}
              <OfficialFormViewer item={selectedItem} />
            </div>

            <div className="tt-modal-footer">
              <button
                type="button"
                className="tt-btn-secondary"
                onClick={() => setSelectedItem(null)}
              >
                Close
              </button>
              {currentRole === 'admin' && !selectedItem.isLocked && (
                <>
                  <button
                    type="button"
                    className="tt-btn-secondary"
                    style={{ color: '#c2410c', borderColor: '#fdba74' }}
                    onClick={() => handleReturnRevision(selectedItem.id)}
                  >
                    Request Revision
                  </button>
                  <button
                    type="button"
                    className="tt-btn-primary"
                    onClick={() => handleApprove(selectedItem.id)}
                  >
                    Approve & Lock Filing
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* COMPOSE / BROADCAST MODAL */}
      {composeOpen && (
        <div className="tt-modal-backdrop" onClick={() => setComposeOpen(false)}>
          <div className="tt-modal-container" onClick={(e) => e.stopPropagation()}>
            <form onSubmit={handleSendCompose}>
              <div className="tt-modal-header">
                <h3 className="tt-modal-title">New Message / Broadcast Dispatch</h3>
                <button
                  type="button"
                  className="tt-modal-close-btn"
                  onClick={() => setComposeOpen(false)}
                >
                  <X size={20} />
                </button>
              </div>

              <div className="tt-modal-body">
                <div>
                  <label
                    style={{
                      display: 'block',
                      fontSize: '12.5px',
                      fontWeight: 700,
                      marginBottom: '6px',
                    }}
                  >
                    Recipient Target:
                  </label>
                  <select
                    name="recipient"
                    className="tt-inbox-filter-select"
                    style={{ width: '100%' }}
                    defaultValue="All Municipalities"
                  >
                    <option value="All Municipalities">
                      All Municipalities (Broadcast Dispatch)
                    </option>
                    <option value="Bayombong">Bayombong Tourism Office</option>
                    <option value="Solano">Solano Tourism Office</option>
                    <option value="Bambang">Bambang Tourism Office</option>
                    <option value="Diadi">Diadi Tourism Office</option>
                    <option value="Aritao">Aritao Tourism Office</option>
                    <option value="Kasibu">Kasibu Tourism Office</option>
                    <option value="All Establishments">
                      All Accommodation Establishments
                    </option>
                  </select>
                </div>

                <div>
                  <label
                    style={{
                      display: 'block',
                      fontSize: '12.5px',
                      fontWeight: 700,
                      marginBottom: '6px',
                    }}
                  >
                    Form / Notice Type:
                  </label>
                  <select
                    name="formType"
                    className="tt-inbox-filter-select"
                    style={{ width: '100%' }}
                    defaultValue="Broadcast"
                  >
                    <option value="Broadcast">Official Broadcast Directive</option>
                    <option value="DOT Form">DOT Form Submission Inquiry</option>
                    <option value="DAE 1A">DAE-1A Registry Compliance Notice</option>
                    <option value="CUS Form">CUS Form Verification Request</option>
                    <option value="Holiday Tracker">Holiday Season Advisory</option>
                  </select>
                </div>

                <div>
                  <label
                    style={{
                      display: 'block',
                      fontSize: '12.5px',
                      fontWeight: 700,
                      marginBottom: '6px',
                    }}
                  >
                    Subject:
                  </label>
                  <input
                    type="text"
                    name="subject"
                    required
                    placeholder="e.g. Compliance Reminder: Q4 Visitor Reports"
                    className="tt-inbox-search-input"
                    style={{ paddingLeft: '12px' }}
                  />
                </div>

                <div>
                  <label
                    style={{
                      display: 'block',
                      fontSize: '12.5px',
                      fontWeight: 700,
                      marginBottom: '6px',
                    }}
                  >
                    Message Body & Instructions:
                  </label>
                  <textarea
                    name="body"
                    required
                    rows={4}
                    placeholder="Enter dispatch details, deadlines, and submission instructions..."
                    className="tt-inbox-search-input"
                    style={{
                      padding: '10px 12px',
                      minHeight: '90px',
                      fontFamily: 'inherit',
                    }}
                  />
                </div>
              </div>

              <div className="tt-modal-footer">
                <button
                  type="button"
                  className="tt-btn-secondary"
                  onClick={() => setComposeOpen(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="tt-btn-primary">
                  <Send size={14} style={{ marginRight: '6px' }} />
                  Dispatch Notice
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* EDIT MODAL */}
      {editingItem && (
        <div className="tt-modal-backdrop" onClick={() => setEditingItem(null)}>
          <div className="tt-modal-container" onClick={(e) => e.stopPropagation()}>
            <form onSubmit={handleSaveEdit}>
              <div className="tt-modal-header">
                <h3 className="tt-modal-title">Revise Municipal Filing Details</h3>
                <button
                  type="button"
                  className="tt-modal-close-btn"
                  onClick={() => setEditingItem(null)}
                >
                  <X size={20} />
                </button>
              </div>

              <div className="tt-modal-body">
                <div>
                  <label
                    style={{
                      display: 'block',
                      fontSize: '12.5px',
                      fontWeight: 700,
                      marginBottom: '6px',
                    }}
                  >
                    Subject:
                  </label>
                  <input
                    type="text"
                    value={editingItem.subject}
                    onChange={(e) =>
                      setEditingItem({ ...editingItem, subject: e.target.value })
                    }
                    className="tt-inbox-search-input"
                    style={{ paddingLeft: '12px' }}
                    required
                  />
                </div>

                <div>
                  <label
                    style={{
                      display: 'block',
                      fontSize: '12.5px',
                      fontWeight: 700,
                      marginBottom: '6px',
                    }}
                  >
                    Form Type:
                  </label>
                  <select
                    value={editingItem.formType}
                    onChange={(e) =>
                      setEditingItem({ ...editingItem, formType: e.target.value })
                    }
                    className="tt-inbox-filter-select"
                    style={{ width: '100%' }}
                  >
                    <option value="DOT Form">DOT Form</option>
                    <option value="CUS Form">CUS Form</option>
                    <option value="DAE 1A">DAE 1A</option>
                    <option value="DAE 4A">DAE 4A</option>
                    <option value="Holiday Tracker">Holiday Tracker</option>
                    <option value="Broadcast">Broadcast</option>
                  </select>
                </div>

                <div>
                  <label
                    style={{
                      display: 'block',
                      fontSize: '12.5px',
                      fontWeight: 700,
                      marginBottom: '6px',
                    }}
                  >
                    Report / Submission Notes:
                  </label>
                  <textarea
                    rows={4}
                    value={editingItem.body}
                    onChange={(e) =>
                      setEditingItem({ ...editingItem, body: e.target.value })
                    }
                    className="tt-inbox-search-input"
                    style={{
                      padding: '10px 12px',
                      minHeight: '90px',
                      fontFamily: 'inherit',
                    }}
                    required
                  />
                </div>
              </div>

              <div className="tt-modal-footer">
                <button
                  type="button"
                  className="tt-btn-secondary"
                  onClick={() => setEditingItem(null)}
                >
                  Cancel
                </button>
                <button type="submit" className="tt-btn-primary">
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* TOAST FEEDBACK */}
      {toastMessage && (
        <div className="tt-toast">
          <CheckCircle2 size={16} color="#4ade80" />
          <span>{toastMessage}</span>
        </div>
      )}
    </div>
  );
}
