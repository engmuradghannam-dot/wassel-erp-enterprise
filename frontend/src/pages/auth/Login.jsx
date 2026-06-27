import { useState, useRef, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useMutation } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import api from '@/api/axiosInstance'
import { useERPStore } from '@/store/erpStore'
import { LANGS, t } from '@/i18n'

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || ''

function PwField({ value, onChange, label, placeholder }) {
  const [vis, setVis] = useState(false)
  return (
    <div style={S.fg}>
      <label style={S.lbl}>{label}</label>
      <div style={{ position:'relative' }}>
        <input style={{ ...S.inp, paddingLeft:'44px' }}
          type={vis?'text':'password'} value={value} onChange={onChange}
          placeholder={placeholder} required autoComplete="current-password" />
        <button type="button" onClick={()=>setVis(v=>!v)}
          style={{ position:'absolute', left:'12px', top:'50%', transform:'translateY(-50%)', background:'none', border:'none', cursor:'pointer', fontSize:'16px', color:'#94a3b8', lineHeight:1 }}>
          {vis?'🙈':'👁️'}
        </button>
      </div>
    </div>
  )
}

const S = {
  page: { minHeight:'100vh', display:'flex', background:'#f8fafc', direction:'rtl', fontFamily:"'Cairo','Inter',sans-serif" },
  left: { flex:1, background:'linear-gradient(135deg,#1e1b4b 0%,#312e81 50%,#1e1b4b 100%)', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', padding:'3rem', position:'relative', overflow:'hidden' },
  right: { width:'480px', flexShrink:0, display:'flex', alignItems:'center', justifyContent:'center', padding:'2rem', background:'#fff', borderRight:'1px solid #e2e8f0' },
  card: { width:'100%', maxWidth:'400px' },
  logo: { display:'flex', alignItems:'center', gap:'12px', marginBottom:'28px' },
  logoIcon: { width:'44px', height:'44px', background:'linear-gradient(135deg,#4F46E5,#7C3AED)', borderRadius:'12px', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'22px', boxShadow:'0 4px 14px rgba(79,70,229,0.4)' },
  logoText: { fontSize:'20px', fontWeight:'900', color:'#1e293b' },
  title: { fontSize:'22px', fontWeight:'800', color:'#1e293b', marginBottom:'4px' },
  sub: { fontSize:'13px', color:'#64748b', marginBottom:'24px' },
  fg: { marginBottom:'16px' },
  lbl: { display:'block', fontSize:'11px', fontWeight:'700', color:'#374151', marginBottom:'6px', textTransform:'uppercase', letterSpacing:'.05em' },
  inp: { width:'100%', padding:'12px 14px', background:'#f8fafc', border:'1.5px solid #e2e8f0', borderRadius:9, color:'#1e293b', fontSize:'14px', fontFamily:'inherit', direction:'rtl', outline:'none', transition:'border .2s' },
  btn: { width:'100%', padding:'13px', background:'linear-gradient(135deg,#4F46E5,#7C3AED)', color:'#fff', border:'none', borderRadius:9, fontSize:'14px', fontWeight:'800', cursor:'pointer', fontFamily:'inherit', transition:'all .2s', boxShadow:'0 4px 14px rgba(79,70,229,0.35)' },
  btnGhost: { width:'100%', padding:'13px', background:'#f8fafc', color:'#475569', border:'1.5px solid #e2e8f0', borderRadius:9, fontSize:'14px', fontWeight:'600', cursor:'pointer', fontFamily:'inherit', display:'flex', alignItems:'center', justifyContent:'center', gap:'10px' },
  divider: { display:'flex', alignItems:'center', gap:'12px', margin:'18px 0' },
  err: { background:'#fef2f2', border:'1px solid #fecaca', borderRadius:8, padding:'10px 14px', color:'#dc2626', fontSize:'13px', marginBottom:'16px', textAlign:'center' },
}

export default function Login() {
  const [form, setForm]   = useState({ email:'', password:'' })
  const [lang, setLangSt] = useState('ar')
  const [err, setErr]     = useState('')
  const { setAuth, setLang } = useERPStore()
  const nav = useNavigate()
  const gBtnRef = useRef(null)
  const tr = k => t(k, lang)
  const dir = ['ar','ur'].includes(lang) ? 'rtl' : 'ltr'

  const changeLang = code => { setLang(code); setLangSt(code) }

  const loginM = useMutation({
    mutationFn: data => api.post('/auth/login', data).then(r => r.data),
    onSuccess: ({ user, token }) => { setAuth(user, token); nav('/dashboard') },
    onError: e => setErr(e.response?.data?.message || 'بيانات غير صحيحة'),
  })

  const googleM = useMutation({
    mutationFn: data => api.post('/auth/google', data).then(r => r.data),
    onSuccess: ({ user, token }) => { setAuth(user, token); nav('/dashboard') },
    onError: e => setErr(e.response?.data?.message || 'فشل تسجيل Google'),
  })

  useEffect(() => {
    if (!GOOGLE_CLIENT_ID || !gBtnRef.current) return
    const interval = setInterval(() => {
      if (!window.google?.accounts?.id) return
      clearInterval(interval)
      window.google.accounts.id.initialize({
        client_id: GOOGLE_CLIENT_ID,
        callback: ({ credential }) => googleM.mutate({ credential }),
      })
      window.google.accounts.id.renderButton(gBtnRef.current, {
        theme:'filled_black', size:'large', width: gBtnRef.current.offsetWidth, text:'signin_with', shape:'rectangular'
      })
    }, 300)
    return () => clearInterval(interval)
  }, [GOOGLE_CLIENT_ID])

  const onSubmit = e => {
    e.preventDefault(); setErr('')
    loginM.mutate({ email: form.email.trim().toLowerCase(), password: form.password })
  }

  const FEATURES = [
    { icon:'💰', text: lang==='ar' ? 'محاسبة متكاملة مع ZATCA' : 'Complete accounting with ZATCA' },
    { icon:'👥', text: lang==='ar' ? 'موارد بشرية ورواتب متقدمة' : 'Advanced HR & payroll' },
    { icon:'📊', text: lang==='ar' ? 'تقارير ولوحة تحكم ذكية' : 'Smart dashboard & reports' },
    { icon:'🔐', text: lang==='ar' ? 'أمان متقدم + صلاحيات دقيقة' : 'Advanced security + RBAC' },
    { icon:'🌍', text: lang==='ar' ? '6 لغات + RTL/LTR تلقائي' : '6 languages + auto RTL/LTR' },
    { icon:'🆓', text: lang==='ar' ? 'مجاني 100% — MIT License' : '100% Free — MIT License' },
  ]

  return (
    <div style={{ ...S.page, direction:dir }}>
      {/* Left panel */}
      <div style={S.left}>
        <div style={{ position:'absolute', width:'600px', height:'600px', background:'radial-gradient(circle,rgba(79,70,229,0.2),transparent)', top:'50%', left:'50%', transform:'translate(-50%,-50%)', pointerEvents:'none' }}/>
        <div style={{ position:'relative', zIndex:1, maxWidth:'400px', width:'100%' }}>
          <div style={{ display:'flex', alignItems:'center', gap:'12px', marginBottom:'2.5rem' }}>
            <div style={S.logoIcon}>🏢</div>
            <div>
              <div style={{ fontSize:'24px', fontWeight:'900', color:'#fff' }}>WasselERP</div>
              <div style={{ fontSize:'11px', color:'rgba(255,255,255,0.4)', marginTop:'2px' }}>Enterprise Edition</div>
            </div>
          </div>
          <h2 style={{ color:'#fff', fontSize:'2rem', fontWeight:'800', lineHeight:1.3, marginBottom:'12px' }}>
            {lang==='ar' ? 'أفضل نظام ERP' : 'Best Free ERP'}{' '}
            <span style={{ color:'#a5b4fc' }}>{lang==='ar' ? 'مجاني' : 'System'}</span>
            <br/>{lang==='ar' ? 'في العالم' : 'in the World'}
          </h2>
          <p style={{ color:'rgba(255,255,255,0.5)', fontSize:'14px', marginBottom:'2rem', lineHeight:1.8 }}>
            {lang==='ar' ? 'إدارة شاملة لكل أعمالك بمنصة واحدة متعددة الشركات' : 'Complete business management in one multi-tenant platform'}
          </p>
          <div style={{ display:'flex', flexDirection:'column', gap:'12px' }}>
            {FEATURES.map((f,i) => (
              <div key={i} style={{ display:'flex', alignItems:'center', gap:'12px' }}>
                <div style={{ width:'36px', height:'36px', background:'rgba(255,255,255,0.08)', borderRadius:'9px', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'18px', flexShrink:0, border:'1px solid rgba(255,255,255,0.1)' }}>{f.icon}</div>
                <span style={{ color:'rgba(255,255,255,0.7)', fontSize:'13px', fontWeight:'500' }}>{f.text}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right panel */}
      <div style={S.right}>
        <div style={S.card}>
          {/* Top bar */}
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'28px' }}>
            <div style={S.logo}>
              <div style={S.logoIcon}>🏢</div>
              <span style={S.logoText}>WasselERP</span>
            </div>
            <div style={{ display:'flex', gap:'4px' }}>
              {Object.entries(LANGS).map(([code,info]) => (
                <button key={code} type="button" onClick={()=>changeLang(code)}
                  style={{ padding:'4px 8px', border:`1px solid ${lang===code?'#4F46E5':'#e2e8f0'}`, borderRadius:'6px', background:lang===code?'#EDE9FE':'transparent', cursor:'pointer', fontSize:'15px', transition:'all .15s' }}>
                  {info.flag}
                </button>
              ))}
            </div>
          </div>

          <h2 style={S.title}>{tr('welcomeBack')} 👋</h2>
          <p style={S.sub}>{lang==='ar' ? 'سجّل دخولك لإدارة أعمالك' : 'Sign in to manage your business'}</p>

          {err && <div style={S.err}>⚠️ {err}</div>}

          {/* Google Button */}
          {GOOGLE_CLIENT_ID ? (
            <div>
              {googleM.isPending ? (
                <div style={{ ...S.btnGhost, justifyContent:'center' }}>
                  <div style={{ width:'18px', height:'18px', border:'2px solid #e2e8f0', borderTop:'2px solid #4F46E5', borderRadius:'50%', animation:'spin .7s linear infinite' }}/>
                  <span>جاري...</span>
                </div>
              ) : (
                <div ref={gBtnRef} style={{ width:'100%', borderRadius:'9px', overflow:'hidden', minHeight:'44px' }}/>
              )}
              <div style={{ display:'flex', alignItems:'center', gap:'12px', margin:'16px 0' }}>
                <div style={{ flex:1, height:'1px', background:'#e2e8f0' }}/>
                <span style={{ fontSize:'12px', color:'#94a3b8', fontWeight:'600' }}>{lang==='ar'?'أو':'or'}</span>
                <div style={{ flex:1, height:'1px', background:'#e2e8f0' }}/>
              </div>
            </div>
          ) : null}

          <form onSubmit={onSubmit} noValidate>
            <div style={S.fg}>
              <label style={S.lbl}>{tr('email')}</label>
              <input style={S.inp} type="email" value={form.email} onChange={e=>setForm(f=>({...f,email:e.target.value}))}
                placeholder="admin@company.com" required autoComplete="email" />
            </div>
            <PwField value={form.password} onChange={e=>setForm(f=>({...f,password:e.target.value}))}
              label={tr('password')} placeholder="••••••••" />
            <div style={{ textAlign: dir==='rtl'?'left':'right', marginBottom:'16px', marginTop:'-8px' }}>
              <Link to="/forgot-password" style={{ color:'#4F46E5', fontSize:'13px', fontWeight:'600' }}>{tr('forgotPassword')}</Link>
            </div>
            <button style={{ ...S.btn, opacity: loginM.isPending?0.7:1 }} type="submit" disabled={loginM.isPending}>
              {loginM.isPending ? '⏳ ...' : tr('loginBtn')}
            </button>
          </form>

          <div style={{ textAlign:'center', marginTop:'20px', paddingTop:'20px', borderTop:'1px solid #f1f5f9' }}>
            <p style={{ color:'#64748b', fontSize:'13px', marginBottom:'12px' }}>
              {lang==='ar' ? 'ليس لديك حساب؟' : "Don't have an account?"}
            </p>
            <Link to="/register">
              <button style={{ padding:'10px 24px', background:'#f8fafc', border:'1.5px solid #e2e8f0', borderRadius:'9px', color:'#374151', fontSize:'13px', fontWeight:'700', cursor:'pointer', fontFamily:'inherit' }}>
                🏢 {tr('registerCompany')}
              </button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
