import React, { useState, useEffect } from 'react';
import './App.css';

function App() {
  const [activeTab, setActiveTab] = useState(0);

  const tabs = [
    { name: '🏠 Dashboard' },
    { name: '📖 Promises' },
    { name: '✏️ New Promise' },
    { name: '📅 Schedule' },
    { name: '🎙️ Sermons' },
    { name: '➕ New Sermon' },
    { name: '👁️ App Preview' },
    { name: '🔔 Notifications' },
    { name: '📅 Events' },
    { name: '➕ New Event' },
    { name: '🙏 Prayers' },
    { name: '📅 Pastor Events' }
  ];

  return (
    <div className="admin-container">
      {/* ── HEADER ── */}
      <header className="app-header">
        <div className="header-top">
          <div className="logo-circle">
            <span className="logo-cg">CG</span>
          </div>
          <div className="header-text">
            <h1 className="header-title">Church of GOD</h1>
            <p className="header-sub">Promise & Sermon Admin</p>
          </div>
          <div className="header-role">Pastor Admin</div>
        </div>

        {/* ── TAB BAR ── */}
        <nav className="tab-bar">
          {tabs.map((tab, idx) => (
            <div 
              key={idx} 
              className={`tab-item ${activeTab === idx ? 'active' : ''}`}
              onClick={() => setActiveTab(idx)}
            >
              {tab.name}
            </div>
          ))}
        </nav>
      </header>

      {/* ── SCREENS ── */}
      <main className="content">
        {activeTab === 0 && <DashboardScreen onGoTo={setActiveTab} />}
        {activeTab === 1 && <PromiseListScreen onGoTo={setActiveTab} />}
        {activeTab === 2 && <NewPromiseScreen onGoTo={setActiveTab} />}
        {activeTab === 3 && <ScheduleScreen onGoTo={setActiveTab} />}
        {activeTab === 4 && <SermonListScreen onGoTo={setActiveTab} />}
        {activeTab === 5 && <NewSermonScreen onGoTo={setActiveTab} />}
        {activeTab === 6 && <AppPreviewScreen onGoTo={setActiveTab} />}
        {activeTab === 7 && <NotificationScreen onGoTo={setActiveTab} />}
        {activeTab === 8 && <EventListScreen onGoTo={setActiveTab} />}
        {activeTab === 9 && <NewEventScreen onGoTo={setActiveTab} />}
        {activeTab === 10 && <PrayerWallScreen onGoTo={setActiveTab} />}
        {activeTab === 11 && <PastorEventsScreen onGoTo={setActiveTab} />}
      </main>

      {/* FAB */}
      <button className="fab" onClick={() => setActiveTab(activeTab === 0 ? 1 : activeTab)}>+</button>
    </div>
  );
}

// ── SCREEN 0: DASHBOARD ──
const DashboardScreen = ({ onGoTo }) => (
  <div className="screen active">
    <div className="sec-hd">
      <div><div className="sec-title">🏠 Dashboard</div><div className="sec-sub">Quick overview & actions</div></div>
    </div>
    
    <div className="stats-row">
      <div className="stat-card"><div className="stat-num" style={{ color: '#15803D' }}>17</div><div className="stat-lbl">Published</div></div>
      <div className="stat-card"><div className="stat-num" style={{ color: '#D97706' }}>2</div><div className="stat-lbl">Drafts</div></div>
      <div className="stat-card"><div className="stat-num" style={{ color: '#c0392b' }}>8</div><div className="stat-lbl">Missing</div></div>
    </div>

    <div className="alert alert-red">
      <div className="alert-icon">⚠️</div>
      <div>8 dates in April are missing promises. Fill them to ensure consistent feeding.</div>
    </div>

    <div className="list-label">Today</div>
    <div className="promise-item today" onClick={() => onGoTo(1)}>
      <div className="pi-row">
        <div><div className="pi-date">Today — April 21, 2026</div><div className="pi-ref">Philippians 4:13</div></div>
        <span className="badge b-live">Live now</span>
      </div>
      <div className="pi-verse">"I can do all things through Christ who strengthens me."</div>
      <div className="pi-te">"క్రీస్తు ద్వారా నాకు సమర్థత నిచ్చువానివలన సమస్తమూ చేయగలను."</div>
      <div className="pi-foot">
        <span className="badge b-navy">📖 English ✓</span>
        <span className="badge b-navy">🇮🇳 Telugu ✓</span>
        <span className="badge b-red">▶️ YouTube ✓</span>
        <span className="edit-link">Edit →</span>
      </div>
    </div>

    <div className="list-label" style={{ marginTop: '12px' }}>Upcoming</div>
    <div className="promise-item" onClick={() => onGoTo(1)}>
      <div className="pi-row">
        <div><div className="pi-date">Apr 22</div><div className="pi-ref">John 3:16</div></div>
        <span className="badge b-sch">Scheduled</span>
      </div>
      <div className="pi-verse">"For God so loved the world that he gave his one and only Son..."</div>
      <div className="pi-te">"దేవుడు లోకమును ఎంతగా ప్రేమించెనంటే, తన అద్వితీయకుమారుని అనుగ్రహించెను."</div>
      <div className="pi-foot">
        <span className="badge b-navy">📖 ✓</span>
        <span className="badge b-navy">🇮🇳 ✓</span>
        <span className="badge b-red">▶️ ✓</span>
        <span className="edit-link">Edit →</span>
      </div>
    </div>

    <div className="list-label">Missing Dates (8)</div>
    <div className="missing-grid">
      {[21, 22, 23, 24, 25, 26, 27, 28].map(day => (
        <div key={day} className="missing-cell" onClick={() => onGoTo(2)}>
          <div className="missing-cell-date">Apr {day}</div>
          <div className="missing-cell-add">+ Add</div>
        </div>
      ))}
    </div>

    <div className="page-footer">Church of GOD Admin · v1.0</div>
  </div>
);

// ── SCREEN 1: PROMISE LIST ──
const PromiseListScreen = ({ onGoTo }) => (
  <div className="screen active">
    <div className="sec-hd">
      <div><div className="sec-title">📖 Promises</div><div className="sec-sub">Manage daily bread</div></div>
      <button className="btn btn-primary btn-sm" onClick={() => onGoTo(2)}>+ New</button>
    </div>
    <div className="filter-row">
      <div className="filter-chip active">All</div>
      <div className="filter-chip">Published</div>
      <div className="filter-chip">Drafts</div>
      <div className="filter-chip">Missing</div>
    </div>
    {/* List items would go here, same as dashboard but full list */}
    <p style={{ textAlign: 'center', fontSize: '11px', color: '#6B7280', marginTop: '20px' }}>Showing all promises for April 2026</p>
  </div>
);

// ── SCREEN 2: NEW PROMISE ──
const NewPromiseScreen = ({ onGoTo }) => {
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    date: new Date().toISOString().split('T')[0],
    verseEn: "",
    refEn: "",
    verseTe: "",
    refTe: "",
    pastorNote: "",
    pastorName: "Pastor Daniel Raju",
    youtubeId: "",
    duration: "1:30"
  });

  const handleSave = async () => {
    if (!form.verseEn || !form.refEn) {
      alert("⚠️ Please enter at least the English verse and reference.");
      return;
    }

    setLoading(true);
    try {
      // In a real app, this would call an API route that talks to Salesforce
      console.log("Submitting to Salesforce:", form);
      
      // Simulating Salesforce API Call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      alert("✅ Success! Promise saved to Salesforce Daily Promise object.");
      onGoTo(1); // Go back to list
    } catch (error) {
      alert("❌ Error: Failed to save to Salesforce.");
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="screen active">
      <div className="sec-hd">
        <div><div className="sec-title">✏️ New Promise</div><div className="sec-sub">Create bilingual daily bread for Salesforce</div></div>
      </div>
      
      <div className="form-section">
        <div className="form-sec-title fst-navy">📅 Schedule & Author</div>
        <div className="form-group">
          <label className="form-label">Promise Date <span className="req">*</span></label>
          <input type="date" className="form-input" value={form.date} onChange={(e) => setForm({...form, date: e.target.value})} />
        </div>
        <div className="form-group">
          <label className="form-label">Pastor Name</label>
          <input className="form-input" value={form.pastorName} onChange={(e) => setForm({...form, pastorName: e.target.value})} />
        </div>
      </div>

      <div className="form-section">
        <div className="form-sec-title fst-navy">🇬🇧 English Version</div>
        <div className="form-group">
          <label className="form-label">Reference (e.g. John 3:16) <span className="req">*</span></label>
          <input className="form-input" value={form.refEn} onChange={(e) => setForm({...form, refEn: e.target.value})} placeholder="John 3:16" />
        </div>
        <div className="form-group">
          <label className="form-label">Verse Text <span className="req">*</span></label>
          <textarea className="form-textarea" rows="3" value={form.verseEn} onChange={(e) => setForm({...form, verseEn: e.target.value})} placeholder="For God so loved the world..."></textarea>
        </div>
      </div>

      <div className="form-section">
        <div className="form-sec-title fst-blue">🇮🇳 Telugu Version</div>
        <div className="form-group">
          <label className="form-label">Reference (Telugu)</label>
          <input className="form-input te" value={form.refTe} onChange={(e) => setForm({...form, refTe: e.target.value})} placeholder="యోహాను 3:16" />
        </div>
        <div className="form-group">
          <label className="form-label">Verse Text (Telugu)</label>
          <textarea className="form-textarea te" rows="3" value={form.verseTe} onChange={(e) => setForm({...form, verseTe: e.target.value})} placeholder="దేవుడు లోకమును ఎంతగా ప్రేమించెనంటే..."></textarea>
        </div>
      </div>

      <div className="form-section">
        <div className="form-sec-title fst-red">🎬 Media & Notes</div>
        <div className="form-group">
          <label className="form-label">YouTube URL / ID</label>
          <input className="form-input" value={form.youtubeId} onChange={(e) => setForm({...form, youtubeId: e.target.value})} placeholder="https://youtube.com/..." />
        </div>
        <div className="form-group">
          <label className="form-label">Devotional Note (Bilingual)</label>
          <textarea className="form-textarea te" rows="3" value={form.pastorNote} onChange={(e) => setForm({...form, pastorNote: e.target.value})} placeholder="Type devotional reflections here..."></textarea>
        </div>
      </div>

      <div className="form-section">
        <div className="form-sec-title fst-green">👁️ Live Preview</div>
        <div className="promise-preview">
          <div className="pp-label">TODAY'S PROMISE · ఈ రోజు వాగ్దానం</div>
          <div className="pp-verse-en">"{form.verseEn || 'Your English verse will appear here...'}"</div>
          <div className="pp-verse-te">{form.verseTe || 'తెలుగు వచనం ఇక్కడ కనిపిస్తుంది...'}</div>
          <div className="pp-ref">{form.refEn || 'John 3:16'} · {form.refTe || 'యోహాను 3:16'}</div>
        </div>
      </div>

      <button className="btn btn-primary" onClick={handleSave} disabled={loading}>
        {loading ? "⌛ Saving to Salesforce..." : "📅 Publish to Salesforce"}
      </button>
    </div>
  );
};

// ── SCREEN 4: SERMON LIST ──
const SermonListScreen = ({ onGoTo }) => (
  <div className="screen active">
    <div className="sec-hd">
      <div><div className="sec-title">🎙️ Sermons</div><div className="sec-sub">Manage your library</div></div>
      <button className="btn btn-primary btn-sm" onClick={() => onGoTo(5)}>+ Add</button>
    </div>
    <div className="stats-row">
      <div className="stat-card"><div className="stat-num">29</div><div className="stat-lbl">Published</div></div>
      <div className="stat-card"><div className="stat-num">3</div><div className="stat-lbl">Drafts</div></div>
      <div className="stat-card"><div className="stat-num">5</div><div className="stat-lbl">Series</div></div>
    </div>
    <div className="sermon-item featured" onClick={() => onGoTo(5)}>
      <div className="si-thumb">▶️</div>
      <div className="si-body">
        <div className="si-title">Walking in Faith Through Every Trial</div>
        <div className="si-te">విశ్వాసంతో నడవడం</div>
        <div className="si-meta">Pastor Daniel Raju · Apr 13, 2026</div>
        <div className="si-foot">
          <span className="badge b-navy">Faith & Trust</span>
          <span className="badge b-red">▶️ YouTube</span>
          <span className="badge b-pub">Published</span>
        </div>
      </div>
    </div>
  </div>
);

// ── SCREEN 3: SCHEDULE (CALENDAR) ──
const ScheduleScreen = () => (
  <div className="screen active">
    <div className="sec-hd">
      <div><div className="sec-title">📅 Schedule</div><div className="sec-sub">Daily Promise Calendar · April 2026</div></div>
    </div>
    <div className="cal-grid">
      {['Mon','Tue','Wed','Thu','Fri','Sat','Sun'].map(day => (
        <div key={day} className="cal-header">{day}</div>
      ))}
      {/* Sample calendar days match HTML logic */}
      {[...Array(30)].map((_, i) => {
        const d = i + 1;
        const status = d === 17 ? 'c-today' : d === 19 ? 'c-dft' : d < 20 ? 'c-pub' : 'c-miss';
        const label = d === 17 ? 'Today' : d === 19 ? 'Draft' : d < 20 ? '✓' : '+Add';
        return (
          <div key={d} className={`cal-day ${status}`}>
            <span className="cal-num">{d}</span>
            <span className="cal-status">{label}</span>
          </div>
        );
      })}
    </div>
    <div className="page-footer">Church of GOD Admin · Bulk Scheduler</div>
  </div>
);

// ── SCREEN 5: NEW SERMON ──
const NewSermonScreen = ({ onGoTo }) => (
  <div className="screen active">
    <div className="sec-hd">
      <div><div className="sec-title">➕ Add Sermon</div><div className="sec-sub">YouTube · Audio · Bilingual</div></div>
    </div>
    <div className="form-section">
      <div className="form-sec-title fst-navy">📋 Sermon Info</div>
      <div className="form-group">
        <label className="form-label">Title — English <span className="req">*</span></label>
        <input className="form-input" placeholder="e.g. Walking in Faith Through Trials" />
      </div>
      <div className="form-group">
        <label className="form-label">YouTube URL</label>
        <input className="form-input" placeholder="https://youtube.com/watch?v=..." />
      </div>
    </div>
    <button className="btn btn-primary" onClick={() => alert('Published!')}>🎙️ Publish Sermon</button>
  </div>
);

// ── SCREEN 6: APP PREVIEW ──
const AppPreviewScreen = () => (
  <div className="screen active">
    <div className="sec-hd">
      <div><div className="sec-title">👁️ App Preview</div><div className="sec-sub">Exact member view in app</div></div>
    </div>
    <div className="app-preview-wrap">
      <div style={{ fontSize:'9px', color:'#6B7280', textAlign:'center', marginBottom:'10px', letterSpacing:'.07em', fontWeight:'500' }}>TODAY'S PROMISE</div>
      <div className="promise-preview">
        <div className="pp-label">John 3:16 · యోహాను 3:16</div>
        <div className="pp-verse-en">"For God so loved the world that he gave his one and only Son..."</div>
        <div className="pp-verse-te">"దేవుడు లోకమును ఎంతగా ప్రేమించెనంటే, తన అద్వితీయ కుమారుని అనుగ్రహించెను..."</div>
        <div className="pp-ref">— John 3:16</div>
      </div>
    </div>
    <div className="page-footer">App Preview · Church of GOD</div>
  </div>
);

// ── SCREEN 7: NOTIFICATIONS ──
const NotificationScreen = () => (
  <div className="screen active">
    <div className="sec-hd">
      <div><div className="sec-title">🔔 Notifications</div><div className="sec-sub">Configure member alerts</div></div>
    </div>
    <div className="form-section">
      <div className="form-sec-title fst-navy">📖 Daily Promise Notification</div>
      <div className="notif-box">
        <div className="notif-app">📱 Church of GOD · 7:00 AM</div>
        <div className="notif-title">ఈ రోజు వాగ్దానం 🙏 · Today's Promise</div>
        <div className="notif-body">"I can do all things through Christ…" — Phil 4:13</div>
      </div>
    </div>
    <button className="btn btn-secondary" onClick={() => alert('Saved!')}>💾 Save Settings</button>
  </div>
);

// ── SCREEN 8: EVENT LIST ──
const EventListScreen = ({ onGoTo }) => (
  <div className="screen active">
    <div className="sec-hd">
      <div><div className="sec-title">📅 Events</div><div className="sec-sub">Church events · RSVP management</div></div>
      <button className="btn btn-primary btn-sm" onClick={() => onGoTo(9)}>+ New</button>
    </div>
    <div className="ev-card ev-featured" onClick={() => onGoTo(9)}>
      <div className="ev-date-block" style={{ background: '#c0392b' }}><div className="ev-day">20</div><div className="ev-mon">APR</div></div>
      <div className="ev-info">
        <div className="ev-title">Easter Sunday Service 2026</div>
        <div className="ev-te">ఈస్టర్ ఆదివారం సేవ 2026</div>
        <div className="ev-meta">🕐 9:00 AM – 12:00 PM · 📍 Main Auditorium</div>
        <div className="ev-foot">
          <span className="badge b-live">Published</span>
          <span className="badge b-green">72 RSVPs</span>
          <span className="edit-link">Edit →</span>
        </div>
      </div>
    </div>
  </div>
);

// ── SCREEN 9: NEW EVENT ──
const NewEventScreen = () => (
  <div className="screen active">
    <div className="sec-hd">
      <div><div className="sec-title">➕ Create Event</div><div className="sec-sub">English + Telugu · RSVP enabled</div></div>
    </div>
    <div className="form-section">
      <div className="form-sec-title fst-navy">📋 Event Info</div>
      <div className="form-group">
        <label className="form-label">Event title — English <span className="req">*</span></label>
        <input className="form-input" placeholder="e.g. Easter Sunday Service 2026" />
      </div>
    </div>
    <button className="btn btn-primary" onClick={() => alert('Published!')}>📅 Publish Event</button>
  </div>
);

// ── SCREEN 10: PRAYER WALL ──
const PrayerWallScreen = () => (
  <div className="screen active">
    <div className="sec-hd">
      <div><div className="sec-title">🙏 Prayer Wall</div><div className="sec-sub">Moderate · approve · respond</div></div>
    </div>
    <div className="stats-row">
      <div className="stat-card"><div className="stat-num" style={{ color:'#c0392b' }}>7</div><div className="stat-lbl">Pending</div></div>
      <div className="stat-card"><div className="stat-num" style={{ color:'#15803D' }}>43</div><div className="stat-lbl">Approved</div></div>
      <div className="stat-card"><div className="stat-num" style={{ color:'#1a2d5a' }}>312</div><div className="stat-lbl">Prayed</div></div>
    </div>
    <div className="pr-card pr-pending">
      <div className="pr-top">
        <div className="pr-avatar" style={{ background:'#7C3AED' }}>S</div>
        <div className="pr-meta">
          <div className="pr-name">Sunita Devi <span className="badge b-gray">Anonymous</span></div>
          <div className="pr-time">Submitted 2 hours ago</div>
        </div>
      </div>
      <div className="pr-text">"Please pray for my husband's healing..."</div>
      <div className="pr-actions">
        <button className="pr-btn pr-approve" onClick={() => alert('Approved!')}>✅ Approve</button>
        <button className="pr-btn pr-decline" onClick={() => alert('Declined!')}>✗ Decline</button>
      </div>
    </div>
  </div>
);

// ── SCREEN 11: PASTOR EVENTS ──
const PastorEventsScreen = () => {
  const [events, setEvents] = useState([
    {
      id: 'e1',
      title: 'Sunday Morning Worship & Sermon',
      type: 'worship',
      date: '2026-06-08',
      startTime: '09:30',
      durationMins: 90,
      venue: 'Main Church Building',
      address: '12-34 Main St, Guntur, AP, India',
      lat: 16.3067,
      lng: 80.4365,
      contactName: 'Deacon Raj',
      contactPhone: '+91 98765 43210',
      description: 'Weekly Sunday worship and sermon delivery on Daily Promises.',
      notes: 'Arrive 30 mins early to pray with leadership.',
      travel: { distKm: 0, car: 0, bike: 0, walk: 0 }
    },
    {
      id: 'e2',
      title: 'Pastoral Advisory Committee Meeting',
      type: 'meeting',
      date: '2026-06-08',
      startTime: '13:00',
      durationMins: 60,
      venue: 'District Office',
      address: 'Ring Road, Near NTR Stadium, Guntur, AP, India',
      lat: 16.3150,
      lng: 80.4550,
      contactName: 'Pastor Sunil',
      contactPhone: '+91 99887 76655',
      description: 'Review monthly church programs and budget allocations.',
      notes: 'Bring current member list for updates.',
      travel: { distKm: 3.5, car: 12, bike: 8, walk: 45 }
    },
    {
      id: 'e3',
      title: 'Outreach & Prayer Fellowship',
      type: 'outreach',
      date: '2026-06-08',
      startTime: '16:30',
      durationMins: 120,
      venue: 'Community Center',
      address: 'Subhash Nagar, Guntur, AP, India',
      lat: 16.2950,
      lng: 80.4180,
      contactName: 'Sister Grace',
      description: 'Street preaching, tracts distribution, and prayer fellowship.',
      notes: 'Sound system will be arranged locally.',
      travel: { distKm: 5.2, car: 18, bike: 12, walk: 65 }
    }
  ]);

  const [filterMode, setFilterMode] = useState('car'); // car | bike | walk

  const badgeConfig = {
    worship:  { bg: '#E6F1FB', text: '#0C447C', label: 'Worship' },
    prayer:   { bg: '#E1F5EE', text: '#085041', label: 'Prayer' },
    meeting:  { bg: '#FAEEDA', text: '#633806', label: 'Meeting' },
    outreach: { bg: '#FBEAF0', text: '#72243E', label: 'Outreach' },
    funeral:  { bg: '#F1EFE8', text: '#444441', label: 'Funeral' },
  };

  const getTravelTime = (travel, mode) => {
    if (!travel) return 0;
    if (mode === 'car') return travel.car;
    if (mode === 'bike') return travel.bike;
    return travel.walk;
  };

  const totalDistance = events.reduce((acc, curr) => acc + (curr.travel?.distKm || 0), 0);
  const totalTravelTime = events.reduce((acc, curr) => acc + getTravelTime(curr.travel, filterMode), 0);

  return (
    <div className="screen active" style={{ padding: '16px' }}>
      <div className="sec-hd" style={{ marginBottom: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <div className="sec-title" style={{ fontSize: '20px', fontWeight: '700', color: '#1a2d5a' }}>📅 Pastor Itinerary & Routes</div>
          <div className="sec-sub" style={{ fontSize: '12px', color: '#6B7280' }}>Track travel schedules, locations, and timings</div>
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button 
            className={`btn btn-sm ${filterMode === 'car' ? 'btn-primary' : 'btn-secondary'}`}
            style={{ padding: '4px 10px', fontSize: '12px' }}
            onClick={() => setFilterMode('car')}
          >
            🚗 Car
          </button>
          <button 
            className={`btn btn-sm ${filterMode === 'bike' ? 'btn-primary' : 'btn-secondary'}`}
            style={{ padding: '4px 10px', fontSize: '12px' }}
            onClick={() => setFilterMode('bike')}
          >
            🏍️ Bike
          </button>
          <button 
            className={`btn btn-sm ${filterMode === 'walk' ? 'btn-primary' : 'btn-secondary'}`}
            style={{ padding: '4px 10px', fontSize: '12px' }}
            onClick={() => setFilterMode('walk')}
          >
            🚶 Walk
          </button>
        </div>
      </div>

      <div className="stats-row" style={{ display: 'flex', gap: '16px', marginBottom: '24px' }}>
        <div className="stat-card" style={{ flex: 1, padding: '16px', background: '#fff', borderRadius: '8px', border: '1px solid #E5E7EB', textAlign: 'center' }}>
          <div className="stat-num" style={{ fontSize: '24px', fontWeight: '700', color: '#1e3a8a' }}>{events.length}</div>
          <div className="stat-lbl" style={{ fontSize: '11px', color: '#6B7280', textTransform: 'uppercase', marginTop: '4px' }}>Appointments</div>
        </div>
        <div className="stat-card" style={{ flex: 1, padding: '16px', background: '#fff', borderRadius: '8px', border: '1px solid #E5E7EB', textAlign: 'center' }}>
          <div className="stat-num" style={{ fontSize: '24px', fontWeight: '700', color: '#16a34a' }}>{totalDistance.toFixed(1)} km</div>
          <div className="stat-lbl" style={{ fontSize: '11px', color: '#6B7280', textTransform: 'uppercase', marginTop: '4px' }}>Total Distance</div>
        </div>
        <div className="stat-card" style={{ flex: 1, padding: '16px', background: '#fff', borderRadius: '8px', border: '1px solid #E5E7EB', textAlign: 'center' }}>
          <div className="stat-num" style={{ fontSize: '24px', fontWeight: '700', color: '#ca8a04' }}>{totalTravelTime} mins</div>
          <div className="stat-lbl" style={{ fontSize: '11px', color: '#6B7280', textTransform: 'uppercase', marginTop: '4px' }}>Travel Time ({filterMode})</div>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {events.map((evt, idx) => {
          const cfg = badgeConfig[evt.type] || badgeConfig.worship;
          const legTime = getTravelTime(evt.travel, filterMode);
          return (
            <div key={evt.id} style={{ display: 'flex', flexDirection: 'column' }}>
              {/* Travel Leg indicator */}
              {evt.travel && evt.travel.distKm > 0 && (
                <div style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '8px', 
                  padding: '8px 16px', 
                  margin: '4px 24px', 
                  background: '#f8fafc', 
                  borderRadius: '16px', 
                  borderLeft: '3px solid #cbd5e1',
                  fontSize: '12px',
                  color: '#475569',
                  width: 'fit-content'
                }}>
                  <span>📍 Travel Leg: <strong>{evt.travel.distKm.toFixed(1)} km</strong></span>
                  <span style={{ color: '#94a3b8' }}>•</span>
                  <span>Est. Time: <strong>{legTime} mins</strong> by {filterMode}</span>
                </div>
              )}

              {/* Event Card */}
              <div className="promise-item" style={{ 
                background: '#fff', 
                border: '1px solid #E5E7EB', 
                borderRadius: '8px', 
                padding: '16px',
                cursor: 'default',
                boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
              }}>
                <div className="pi-row" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ 
                      backgroundColor: cfg.bg, 
                      color: cfg.text, 
                      borderRadius: '999px', 
                      padding: '2px 8px', 
                      fontSize: '11px', 
                      fontWeight: '600' 
                    }}>
                      {cfg.label}
                    </span>
                    <strong style={{ fontSize: '15px', color: '#0f172a' }}>{evt.title}</strong>
                  </div>
                  <span style={{ color: '#2563eb', fontWeight: '600', fontSize: '13px' }}>
                    🕒 {evt.startTime} ({evt.durationMins}m)
                  </span>
                </div>
                
                <div style={{ fontSize: '13px', color: '#4b5563', margin: '8px 0' }}>
                  🏢 <strong>Venue:</strong> {evt.venue}
                </div>
                
                <div style={{ fontSize: '12px', color: '#6b7280', marginBottom: '8px' }}>
                  🗺️ <strong>Address:</strong> {evt.address}
                </div>

                {evt.description && (
                  <p style={{ fontSize: '13px', color: '#4b5563', lineHeight: '1.4', background: '#f9fafb', padding: '8px', borderRadius: '4px', margin: '8px 0' }}>
                    {evt.description}
                  </p>
                )}

                {evt.notes && (
                  <div style={{ fontSize: '12px', color: '#b45309', borderLeft: '2px solid #f59e0b', paddingLeft: '8px', marginTop: '8px' }}>
                    <strong>Note:</strong> {evt.notes}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default App;
