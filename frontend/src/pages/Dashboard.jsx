import { useEffect, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, AreaChart, Area, PieChart, Pie, Cell, Legend } from 'recharts'
import { useERPStore } from '@/store/erpStore'
import { t, locale } from '@/i18n'
import api from '@/api/axiosInstance'
import '@/styles/design.css'

const COLORS = ['#4F46E5','#059669','#D97706','#DC2626','#0891B2','#7C3AED']

function StatCard({ icon, label, value, sub, color='#4F46E5', change, currency }) {
  return (
    <div className="stat-card">
      <div className="stat-header">
        <span className="stat-label">{label}</span>
        <div className="stat-icon" style={{ background: color + '18' }}>{icon}</div>
      </div>
      <div className="stat-value">
        {currency ? (typeof value === 'number' ? value.toLocaleString() : value) : value}
        {currency && <span style={{ fontSize:'14px', fontWeight:'500', color:'var(--gray-400)', marginRight:'4px' }}>{currency}</span>}
      </div>
      {sub && <div className="stat-sub">{sub}</div>}
      {change !== undefined && (
        <div className={`stat-change ${change >= 0 ? 'up' : 'down'}`}>
          {change >= 0 ? '↑' : '↓'} {Math.abs(change)}% من الشهر الماضي
        </div>
      )}
    </div>
  )
}

function QuickAction({ icon, label, path, color }) {
  return (
    <a href={path} style={{ display:'flex', alignItems:'center', gap:'10px', padding:'12px 14px', background:'var(--gray-50)', borderRadius:'var(--radius)', border:'1px solid var(--gray-200)', textDecoration:'none', transition:'all .15s', cursor:'pointer' }}
      onMouseOver={e=>e.currentTarget.style.background='var(--gray-100)'}
      onMouseOut={e=>e.currentTarget.style.background='var(--gray-50)'}>
      <span style={{ fontSize:'20px' }}>{icon}</span>
      <span style={{ fontSize:'13px', fontWeight:'600', color:'var(--gray-700)' }}>{label}</span>
    </a>
  )
}

const QUICK_ACTIONS = [
  { icon:'📄', label:'فاتورة جديدة',   path:'/accounting' },
  { icon:'👤', label:'موظف جديد',       path:'/hr' },
  { icon:'📋', label:'مشروع جديد',     path:'/projects' },
  { icon:'🤝', label:'عميل جديد',       path:'/crm' },
  { icon:'📦', label:'منتج جديد',       path:'/inventory' },
  { icon:'🛒', label:'طلب شراء',        path:'/purchasing' },
  { icon:'📄', label:'عقد جديد',        path:'/contracts' },
  { icon:'🏪', label:'فتح الكاشير',     path:'/pos' },
]

export default function Dashboard() {
  const { user, company, lang } = useERPStore()
  const tr  = k => t(k, lang)
  const cur = company?.currency || 'SAR'
  const fmt = n => (n || 0).toLocaleString(locale(lang), { maximumFractionDigits: 0 })

  const { data: overview = {}, isLoading } = useQuery({
    queryKey: ['dashboard-overview'],
    queryFn: () => api.get('/dashboard/overview').then(r => r.data.data),
    staleTime: 60000,
  })

  const { data: chartData = [] } = useQuery({
    queryKey: ['revenue-chart'],
    queryFn: () => api.get('/dashboard/revenue-chart').then(r => r.data.data),
    staleTime: 60000,
  })

  const { data: activity = [] } = useQuery({
    queryKey: ['dashboard-activity'],
    queryFn: () => api.get('/dashboard/activity').then(r => r.data.data),
    staleTime: 30000,
  })

  const PIE_DATA = [
    { name: 'إيرادات', value: overview.finance?.revenueThisMonth || 0 },
    { name: 'مصروفات', value: overview.finance?.expensesThisMonth || 0 },
  ]

  return (
    <div style={{ animation:'fadeIn .2s ease' }}>
      {/* Header */}
      <div style={{ marginBottom:'20px' }}>
        <h1 style={{ fontSize:'20px', fontWeight:'800', color:'var(--gray-800)', marginBottom:'4px' }}>
          👋 {tr('welcomeBack')}, {user?.name?.split(' ')[0]}
        </h1>
        <p style={{ color:'var(--gray-500)', fontSize:'13px' }}>
          {new Date().toLocaleDateString(locale(lang), { weekday:'long', year:'numeric', month:'long', day:'numeric' })}
          {company && <span> — <strong>{company.name}</strong></span>}
        </p>
      </div>

      {/* KPI Cards */}
      <div className="stats-grid" style={{ gridTemplateColumns:'repeat(auto-fit,minmax(190px,1fr))' }}>
        <StatCard icon="💰" label={tr('revenue') + ' — ' + tr('thisMonth')} value={fmt(overview.finance?.revenueThisMonth)} currency={cur} color="#4F46E5" change={12}/>
        <StatCard icon="📤" label={tr('expenses') + ' — ' + tr('thisMonth')} value={fmt(overview.finance?.expensesThisMonth)} currency={cur} color="#DC2626"/>
        <StatCard icon="📄" label={tr('pendingInvoices')} value={overview.finance?.pendingInvoices || 0} sub="تنتظر الدفع" color="#D97706"/>
        <StatCard icon="⚠️" label={tr('overdueInvoices')} value={overview.finance?.overdueInvoices || 0} sub="تجاوزت الاستحقاق" color="#DC2626"/>
        <StatCard icon="👥" label={tr('employees')} value={overview.hr?.activeEmployees || 0} sub={`إجمالي: ${overview.hr?.totalEmployees || 0}`} color="#059669"/>
        <StatCard icon="🏖️" label="طلبات إجازة" value={overview.hr?.pendingLeaves || 0} sub="قيد المراجعة" color="#0891B2"/>
        <StatCard icon="🤝" label={tr('customers')} value={overview.crm?.totalCustomers || 0} sub={`${overview.crm?.newLeadsThisMonth || 0} عميل جديد`} color="#7C3AED"/>
        <StatCard icon="📦" label="مخزون منخفض" value={overview.inventory?.lowStockProducts || 0} sub="يحتاج إعادة طلب" color="#EA580C"/>
      </div>

      {/* Charts Row */}
      <div style={{ display:'grid', gridTemplateColumns:'2fr 1fr', gap:'14px', marginBottom:'16px' }}>
        {/* Revenue Chart */}
        <div className="card">
          <div className="card-header">
            <div className="card-title">📊 الإيرادات والمصروفات (12 شهر)</div>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={chartData} margin={{ top:5, right:5, bottom:5, left:5 }}>
              <defs>
                <linearGradient id="revenue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#4F46E5" stopOpacity={0.15}/>
                  <stop offset="95%" stopColor="#4F46E5" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="expenses" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#DC2626" stopOpacity={0.1}/>
                  <stop offset="95%" stopColor="#DC2626" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <XAxis dataKey="month" tick={{ fontSize:11, fill:'var(--gray-400)' }} axisLine={false} tickLine={false}/>
              <YAxis tick={{ fontSize:11, fill:'var(--gray-400)' }} axisLine={false} tickLine={false} tickFormatter={v => (v/1000).toFixed(0) + 'k'}/>
              <Tooltip formatter={(v) => [fmt(v) + ' ' + cur]} contentStyle={{ fontSize:'12px', borderRadius:'8px', border:'1px solid var(--gray-200)' }}/>
              <Area type="monotone" dataKey="revenue" stroke="#4F46E5" strokeWidth={2} fill="url(#revenue)" name="إيرادات"/>
              <Area type="monotone" dataKey="expenses" stroke="#DC2626" strokeWidth={2} fill="url(#expenses)" name="مصروفات"/>
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Distribution Pie */}
        <div className="card">
          <div className="card-header">
            <div className="card-title">🎯 هذا الشهر</div>
          </div>
          <ResponsiveContainer width="100%" height={160}>
            <PieChart>
              <Pie data={PIE_DATA} cx="50%" cy="50%" innerRadius={50} outerRadius={72} dataKey="value" paddingAngle={3}>
                {PIE_DATA.map((_,i) => <Cell key={i} fill={['#4F46E5','#DC2626'][i]} strokeWidth={0}/>)}
              </Pie>
              <Tooltip formatter={v => fmt(v) + ' ' + cur} contentStyle={{ fontSize:'12px', borderRadius:'8px' }}/>
            </PieChart>
          </ResponsiveContainer>
          <div style={{ display:'flex', flexDirection:'column', gap:'6px' }}>
            {PIE_DATA.map((e,i) => (
              <div key={i} style={{ display:'flex', alignItems:'center', gap:'8px', fontSize:'12px' }}>
                <div style={{ width:'10px', height:'10px', borderRadius:'2px', background:['#4F46E5','#DC2626'][i], flexShrink:0 }}/>
                <span style={{ flex:1, color:'var(--gray-600)' }}>{e.name}</span>
                <span style={{ fontWeight:'700', color:'var(--gray-800)' }}>{fmt(e.value)}</span>
              </div>
            ))}
            {PIE_DATA[0].value > 0 && PIE_DATA[1].value > 0 && (
              <div style={{ display:'flex', alignItems:'center', gap:'8px', fontSize:'12px', paddingTop:'6px', borderTop:'1px solid var(--gray-100)' }}>
                <div style={{ width:'10px', height:'10px', borderRadius:'2px', background:'#059669', flexShrink:0 }}/>
                <span style={{ flex:1, color:'var(--gray-600)' }}>صافي الربح</span>
                <span style={{ fontWeight:'700', color:'#059669' }}>{fmt(PIE_DATA[0].value - PIE_DATA[1].value)}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Bottom Row */}
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'14px' }}>
        {/* Quick Actions */}
        <div className="card">
          <div className="card-title" style={{ marginBottom:'14px' }}>⚡ إجراءات سريعة</div>
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'8px' }}>
            {QUICK_ACTIONS.map((a,i) => <QuickAction key={i} {...a}/>)}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="card">
          <div className="card-title" style={{ marginBottom:'14px' }}>📝 آخر الأنشطة</div>
          <div style={{ display:'flex', flexDirection:'column', gap:'10px', maxHeight:'240px', overflowY:'auto' }}>
            {activity.length === 0 ? (
              <p style={{ color:'var(--gray-400)', fontSize:'13px', textAlign:'center', padding:'20px' }}>لا توجد أنشطة بعد</p>
            ) : activity.map((a,i) => (
              <div key={i} style={{ display:'flex', gap:'10px', alignItems:'flex-start' }}>
                <div style={{ width:'28px', height:'28px', borderRadius:'50%', background:'var(--gray-100)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'12px', flexShrink:0 }}>
                  {a.action==='CREATE'?'✨':a.action==='UPDATE'?'✏️':a.action==='DELETE'?'🗑️':a.action==='LOGIN'?'🔑':'📝'}
                </div>
                <div style={{ flex:1, minWidth:0 }}>
                  <div style={{ fontSize:'12px', color:'var(--gray-700)', fontWeight:'600', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>
                    {a.userName} — {a.module}
                  </div>
                  <div style={{ fontSize:'11px', color:'var(--gray-400)', marginTop:'1px' }}>
                    {new Date(a.createdAt).toLocaleString(locale(lang), { month:'short', day:'numeric', hour:'2-digit', minute:'2-digit' })}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
