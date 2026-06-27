import { Suspense, lazy, useEffect } from 'react'
import { Routes, Route, useLocation, Link, Navigate } from 'react-router-dom'
import { useERPStore } from '@/store/erpStore'
import { t } from '@/i18n'

// Auth pages
const Login          = lazy(() => import('@/pages/auth/Login'))
const Register       = lazy(() => import('@/pages/auth/Register'))
const ForgotPassword = lazy(() => import('@/pages/auth/ForgotPassword'))
const ResetPassword  = lazy(() => import('@/pages/auth/ResetPassword'))

// ERP pages
const Dashboard   = lazy(() => import('@/pages/Dashboard'))
const Accounting  = lazy(() => import('@/pages/Accounting'))
const HR          = lazy(() => import('@/pages/HR'))
const Projects    = lazy(() => import('@/pages/Projects'))
const CRM         = lazy(() => import('@/pages/CRM'))
const Inventory   = lazy(() => import('@/pages/Inventory'))
const Purchasing  = lazy(() => import('@/pages/Purchasing'))
const POS         = lazy(() => import('@/pages/POS'))
const Contracts   = lazy(() => import('@/pages/Contracts'))
const Settings    = lazy(() => import('@/pages/Settings'))
const Users       = lazy(() => import('@/pages/Users'))
const Reports     = lazy(() => import('@/pages/Reports'))
const AuditLog    = lazy(() => import('@/pages/AuditLog'))
const NotFound    = lazy(() => import('@/pages/NotFound'))

const MODULES = [
  { path:'/dashboard',  key:'dashboard',  icon:'⊞',  color:'#4F46E5' },
  { path:'/accounting', key:'accounting', icon:'💰',  color:'#059669' },
  { path:'/hr',         key:'hr',         icon:'👥',  color:'#DC2626' },
  { path:'/projects',   key:'projects',   icon:'📋',  color:'#D97706' },
  { path:'/crm',        key:'crm',        icon:'🤝',  color:'#7C3AED' },
  { path:'/inventory',  key:'inventory',  icon:'📦',  color:'#0891B2' },
  { path:'/purchasing', key:'purchasing', icon:'🛒',  color:'#BE185D' },
  { path:'/pos',        key:'pos',        icon:'🏪',  color:'#EA580C' },
  { path:'/contracts',  key:'contracts',  icon:'📄',  color:'#15803D' },
  { path:'/reports',    key:'reports',    icon:'📊',  color:'#6366F1' },
]
const ADMIN_MODULES = [
  { path:'/users',    key:'users',    icon:'👤',  color:'#374151' },
  { path:'/audit',    key:'audit',    icon:'📝',  color:'#374151' },
  { path:'/settings', key:'settings', icon:'⚙️',  color:'#374151' },
]

const CSS = `
  .layout{display:flex;height:100vh;overflow:hidden}
  .sidebar{width:var(--sidebar-w,240px);background:var(--sidebar-bg,#1e1b4b);display:flex;flex-direction:column;height:100vh;flex-shrink:0;transition:width .25s cubic-bezier(.4,0,.2,1);overflow:hidden}
  .sidebar.collapsed{width:64px}
  .s-head{padding:14px;display:flex;align-items:center;gap:10px;border-bottom:1px solid rgba(255,255,255,0.06);min-height:60px;flex-shrink:0}
  .s-logo{width:34px;height:34px;background:linear-gradient(135deg,#4F46E5,#7C3AED);border-radius:9px;display:flex;align-items:center;justify-content:center;font-size:17px;flex-shrink:0;box-shadow:0 4px 14px rgba(79,70,229,0.4)}
  .s-brand{overflow:hidden;flex:1}
  .s-name{color:#fff;font-weight:800;font-size:15px;white-space:nowrap}
  .s-tagline{color:rgba(255,255,255,0.35);font-size:10px;margin-top:1px;white-space:nowrap}
  .s-nav{flex:1;padding:8px;overflow-y:auto;display:flex;flex-direction:column;gap:1px}
  .s-nav::-webkit-scrollbar{display:none}
  .s-section{padding:6px 12px 4px;font-size:10px;color:rgba(255,255,255,0.25);font-weight:700;text-transform:uppercase;letter-spacing:.08em;white-space:nowrap;overflow:hidden}
  .nav-a{display:flex;align-items:center;gap:10px;padding:9px 11px;border-radius:8px;color:rgba(255,255,255,0.5);font-size:13px;font-weight:500;transition:all .15s;white-space:nowrap;overflow:hidden;cursor:pointer;text-decoration:none}
  .nav-a:hover{background:rgba(255,255,255,0.07);color:rgba(255,255,255,0.9)}
  .nav-a.on{background:rgba(79,70,229,0.28);color:#a5b4fc;border-right:3px solid #818cf8;font-weight:600}
  .nav-icon{font-size:17px;flex-shrink:0;width:20px;text-align:center;line-height:1}
  .s-foot{padding:8px;border-top:1px solid rgba(255,255,255,0.06);flex-shrink:0}
  .u-card{display:flex;align-items:center;gap:9px;padding:9px 11px;border-radius:8px;cursor:pointer;color:rgba(255,255,255,0.55);transition:all .15s;white-space:nowrap;overflow:hidden;text-decoration:none}
  .u-card:hover{background:rgba(255,255,255,0.06);color:rgba(255,255,255,0.85)}
  .u-av{width:30px;height:30px;border-radius:50%;background:linear-gradient(135deg,#4F46E5,#7C3AED);display:flex;align-items:center;justify-content:center;color:#fff;font-size:12px;font-weight:700;flex-shrink:0;box-shadow:0 2px 8px rgba(79,70,229,0.35)}
  .col-btn{background:none;border:none;cursor:pointer;color:rgba(255,255,255,0.3);font-size:16px;padding:4px;line-height:1;flex-shrink:0;transition:color .15s}
  .col-btn:hover{color:#fff}
  .main{flex:1;display:flex;flex-direction:column;overflow:hidden;min-width:0}
  .topbar{height:60px;background:#fff;border-bottom:1px solid #e2e8f0;display:flex;align-items:center;padding:0 20px;gap:14px;flex-shrink:0;box-shadow:0 1px 3px rgba(0,0,0,0.04)}
  .tb-title{font-size:15px;font-weight:700;color:#1e293b}
  .tb-right{display:flex;align-items:center;gap:10px;margin-right:auto}
  .tb-badge{display:inline-flex;align-items:center;gap:6px;padding:5px 12px;background:#f1f5f9;border-radius:20px;font-size:12px;font-weight:600;color:#475569}
  .tb-btn{width:36px;height:36px;border-radius:8px;background:#f8fafc;border:1px solid #e2e8f0;display:flex;align-items:center;justify-content:center;cursor:pointer;color:#64748b;font-size:16px;transition:all .15s;position:relative}
  .tb-btn:hover{background:#f1f5f9;border-color:#cbd5e1;color:#334155}
  .notif-dot{position:absolute;top:-2px;right:-2px;width:8px;height:8px;background:#ef4444;border-radius:50%;border:2px solid #fff}
  .content{flex:1;overflow-y:auto;padding:20px;animation:fadeIn .2s ease}
  .page-loader{display:flex;align-items:center;justify-content:center;height:100vh;background:#f8fafc;flex-direction:column;gap:14px}
  .spinner{width:40px;height:40px;border:3px solid #e2e8f0;border-top-color:#4F46E5;border-radius:50%;animation:spin .8s linear infinite}
  @media(max-width:768px){
    .sidebar{position:fixed;z-index:300;transform:translateX(100%);transition:transform .25s;right:0}
    .sidebar.open{transform:translateX(0)}
    .content{padding:14px}
    .topbar{padding:0 14px}
  }
`

function Spinner({ text = 'جاري التحميل...' }) {
  return (
    <div className="page-loader">
      <div className="spinner"/>
      <p style={{color:'#94a3b8',fontSize:'13px'}}>{text}</p>
    </div>
  )
}

function Layout({ children }) {
  const { user, company, clearAuth, lang, theme, sidebarCollapsed, toggleSidebar, unreadNotifications } = useERPStore()
  const location = useLocation()
  const tr = k => t(k, lang)
  const isAdmin = ['superadmin','admin'].includes(user?.role)

  const logout = () => { clearAuth(); window.location.href = '/login' }

  const allNav = isAdmin ? [...MODULES, ...ADMIN_MODULES] : MODULES

  const currentPage = allNav.find(m => location.pathname.startsWith(m.path))

  return (
    <>
      <style>{CSS}</style>
      <div className="layout" style={{direction: ['ar','ur'].includes(lang) ? 'rtl' : 'ltr'}}>
        <div className={'sidebar' + (sidebarCollapsed ? ' collapsed' : '')}>
          <div className="s-head">
            <div className="s-logo">🏢</div>
            {!sidebarCollapsed && (
              <div className="s-brand">
                <div className="s-name">WasselERP</div>
                <div className="s-tagline">{company?.name || 'Enterprise'}</div>
              </div>
            )}
            <button className="col-btn" onClick={toggleSidebar} title="طي القائمة">
              {sidebarCollapsed ? '›' : '‹'}
            </button>
          </div>

          <nav className="s-nav">
            {!sidebarCollapsed && <div className="s-section">الوحدات</div>}
            {MODULES.map(m => (
              <Link key={m.path} to={m.path} className={'nav-a' + (location.pathname.startsWith(m.path) ? ' on' : '')}>
                <span className="nav-icon">{m.icon}</span>
                {!sidebarCollapsed && <span>{tr(m.key)}</span>}
              </Link>
            ))}
            {isAdmin && (
              <>
                {!sidebarCollapsed && <div className="s-section" style={{marginTop:'8px'}}>الإدارة</div>}
                {ADMIN_MODULES.map(m => (
                  <Link key={m.path} to={m.path} className={'nav-a' + (location.pathname.startsWith(m.path) ? ' on' : '')}>
                    <span className="nav-icon">{m.icon}</span>
                    {!sidebarCollapsed && <span>{tr(m.key)}</span>}
                  </Link>
                ))}
              </>
            )}
          </nav>

          <div className="s-foot">
            <div className="u-card" onClick={logout} title={tr('logout')}>
              <div className="u-av">{user?.name?.[0] || 'أ'}</div>
              {!sidebarCollapsed && (
                <div style={{overflow:'hidden',flex:1}}>
                  <div style={{color:'rgba(255,255,255,0.85)',fontSize:'12px',fontWeight:'700',overflow:'hidden',textOverflow:'ellipsis'}}>{user?.name}</div>
                  <div style={{color:'rgba(255,255,255,0.35)',fontSize:'10px',marginTop:'1px',overflow:'hidden',textOverflow:'ellipsis'}}>{tr(user?.role||'employee')}</div>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="main">
          <div className="topbar">
            <div className="tb-title">{currentPage ? tr(currentPage.key) : 'WasselERP'}</div>
            <div className="tb-right">
              {company?.name && <span className="tb-badge">🏢 {company.name}</span>}
              <div className="tb-btn" title={tr('notifications')}>
                🔔
                {unreadNotifications > 0 && <span className="notif-dot"/>}
              </div>
              <div className="tb-btn" title={tr('settings')} onClick={() => window.location.href = '/settings'}>⚙️</div>
            </div>
          </div>
          <div className="content">
            <Suspense fallback={<div style={{textAlign:'center',padding:'3rem',color:'#94a3b8'}}>⏳ {tr('loading')}</div>}>
              {children}
            </Suspense>
          </div>
        </div>
      </div>
    </>
  )
}

function Protected({ children }) {
  const { isAuth, isLoading } = useERPStore()
  if (isLoading) return <Spinner />
  if (!isAuth) return <Navigate to="/login" replace />
  return <Layout>{children}</Layout>
}

export default function App() {
  return (
    <Suspense fallback={<Spinner />}>
      <Routes>
        {/* Public */}
        <Route path="/login"            element={<Login />} />
        <Route path="/register"         element={<Register />} />
        <Route path="/forgot-password"  element={<ForgotPassword />} />
        <Route path="/reset-password"   element={<ResetPassword />} />
        {/* Protected */}
        <Route path="/"             element={<Navigate to="/dashboard" replace />} />
        <Route path="/dashboard"    element={<Protected><Dashboard /></Protected>} />
        <Route path="/accounting/*" element={<Protected><Accounting /></Protected>} />
        <Route path="/hr/*"         element={<Protected><HR /></Protected>} />
        <Route path="/projects/*"   element={<Protected><Projects /></Protected>} />
        <Route path="/crm/*"        element={<Protected><CRM /></Protected>} />
        <Route path="/inventory/*"  element={<Protected><Inventory /></Protected>} />
        <Route path="/purchasing/*" element={<Protected><Purchasing /></Protected>} />
        <Route path="/pos/*"        element={<Protected><POS /></Protected>} />
        <Route path="/contracts/*"  element={<Protected><Contracts /></Protected>} />
        <Route path="/reports/*"    element={<Protected><Reports /></Protected>} />
        <Route path="/audit"        element={<Protected><AuditLog /></Protected>} />
        <Route path="/users"        element={<Protected><Users /></Protected>} />
        <Route path="/settings/*"   element={<Protected><Settings /></Protected>} />
        <Route path="*"             element={<Protected><NotFound /></Protected>} />
      </Routes>
    </Suspense>
  )
}
