import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useMutation } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import api from '@/api/axiosInstance'
import { useERPStore } from '@/store/erpStore'
import { LANGS } from '@/i18n'

const CURRENCIES = ['SAR','AED','USD','EUR','GBP','KWD','BHD','QAR','OMR','EGP','TRY','IDR']
const COUNTRIES  = [['SA','🇸🇦 السعودية'],['AE','🇦🇪 الإمارات'],['KW','🇰🇼 الكويت'],['QA','🇶🇦 قطر'],['BH','🇧🇭 البحرين'],['OM','🇴🇲 عمان'],['EG','🇪🇬 مصر'],['US','🇺🇸 USA'],['GB','🇬🇧 UK'],['TR','🇹🇷 Türkiye'],['ID','🇮🇩 Indonesia'],['PK','🇵🇰 Pakistan']]
const INDUSTRIES = ['تقنية المعلومات','تجارة عامة','تصنيع','خدمات','صحة','تعليم','عقارات','سياحة','مواصلات','بناء وإنشاء','أغذية','مالية']

function PwStrength({ value }) {
  const checks = { len: value.length >= 8, upper: /[A-Z]/.test(value), lower: /[a-z]/.test(value), num: /[0-9]/.test(value) }
  const score  = Object.values(checks).filter(Boolean).length
  const colors = ['#ef4444','#f97316','#eab308','#22c55e']
  const labels = ['ضعيفة','متوسطة','جيدة','قوية']
  return value ? (
    <div style={{ marginTop:'6px' }}>
      <div style={{ display:'flex', gap:'3px', marginBottom:'4px' }}>
        {[0,1,2,3].map(i => (
          <div key={i} style={{ flex:1, height:'3px', borderRadius:'2px', background: i < score ? colors[score-1] : '#e2e8f0', transition:'background .2s' }}/>
        ))}
      </div>
      <div style={{ display:'flex', gap:'6px', flexWrap:'wrap' }}>
        {[{k:'len',l:'٨ أحرف'},{k:'upper',l:'كبيرة'},{k:'lower',l:'صغيرة'},{k:'num',l:'رقم'}].map(c => (
          <span key={c.k} style={{ fontSize:'10px', padding:'1px 6px', borderRadius:'4px', background:checks[c.k]?'#d1fae5':'#f1f5f9', color:checks[c.k]?'#065f46':'#94a3b8' }}>
            {checks[c.k]?'✓':''} {c.l}
          </span>
        ))}
        {score > 0 && <span style={{ fontSize:'10px', color: colors[score-1], fontWeight:'700', marginRight:'auto' }}>{labels[score-1]}</span>}
      </div>
    </div>
  ) : null
}

const S = {
  page: { minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center', background:'linear-gradient(135deg,#1e1b4b,#312e81,#1e1b4b)', padding:'2rem', fontFamily:"'Cairo','Inter',sans-serif", direction:'rtl' },
  card: { width:'100%', maxWidth:'540px', background:'#fff', borderRadius:'16px', padding:'2.5rem', boxShadow:'0 25px 60px rgba(0,0,0,0.4)' },
  logo: { display:'flex', alignItems:'center', gap:'12px', justifyContent:'center', marginBottom:'24px' },
  logoIcon: { width:'44px', height:'44px', background:'linear-gradient(135deg,#4F46E5,#7C3AED)', borderRadius:'12px', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'22px' },
  prog: { display:'flex', alignItems:'center', justifyContent:'center', gap:'8px', marginBottom:'24px' },
  dot: { width:'30px', height:'30px', borderRadius:'50%', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'12px', fontWeight:'800', color:'#fff' },
  line: { height:'2px', width:'50px', borderRadius:'2px' },
  fg: { marginBottom:'14px' },
  row: { display:'grid', gridTemplateColumns:'1fr 1fr', gap:'12px', marginBottom:'14px' },
  lbl: { display:'block', fontSize:'11px', fontWeight:'700', color:'#374151', marginBottom:'5px', textTransform:'uppercase', letterSpacing:'.05em' },
  inp: { width:'100%', padding:'11px 13px', background:'#f8fafc', border:'1.5px solid #e2e8f0', borderRadius:'9px', color:'#1e293b', fontSize:'13px', fontFamily:'inherit', direction:'rtl', outline:'none', transition:'border .2s' },
  sel: { width:'100%', padding:'11px 13px', background:'#f8fafc', border:'1.5px solid #e2e8f0', borderRadius:'9px', color:'#1e293b', fontSize:'13px', fontFamily:'inherit', outline:'none', cursor:'pointer' },
  btn: { width:'100%', padding:'13px', background:'linear-gradient(135deg,#4F46E5,#7C3AED)', color:'#fff', border:'none', borderRadius:'9px', fontSize:'14px', fontWeight:'800', cursor:'pointer', fontFamily:'inherit', boxShadow:'0 4px 14px rgba(79,70,229,0.35)' },
  btnSec: { flex:1, padding:'11px', background:'#f8fafc', border:'1.5px solid #e2e8f0', borderRadius:'9px', color:'#374151', fontSize:'13px', fontWeight:'700', cursor:'pointer', fontFamily:'inherit' },
  err: { background:'#fef2f2', border:'1px solid #fecaca', borderRadius:'8px', padding:'10px', color:'#dc2626', fontSize:'13px', marginBottom:'14px', textAlign:'center' },
  infoBox: { background:'#eff6ff', border:'1px solid #bfdbfe', borderRadius:'10px', padding:'14px', marginBottom:'16px' },
  featBox: { background:'#f0fdf4', border:'1px solid #bbf7d0', borderRadius:'10px', padding:'14px', marginBottom:'16px' },
}

export default function Register() {
  const [step, setStep] = useState(1)
  const [err, setErr]   = useState('')
  const [showPw, setShowPw] = useState(false)
  const [form, setForm] = useState({
    companyName:'', companyEmail:'', adminName:'', adminEmail:'', adminPassword:'', confirmPassword:'',
    currency:'SAR', country:'SA', language:'ar', industry:'',
  })
  const { setAuth } = useERPStore()
  const nav = useNavigate()
  const set = k => e => { setForm(f=>({...f,[k]:e.target.value})); setErr('') }

  const regM = useMutation({
    mutationFn: data => api.post('/auth/register-company', data).then(r => r.data),
    onSuccess: ({ user, token }) => { setAuth(user, token); toast.success('تم إنشاء الشركة بنجاح! 🎉'); nav('/dashboard') },
    onError: e => setErr(e.response?.data?.message || 'فشل التسجيل — حاول مرة أخرى'),
  })

  const validateStep1 = () => {
    if (!form.companyName.trim()) return 'اسم الشركة مطلوب'
    if (!form.adminName.trim())   return 'اسم المدير مطلوب'
    if (!/\S+@\S+\.\S+/.test(form.adminEmail)) return 'بريد إلكتروني غير صالح'
    if (form.adminPassword.length < 8) return 'كلمة المرور 8 أحرف على الأقل'
    if (!/[A-Z]/.test(form.adminPassword)) return 'يجب أن تحتوي كلمة المرور على حرف كبير'
    if (!/[0-9]/.test(form.adminPassword)) return 'يجب أن تحتوي كلمة المرور على رقم'
    if (form.adminPassword !== form.confirmPassword) return 'كلمات المرور غير متطابقة'
    return null
  }

  return (
    <div style={S.page}>
      <div style={S.card}>
        <div style={S.logo}>
          <div style={S.logoIcon}>🏢</div>
          <div style={{ textAlign:'center' }}>
            <div style={{ fontSize:'20px', fontWeight:'900', color:'#1e293b' }}>WasselERP Enterprise</div>
            <div style={{ fontSize:'12px', color:'#64748b' }}>30 يوم تجريبي مجاناً — لا يلزم بطاقة ائتمان</div>
          </div>
        </div>

        {/* Progress */}
        <div style={S.prog}>
          <div style={{ display:'flex', alignItems:'center', gap:'6px' }}>
            <div style={{ ...S.dot, background:'#4F46E5', boxShadow:'0 0 12px rgba(79,70,229,0.5)' }}>١</div>
            <span style={{ fontSize:'12px', color:step===1?'#4F46E5':'#94a3b8', fontWeight:'600' }}>معلوماتك</span>
          </div>
          <div style={{ ...S.line, background:step===2?'#4F46E5':'#e2e8f0', transition:'background .3s' }}/>
          <div style={{ display:'flex', alignItems:'center', gap:'6px' }}>
            <div style={{ ...S.dot, background:step===2?'#4F46E5':'#e2e8f0', transition:'background .3s', boxShadow:step===2?'0 0 12px rgba(79,70,229,0.5)':'none', color:step===2?'#fff':'#94a3b8' }}>٢</div>
            <span style={{ fontSize:'12px', color:step===2?'#4F46E5':'#94a3b8', fontWeight:'600' }}>إعدادات الشركة</span>
          </div>
        </div>

        {err && <div style={S.err}>⚠️ {err}</div>}

        {step === 1 && (
          <>
            <div style={{ borderBottom:'1px solid #f1f5f9', marginBottom:'14px', paddingBottom:'8px' }}>
              <p style={{ fontSize:'13px', fontWeight:'700', color:'#374151' }}>🏢 معلومات الشركة</p>
            </div>
            <div style={S.fg}>
              <label style={S.lbl}>اسم الشركة *</label>
              <input style={S.inp} value={form.companyName} onChange={set('companyName')} placeholder="شركة المثال للتجارة" required />
            </div>
            <div style={S.fg}>
              <label style={S.lbl}>بريد الشركة الإلكتروني</label>
              <input style={S.inp} type="email" value={form.companyEmail} onChange={set('companyEmail')} placeholder="info@company.com" />
            </div>
            <div style={{ borderBottom:'1px solid #f1f5f9', margin:'14px 0 14px', paddingTop:'4px' }}>
              <p style={{ fontSize:'13px', fontWeight:'700', color:'#374151' }}>👤 بيانات مدير النظام</p>
            </div>
            <div style={S.fg}>
              <label style={S.lbl}>الاسم الكامل *</label>
              <input style={S.inp} value={form.adminName} onChange={set('adminName')} placeholder="محمد أحمد العلي" required />
            </div>
            <div style={S.fg}>
              <label style={S.lbl}>البريد الإلكتروني *</label>
              <input style={S.inp} type="email" value={form.adminEmail} onChange={set('adminEmail')} placeholder="admin@company.com" required autoComplete="email" />
            </div>
            <div style={S.fg}>
              <label style={S.lbl}>كلمة المرور *</label>
              <div style={{ position:'relative' }}>
                <input style={{ ...S.inp, paddingLeft:'40px' }} type={showPw?'text':'password'}
                  value={form.adminPassword} onChange={set('adminPassword')} placeholder="8+ أحرف (كبيرة + أرقام)" required />
                <button type="button" onClick={()=>setShowPw(v=>!v)} style={{ position:'absolute', left:'12px', top:'50%', transform:'translateY(-50%)', background:'none', border:'none', cursor:'pointer', fontSize:'15px', color:'#94a3b8' }}>
                  {showPw?'🙈':'👁️'}
                </button>
              </div>
              <PwStrength value={form.adminPassword} />
            </div>
            <div style={S.fg}>
              <label style={S.lbl}>تأكيد كلمة المرور *</label>
              <input style={{ ...S.inp, borderColor: form.confirmPassword && form.password !== form.confirmPassword ? '#fecaca' : '#e2e8f0' }}
                type="password" value={form.confirmPassword} onChange={set('confirmPassword')} placeholder="أعد كتابة كلمة المرور" required />
              {form.confirmPassword && form.adminPassword === form.confirmPassword && (
                <p style={{ color:'#059669', fontSize:'11px', marginTop:'4px' }}>✓ كلمات المرور متطابقة</p>
              )}
            </div>
            <button style={S.btn} onClick={() => { const e = validateStep1(); e ? setErr(e) : (setErr(''), setStep(2)) }}>
              التالي ← إعدادات الشركة
            </button>
          </>
        )}

        {step === 2 && (
          <>
            <div style={S.infoBox}>
              <p style={{ fontSize:'13px', color:'#1d4ed8', fontWeight:'700' }}>✓ {form.companyName}</p>
              <p style={{ fontSize:'12px', color:'#3b82f6', marginTop:'3px' }}>المدير: {form.adminName} — {form.adminEmail}</p>
            </div>
            <div style={S.row}>
              <div>
                <label style={S.lbl}>العملة</label>
                <select style={S.sel} value={form.currency} onChange={set('currency')}>
                  {CURRENCIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label style={S.lbl}>الدولة</label>
                <select style={S.sel} value={form.country} onChange={set('country')}>
                  {COUNTRIES.map(([v,l]) => <option key={v} value={v}>{l}</option>)}
                </select>
              </div>
            </div>
            <div style={S.row}>
              <div>
                <label style={S.lbl}>لغة النظام</label>
                <select style={S.sel} value={form.language} onChange={set('language')}>
                  {Object.entries(LANGS).map(([k,v]) => <option key={k} value={k}>{v.flag} {v.name}</option>)}
                </select>
              </div>
              <div>
                <label style={S.lbl}>القطاع</label>
                <select style={S.sel} value={form.industry} onChange={set('industry')}>
                  <option value="">اختر...</option>
                  {INDUSTRIES.map(i => <option key={i} value={i}>{i}</option>)}
                </select>
              </div>
            </div>
            <div style={S.featBox}>
              <p style={{ fontSize:'13px', color:'#15803d', fontWeight:'700', marginBottom:'8px' }}>✅ ستحصل على:</p>
              {['جميع الوحدات الـ 10 مفعّلة','30 يوم تجريبي مجاني','مستخدمون غير محدودون','بيانات مشفرة ومؤمّنة','تحديثات مستمرة مجاناً'].map((f,i) => (
                <div key={i} style={{ fontSize:'12px', color:'#16a34a', marginBottom:'3px' }}>✓ {f}</div>
              ))}
            </div>
            <div style={{ display:'flex', gap:'10px' }}>
              <button style={S.btnSec} onClick={()=>setStep(1)}>← رجوع</button>
              <button style={{ ...S.btn, flex:2 }} onClick={() => regM.mutate(form)} disabled={regM.isPending}>
                {regM.isPending ? '⏳ جاري إنشاء الشركة...' : '🚀 إنشاء الشركة والبدء'}
              </button>
            </div>
          </>
        )}

        <div style={{ textAlign:'center', marginTop:'16px' }}>
          <Link to="/login" style={{ color:'#64748b', fontSize:'13px' }}>
            لديك حساب؟ <span style={{ color:'#4F46E5', fontWeight:'700' }}>سجّل دخولك</span>
          </Link>
        </div>
      </div>
    </div>
  )
}
