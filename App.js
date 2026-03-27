import React, { useState, useEffect, useCallback } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import axios from 'axios';

const API = "http://127.0.0.1:5000/api";

// ─── GLOBAL STYLES ─────────────────────────────────────────────────────────────
const GlobalStyle = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@400;600;700;800&family=Barlow:wght@300;400;500;600&display=swap');

    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

    :root {
      --bg: #0a0c0f;
      --surface: #111418;
      --surface2: #181c22;
      --border: #1e2430;
      --accent: #f0b429;
      --accent2: #e85d04;
      --blue: #3b82f6;
      --green: #22c55e;
      --red: #ef4444;
      --purple: #a855f7;
      --text: #e8eaf0;
      --text2: #8892a4;
      --text3: #4a5568;
      --radius: 12px;
      --shadow: 0 4px 24px rgba(0,0,0,0.4);
    }

    body {
      font-family: 'Barlow', sans-serif;
      background: var(--bg);
      color: var(--text);
      overflow-x: hidden;
    }

    ::-webkit-scrollbar { width: 6px; }
    ::-webkit-scrollbar-track { background: var(--bg); }
    ::-webkit-scrollbar-thumb { background: var(--border); border-radius: 3px; }

    input, select, textarea {
      font-family: 'Barlow', sans-serif;
    }

    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(12px); }
      to { opacity: 1; transform: translateY(0); }
    }

    @keyframes slideIn {
      from { opacity: 0; transform: translateX(-20px); }
      to { opacity: 1; transform: translateX(0); }
    }

    @keyframes pulse {
      0%, 100% { opacity: 1; }
      50% { opacity: 0.5; }
    }

    .page-enter { animation: fadeIn 0.35s ease forwards; }
    .slide-in { animation: slideIn 0.3s ease forwards; }
  `}</style>
);

// ─── TOAST NOTIFICATION ────────────────────────────────────────────────────────
const Toast = ({ message, type, onClose }) => {
  useEffect(() => { const t = setTimeout(onClose, 3000); return () => clearTimeout(t); }, [onClose]);
  const colors = { success: '#22c55e', error: '#ef4444', info: '#3b82f6' };
  return (
    <div style={{
      position: 'fixed', top: 24, right: 24, zIndex: 9999,
      background: '#181c22', border: `1px solid ${colors[type] || colors.info}`,
      borderLeft: `4px solid ${colors[type] || colors.info}`,
      padding: '14px 20px', borderRadius: 10, boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
      display: 'flex', alignItems: 'center', gap: 12, minWidth: 280,
      animation: 'fadeIn 0.3s ease',
    }}>
      <span style={{ fontSize: 18 }}>{type === 'success' ? '✓' : type === 'error' ? '✕' : 'ℹ'}</span>
      <span style={{ fontSize: 14, color: 'var(--text)', flex: 1 }}>{message}</span>
      <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'var(--text2)', cursor: 'pointer', fontSize: 18, lineHeight: 1 }}>×</button>
    </div>
  );
};


// ─── MODAL ─────────────────────────────────────────────────────────────────────
const Modal = ({ title, onClose, children }) => (
  <div style={{
    position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)', zIndex: 1000,
    display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24,
    backdropFilter: 'blur(4px)'
  }} onClick={e => e.target === e.currentTarget && onClose()}>
    <div style={{
      background: '#111418', border: '1px solid #1e2430', borderRadius: 16,
      width: '100%', maxWidth: 540, maxHeight: '90vh', overflow: 'auto',
      boxShadow: '0 24px 64px rgba(0,0,0,0.6)', animation: 'fadeIn 0.25s ease'
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px 24px', borderBottom: '1px solid #1e2430' }}>
        <h2 style={{ fontFamily: 'Barlow Condensed', fontSize: 22, fontWeight: 700, letterSpacing: 1, color: '#f0b429' }}>{title}</h2>
        <button onClick={onClose} style={{ background: 'none', border: 'none', color: '#8892a4', cursor: 'pointer', fontSize: 24, lineHeight: 1 }}>×</button>
      </div>
      <div style={{ padding: 24 }}>{children}</div>
    </div>
  </div>
);

// ─── FORM COMPONENTS ───────────────────────────────────────────────────────────
const Field = ({ label, children }) => (
  <div style={{ marginBottom: 16 }}>
    <label style={{ display: 'block', fontSize: 11, fontWeight: 600, letterSpacing: 1.5, textTransform: 'uppercase', color: '#8892a4', marginBottom: 6 }}>{label}</label>
    {children}
  </div>
);

const Input = ({ ...props }) => (
  <input style={{
    width: '100%', padding: '10px 14px', background: '#181c22', border: '1px solid #1e2430',
    borderRadius: 8, color: '#e8eaf0', fontSize: 14, outline: 'none',
    transition: 'border-color 0.2s',
  }}
    onFocus={e => e.target.style.borderColor = '#f0b429'}
    onBlur={e => e.target.style.borderColor = '#1e2430'}
    {...props}
  />
);

const Select = ({ children, ...props }) => (
  <select style={{
    width: '100%', padding: '10px 14px', background: '#181c22', border: '1px solid #1e2430',
    borderRadius: 8, color: '#e8eaf0', fontSize: 14, outline: 'none', cursor: 'pointer'
  }}
    onFocus={e => e.target.style.borderColor = '#f0b429'}
    onBlur={e => e.target.style.borderColor = '#1e2430'}
    {...props}
  >
    {children}
  </select>
);

const Textarea = ({ ...props }) => (
  <textarea style={{
    width: '100%', padding: '10px 14px', background: '#181c22', border: '1px solid #1e2430',
    borderRadius: 8, color: '#e8eaf0', fontSize: 14, outline: 'none', resize: 'vertical', minHeight: 80,
    fontFamily: 'Barlow, sans-serif'
  }}
    onFocus={e => e.target.style.borderColor = '#f0b429'}
    onBlur={e => e.target.style.borderColor = '#1e2430'}
    {...props}
  />
);

const Btn = ({ variant = 'primary', children, style: s, ...props }) => {
  const variants = {
    primary: { background: '#f0b429', color: '#0a0c0f', border: 'none' },
    danger: { background: 'transparent', color: '#ef4444', border: '1px solid #ef4444' },
    ghost: { background: 'transparent', color: '#8892a4', border: '1px solid #1e2430' },
    success: { background: '#22c55e', color: '#0a0c0f', border: 'none' },
  };
  return (
    <button style={{
      padding: '9px 18px', borderRadius: 8, cursor: 'pointer', fontSize: 13, fontWeight: 600,
      fontFamily: 'Barlow Condensed, sans-serif', letterSpacing: 0.8, transition: 'all 0.2s',
      ...variants[variant], ...s
    }}
      onMouseEnter={e => e.currentTarget.style.opacity = '0.85'}
      onMouseLeave={e => e.currentTarget.style.opacity = '1'}
      {...props}
    >{children}</button>
  );
};

// ─── BADGE ─────────────────────────────────────────────────────────────────────
const Badge = ({ label, color = '#3b82f6' }) => (
  <span style={{
    display: 'inline-block', padding: '2px 10px', borderRadius: 20, fontSize: 11,
    fontWeight: 600, letterSpacing: 0.5, background: `${color}22`, color, border: `1px solid ${color}44`
  }}>{label}</span>
);

// ─── SIDEBAR ───────────────────────────────────────────────────────────────────
const navItems = [
  { to: '/', icon: '◈', label: 'Dashboard' },
  { to: '/students', icon: '◉', label: 'Students' },
  { to: '/coaches', icon: '◎', label: 'Coaches' },
  { to: '/teams', icon: '◆', label: 'Teams' },
  { to: '/sports', icon: '◐', label: 'Sports' },
  { to: '/parents', icon: '◑', label: 'Parents' },
];

const Sidebar = () => {
  const location = useLocation();
  return (
    <div style={{
      width: 240, background: '#0d1014', borderRight: '1px solid #1e2430',
      height: '100vh', position: 'fixed', left: 0, top: 0,
      display: 'flex', flexDirection: 'column', zIndex: 100
    }}>
      {/* Logo */}
      <div style={{ padding: '28px 24px 24px', borderBottom: '1px solid #1e2430' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 36, height: 36, background: '#f0b429', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20 }}>⚡</div>
          <div>
            <div style={{ fontFamily: 'Barlow Condensed', fontSize: 20, fontWeight: 800, letterSpacing: 2, color: '#e8eaf0' }}>SPORTSPRO</div>
            <div style={{ fontSize: 10, color: '#4a5568', letterSpacing: 1.5, textTransform: 'uppercase' }}>Management Suite</div>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav style={{ flex: 1, padding: '16px 12px', display: 'flex', flexDirection: 'column', gap: 4 }}>
        {navItems.map(({ to, icon, label }) => {
          const active = location.pathname === to;
          return (
            <Link key={to} to={to} style={{
              display: 'flex', alignItems: 'center', gap: 12, padding: '10px 14px',
              borderRadius: 8, textDecoration: 'none', transition: 'all 0.2s',
              background: active ? '#f0b42915' : 'transparent',
              borderLeft: active ? '3px solid #f0b429' : '3px solid transparent',
              color: active ? '#f0b429' : '#8892a4',
              fontSize: 14, fontWeight: active ? 600 : 400,
            }}>
              <span style={{ fontSize: 16 }}>{icon}</span>
              <span>{label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div style={{ padding: '16px 24px', borderTop: '1px solid #1e2430' }}>
        <div style={{ fontSize: 11, color: '#4a5568', letterSpacing: 0.5 }}>v2.0 · SportsPro</div>
      </div>
    </div>
  );
};

// ─── PAGE LAYOUT ───────────────────────────────────────────────────────────────
const PageLayout = ({ title, subtitle, actions, children }) => (
  <div style={{ marginLeft: 240, minHeight: '100vh', background: '#0a0c0f' }}>
    <div style={{ borderBottom: '1px solid #1e2430', padding: '28px 40px', background: '#0d1014', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
      <div>
        <h1 style={{ fontFamily: 'Barlow Condensed', fontSize: 32, fontWeight: 800, letterSpacing: 2, textTransform: 'uppercase', color: '#e8eaf0' }}>{title}</h1>
        {subtitle && <p style={{ fontSize: 13, color: '#8892a4', marginTop: 4 }}>{subtitle}</p>}
      </div>
      {actions && <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>{actions}</div>}
    </div>
    <div style={{ padding: '32px 40px' }} className="page-enter">{children}</div>
  </div>
);

// ─── STAT CARD ─────────────────────────────────────────────────────────────────
const StatCard = ({ label, value, icon, color = '#f0b429', sub }) => (
  <div style={{ background: '#111418', border: '1px solid #1e2430', borderRadius: 12, padding: '24px', position: 'relative', overflow: 'hidden' }}>
    <div style={{ position: 'absolute', top: 0, right: 0, width: 80, height: 80, background: `${color}08`, borderRadius: '0 12px 0 80px', display: 'flex', alignItems: 'flex-start', justifyContent: 'flex-end', padding: '14px 16px', fontSize: 22 }}>{icon}</div>
    <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: 1.5, textTransform: 'uppercase', color: '#8892a4', marginBottom: 8 }}>{label}</div>
    <div style={{ fontFamily: 'Barlow Condensed', fontSize: 42, fontWeight: 800, color, lineHeight: 1 }}>{value}</div>
    {sub && <div style={{ fontSize: 12, color: '#4a5568', marginTop: 6 }}>{sub}</div>}
  </div>
);

// ─── DATA TABLE ────────────────────────────────────────────────────────────────
const Table = ({ columns, data, onEdit, onDelete, emptyMsg = 'No records found' }) => (
  <div style={{ background: '#111418', border: '1px solid #1e2430', borderRadius: 12, overflow: 'hidden' }}>
    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
      <thead>
        <tr style={{ background: '#0d1014' }}>
          {columns.map(col => (
            <th key={col.key} style={{ padding: '12px 16px', textAlign: 'left', fontSize: 10, fontWeight: 700, letterSpacing: 1.5, textTransform: 'uppercase', color: '#4a5568', borderBottom: '1px solid #1e2430' }}>
              {col.label}
            </th>
          ))}
          <th style={{ padding: '12px 16px', textAlign: 'right', fontSize: 10, fontWeight: 700, letterSpacing: 1.5, textTransform: 'uppercase', color: '#4a5568', borderBottom: '1px solid #1e2430' }}>Actions</th>
        </tr>
      </thead>
      <tbody>
        {data.length === 0 ? (
          <tr><td colSpan={columns.length + 1} style={{ padding: 40, textAlign: 'center', color: '#4a5568', fontSize: 14 }}>{emptyMsg}</td></tr>
        ) : data.map((row, i) => (
          <tr key={row.id} style={{ borderBottom: '1px solid #1e243088', transition: 'background 0.15s' }}
            onMouseEnter={e => e.currentTarget.style.background = '#181c22'}
            onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
            {columns.map(col => (
              <td key={col.key} style={{ padding: '13px 16px', fontSize: 13, color: col.color || '#e8eaf0' }}>
                {col.render ? col.render(row[col.key], row) : (row[col.key] ?? '—')}
              </td>
            ))}
            <td style={{ padding: '13px 16px', textAlign: 'right' }}>
              <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
                {onEdit && <Btn variant="ghost" style={{ padding: '5px 12px', fontSize: 12 }} onClick={() => onEdit(row)}>Edit</Btn>}
                {onDelete && <Btn variant="danger" style={{ padding: '5px 12px', fontSize: 12 }} onClick={() => onDelete(row.id)}>Delete</Btn>}
              </div>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);

// ─── SEARCH BAR ────────────────────────────────────────────────────────────────
const SearchBar = ({ value, onChange, placeholder }) => (
  <div style={{ position: 'relative', flex: 1, maxWidth: 320 }}>
    <span style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#4a5568', fontSize: 14 }}>⌕</span>
    <input value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder || 'Search...'}
      style={{ width: '100%', padding: '9px 14px 9px 34px', background: '#111418', border: '1px solid #1e2430', borderRadius: 8, color: '#e8eaf0', fontSize: 13, outline: 'none' }}
      onFocus={e => e.target.style.borderColor = '#f0b429'}
      onBlur={e => e.target.style.borderColor = '#1e2430'}
    />
  </div>
);

// ─── DASHBOARD ─────────────────────────────────────────────────────────────────
const Dashboard = ({ showToast }) => {
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios.get(`${API}/stats`).then(res => { setStats(res.data); setLoading(false); }).catch(() => setLoading(false));
  }, []);

  const cards = [
    { label: 'Total Students', key: 'students', icon: '◉', color: '#3b82f6' },
    { label: 'Active Students', key: 'active_students', icon: '✦', color: '#22c55e' },
    { label: 'Coaches', key: 'coaches', icon: '◎', color: '#f0b429' },
    { label: 'Teams', key: 'teams', icon: '◆', color: '#a855f7' },
    { label: 'Sports', key: 'sports', icon: '◐', color: '#e85d04' },
    { label: 'Parents', key: 'parents', icon: '◑', color: '#06b6d4' },
  ];

  return (
    <PageLayout title="Dashboard" subtitle="Welcome back — here's an overview of your sports program">
      {loading ? (
        <div style={{ color: '#4a5568', fontSize: 14, padding: 40 }}>Loading stats...</div>
      ) : (
        <>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16, marginBottom: 32 }}>
            {cards.map(c => (
              <StatCard key={c.key} label={c.label} value={stats[c.key] ?? 0} icon={c.icon} color={c.color} />
            ))}
          </div>

          {/* Quick Nav */}
          <div style={{ background: '#111418', border: '1px solid #1e2430', borderRadius: 12, padding: 24 }}>
            <h3 style={{ fontFamily: 'Barlow Condensed', fontSize: 16, fontWeight: 700, letterSpacing: 1.5, textTransform: 'uppercase', color: '#8892a4', marginBottom: 16 }}>Quick Access</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 12 }}>
              {navItems.slice(1).map(({ to, icon, label }) => (
                <Link key={to} to={to} style={{
                  display: 'flex', alignItems: 'center', gap: 10, padding: '14px 18px',
                  background: '#181c22', border: '1px solid #1e2430', borderRadius: 8,
                  textDecoration: 'none', color: '#e8eaf0', fontSize: 14, fontWeight: 500,
                  transition: 'all 0.2s'
                }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = '#f0b429'; e.currentTarget.style.color = '#f0b429'; }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = '#1e2430'; e.currentTarget.style.color = '#e8eaf0'; }}>
                  <span style={{ fontSize: 18, color: '#f0b429' }}>{icon}</span> {label}
                </Link>
              ))}
            </div>
          </div>
        </>
      )}
    </PageLayout>
  );
};

// ─── GENERIC CRUD PAGE ─────────────────────────────────────────────────────────
const CrudPage = ({ title, subtitle, endpoint, columns, FormComponent, defaultForm, showToast }) => {
  const [items, setItems] = useState([]);
  const [search, setSearch] = useState('');
  const [modal, setModal] = useState(null); // null | 'add' | 'edit'
  const [editing, setEditing] = useState(null);
  const [extras, setExtras] = useState({});

  const refresh = useCallback(() => {
    axios.get(`${API}/${endpoint}?search=${search}`).then(res => setItems(res.data));
  }, [endpoint, search]);

  useEffect(() => { refresh(); }, [refresh]);

  // Load relational data for dropdowns
  useEffect(() => {
    if (['students', 'teams'].includes(endpoint)) {
      axios.get(`${API}/coaches`).then(r => setExtras(e => ({ ...e, coaches: r.data })));
      axios.get(`${API}/sports`).then(r => setExtras(e => ({ ...e, sports: r.data })));
    }
    if (endpoint === 'students') {
      axios.get(`${API}/parents`).then(r => setExtras(e => ({ ...e, parents: r.data })));
      axios.get(`${API}/teams`).then(r => setExtras(e => ({ ...e, teams: r.data })));
    }
  }, [endpoint]);

  const handleSave = async (form) => {
    try {
      if (editing) {
        await axios.put(`${API}/${endpoint}/${editing.id}`, form);
        showToast('Updated successfully', 'success');
      } else {
        await axios.post(`${API}/${endpoint}`, form);
        showToast('Added successfully', 'success');
      }
      setModal(null); setEditing(null); refresh();
    } catch {
      showToast('Something went wrong', 'error');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure?')) return;
    try {
      await axios.delete(`${API}/${endpoint}/${id}`);
      showToast('Deleted successfully', 'success');
      refresh();
    } catch {
      showToast('Delete failed', 'error');
    }
  };

  const openEdit = (item) => { setEditing(item); setModal('edit'); };

  return (
    <PageLayout
      title={title}
      subtitle={subtitle}
      actions={
        <>
          <SearchBar value={search} onChange={setSearch} placeholder={`Search ${title.toLowerCase()}...`} />
          <Btn onClick={() => { setEditing(null); setModal('add'); }}>+ Add New</Btn>
        </>
      }
    >
      <div style={{ marginBottom: 12, fontSize: 12, color: '#4a5568' }}>{items.length} record{items.length !== 1 ? 's' : ''} found</div>
      <Table columns={columns} data={items} onEdit={openEdit} onDelete={handleDelete} />

      {(modal === 'add' || modal === 'edit') && (
        <Modal title={modal === 'edit' ? `Edit ${title.slice(0, -1)}` : `Add ${title.slice(0, -1)}`} onClose={() => { setModal(null); setEditing(null); }}>
          <FormComponent
            initial={editing || defaultForm}
            extras={extras}
            onSave={handleSave}
            onCancel={() => { setModal(null); setEditing(null); }}
          />
        </Modal>
      )}
    </PageLayout>
  );
};

// ─── FORM: Generic Save/Cancel ─────────────────────────────────────────────────
const FormActions = ({ onCancel }) => (
  <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 20, paddingTop: 16, borderTop: '1px solid #1e2430' }}>
    <Btn variant="ghost" onClick={onCancel}>Cancel</Btn>
    <Btn type="submit">Save</Btn>
  </div>
);

// ─── STUDENT FORM ──────────────────────────────────────────────────────────────
const StudentForm = ({ initial, extras, onSave, onCancel }) => {
  const [form, setForm] = useState(initial || {});
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));
  return (
    <form onSubmit={e => { e.preventDefault(); onSave(form); }}>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        <Field label="Full Name *"><Input required value={form.name || ''} onChange={e => set('name', e.target.value)} placeholder="John Doe" /></Field>
        <Field label="Date of Birth"><Input type="date" value={form.dob || ''} onChange={e => set('dob', e.target.value)} /></Field>
        <Field label="Email"><Input type="email" value={form.email || ''} onChange={e => set('email', e.target.value)} placeholder="john@example.com" /></Field>
        <Field label="Phone"><Input value={form.phone || ''} onChange={e => set('phone', e.target.value)} placeholder="+91 98765 43210" /></Field>
        <Field label="Gender">
          <Select value={form.gender || ''} onChange={e => set('gender', e.target.value)}>
            <option value="">Select...</option>
            <option value="Male">Male</option>
            <option value="Female">Female</option>
            <option value="Other">Other</option>
          </Select>
        </Field>
        <Field label="Status">
          <Select value={form.status || 'active'} onChange={e => set('status', e.target.value)}>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </Select>
        </Field>
        <Field label="Parent">
          <Select value={form.parent_id || ''} onChange={e => set('parent_id', e.target.value)}>
            <option value="">No Parent</option>
            {(extras.parents || []).map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
          </Select>
        </Field>
        <Field label="Team">
          <Select value={form.team_id || ''} onChange={e => set('team_id', e.target.value)}>
            <option value="">No Team</option>
            {(extras.teams || []).map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
          </Select>
        </Field>
      </div>
      <FormActions onCancel={onCancel} />
    </form>
  );
};

// ─── COACH FORM ────────────────────────────────────────────────────────────────
const CoachForm = ({ initial, onSave, onCancel }) => {
  const [form, setForm] = useState(initial || {});
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));
  return (
    <form onSubmit={e => { e.preventDefault(); onSave(form); }}>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        <Field label="Full Name *"><Input required value={form.name || ''} onChange={e => set('name', e.target.value)} placeholder="Coach Name" /></Field>
        <Field label="Specialization"><Input value={form.specialization || ''} onChange={e => set('specialization', e.target.value)} placeholder="e.g. Swimming" /></Field>
        <Field label="Experience (years)"><Input type="number" min="0" value={form.experience || ''} onChange={e => set('experience', e.target.value)} placeholder="0" /></Field>
        <Field label="Email"><Input type="email" value={form.email || ''} onChange={e => set('email', e.target.value)} placeholder="coach@example.com" /></Field>
        <Field label="Phone"><Input value={form.phone || ''} onChange={e => set('phone', e.target.value)} placeholder="+91 98765 43210" /></Field>
      </div>
      <Field label="Bio"><Textarea value={form.bio || ''} onChange={e => set('bio', e.target.value)} placeholder="Brief background..." /></Field>
      <FormActions onCancel={onCancel} />
    </form>
  );
};

// ─── TEAM FORM ─────────────────────────────────────────────────────────────────
const TeamForm = ({ initial, extras, onSave, onCancel }) => {
  const [form, setForm] = useState(initial || {});
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));
  return (
    <form onSubmit={e => { e.preventDefault(); onSave(form); }}>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        <Field label="Team Name *"><Input required value={form.name || ''} onChange={e => set('name', e.target.value)} placeholder="Team Name" /></Field>
        <Field label="Age Group"><Input value={form.age_group || ''} onChange={e => set('age_group', e.target.value)} placeholder="e.g. U-14" /></Field>
        <Field label="Sport">
          <Select value={form.sport_id || ''} onChange={e => set('sport_id', e.target.value)}>
            <option value="">Select Sport</option>
            {(extras.sports || []).map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
          </Select>
        </Field>
        <Field label="Coach">
          <Select value={form.coach_id || ''} onChange={e => set('coach_id', e.target.value)}>
            <option value="">Select Coach</option>
            {(extras.coaches || []).map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </Select>
        </Field>
      </div>
      <Field label="Description"><Textarea value={form.description || ''} onChange={e => set('description', e.target.value)} placeholder="Team description..." /></Field>
      <FormActions onCancel={onCancel} />
    </form>
  );
};

// ─── SPORT FORM ────────────────────────────────────────────────────────────────
const SportForm = ({ initial, onSave, onCancel }) => {
  const [form, setForm] = useState(initial || {});
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));
  return (
    <form onSubmit={e => { e.preventDefault(); onSave(form); }}>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        <Field label="Sport Name *"><Input required value={form.name || ''} onChange={e => set('name', e.target.value)} placeholder="e.g. Football" /></Field>
        <Field label="Category"><Input value={form.category || ''} onChange={e => set('category', e.target.value)} placeholder="e.g. Team Sport" /></Field>
        <Field label="Max Team Size"><Input type="number" min="1" value={form.max_team_size || ''} onChange={e => set('max_team_size', e.target.value)} placeholder="20" /></Field>
      </div>
      <Field label="Description"><Textarea value={form.description || ''} onChange={e => set('description', e.target.value)} placeholder="Sport description..." /></Field>
      <FormActions onCancel={onCancel} />
    </form>
  );
};

// ─── PARENT FORM ───────────────────────────────────────────────────────────────
const ParentForm = ({ initial, onSave, onCancel }) => {
  const [form, setForm] = useState(initial || {});
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));
  return (
    <form onSubmit={e => { e.preventDefault(); onSave(form); }}>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        <Field label="Full Name *"><Input required value={form.name || ''} onChange={e => set('name', e.target.value)} placeholder="Parent Name" /></Field>
        <Field label="Phone"><Input value={form.phone || ''} onChange={e => set('phone', e.target.value)} placeholder="+91 98765 43210" /></Field>
        <Field label="Email"><Input type="email" value={form.email || ''} onChange={e => set('email', e.target.value)} placeholder="parent@example.com" /></Field>
      </div>
      <Field label="Address"><Textarea value={form.address || ''} onChange={e => set('address', e.target.value)} placeholder="Full address..." /></Field>
      <FormActions onCancel={onCancel} />
    </form>
  );
};

// ─── PAGE DEFINITIONS ──────────────────────────────────────────────────────────
const StudentsPage = ({ showToast }) => (
  <CrudPage
    title="Students" subtitle="Manage enrolled athletes and their details"
    endpoint="students" showToast={showToast}
    FormComponent={StudentForm}
    columns={[
      { key: 'name', label: 'Name', render: (v) => <strong style={{ color: '#e8eaf0' }}>{v}</strong> },
      { key: 'email', label: 'Email', color: '#8892a4' },
      { key: 'gender', label: 'Gender', render: v => v ? <Badge label={v} color="#3b82f6" /> : '—' },
      { key: 'team_name', label: 'Team', render: v => v ? <Badge label={v} color="#a855f7" /> : '—' },
      { key: 'parent_name', label: 'Parent', color: '#8892a4' },
      { key: 'status', label: 'Status', render: v => <Badge label={v || 'active'} color={v === 'inactive' ? '#ef4444' : '#22c55e'} /> },
    ]}
  />
);

const CoachesPage = ({ showToast }) => (
  <CrudPage
    title="Coaches" subtitle="Manage coaching staff and their specializations"
    endpoint="coaches" showToast={showToast}
    FormComponent={CoachForm}
    columns={[
      { key: 'name', label: 'Name', render: v => <strong style={{ color: '#e8eaf0' }}>{v}</strong> },
      { key: 'specialization', label: 'Specialization', render: v => v ? <Badge label={v} color="#f0b429" /> : '—' },
      { key: 'experience', label: 'Experience', render: v => v ? `${v} yrs` : '—', color: '#8892a4' },
      { key: 'email', label: 'Email', color: '#8892a4' },
      { key: 'team_count', label: 'Teams', render: v => <Badge label={`${v} teams`} color="#3b82f6" /> },
    ]}
  />
);

const TeamsPage = ({ showToast }) => (
  <CrudPage
    title="Teams" subtitle="Organize athletes into structured training groups"
    endpoint="teams" showToast={showToast}
    FormComponent={TeamForm}
    columns={[
      { key: 'name', label: 'Team Name', render: v => <strong style={{ color: '#e8eaf0' }}>{v}</strong> },
      { key: 'age_group', label: 'Age Group', render: v => v ? <Badge label={v} color="#06b6d4" /> : '—' },
      { key: 'sport_name', label: 'Sport', render: v => v ? <Badge label={v} color="#e85d04" /> : '—' },
      { key: 'coach_name', label: 'Coach', color: '#8892a4' },
      { key: 'student_count', label: 'Students', render: v => <Badge label={`${v} athletes`} color="#a855f7" /> },
    ]}
  />
);

const SportsPage = ({ showToast }) => (
  <CrudPage
    title="Sports" subtitle="Configure available sports programs and categories"
    endpoint="sports" showToast={showToast}
    FormComponent={SportForm}
    columns={[
      { key: 'name', label: 'Sport', render: v => <strong style={{ color: '#e8eaf0' }}>{v}</strong> },
      { key: 'category', label: 'Category', render: v => v ? <Badge label={v} color="#e85d04" /> : '—' },
      { key: 'max_team_size', label: 'Max Size', color: '#8892a4', render: v => v ? `${v} players` : '—' },
      { key: 'team_count', label: 'Teams', render: v => <Badge label={`${v} teams`} color="#3b82f6" /> },
    ]}
  />
);

const ParentsPage = ({ showToast }) => (
  <CrudPage
    title="Parents" subtitle="Manage parent and guardian contact information"
    endpoint="parents" showToast={showToast}
    FormComponent={ParentForm}
    columns={[
      { key: 'name', label: 'Name', render: v => <strong style={{ color: '#e8eaf0' }}>{v}</strong> },
      { key: 'email', label: 'Email', color: '#8892a4' },
      { key: 'phone', label: 'Phone', color: '#8892a4' },
      { key: 'student_count', label: 'Students', render: v => <Badge label={`${v} students`} color="#22c55e" /> },
    ]}
  />
);

// ─── APP ROOT ──────────────────────────────────────────────────────────────────
export default function App() {
  const [toast, setToast] = useState(null);
  const showToast = (message, type = 'info') => setToast({ message, type });

  return (
    <Router>
      <GlobalStyle />
      <Sidebar />
      {toast && <Toast {...toast} onClose={() => setToast(null)} />}
      <Routes>
        <Route path="/" element={<Dashboard showToast={showToast} />} />
        <Route path="/students" element={<StudentsPage showToast={showToast} />} />
        <Route path="/coaches" element={<CoachesPage showToast={showToast} />} />
        <Route path="/teams" element={<TeamsPage showToast={showToast} />} />
        <Route path="/sports" element={<SportsPage showToast={showToast} />} />
        <Route path="/parents" element={<ParentsPage showToast={showToast} />} />
      </Routes>
    </Router>
  );
}