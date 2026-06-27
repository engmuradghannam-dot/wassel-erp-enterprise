import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useMutation } from '@tanstack/react-query'
import api from '@/api/axiosInstance'

const S = {
  page: { minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center', background:'#f8fafc', padding:'2rem', fontFamily:"'Cairo',sans-serif", direction:'rtl' },
  card: { width:'100%', maxWidth:'400px', background:'#fff', borderRadius:'16px', padding:'2.5rem', boxShadow:'0 4px 20px rgba(0,0,0,0.08)', border:'1px solid #e2e8f0' },
  inp: { width:'100%', padding:'12px 14px', background:'#f8fafc', border:'1.5px solid #e2e8f0', borderRadius:'9px', color:'#1e293b', fontSize:'14px', fontFamily:'inherit', direction:'rtl', outline:'none' },
  btn: { width:'100%', padding:'13px', background:'linear-gradient(135deg,#4F46E5,#7C3AED)', color:'#fff', border:'none', borderRadius:'9px', fontSize:'14px', fontWeight:'800', cursor:'pointer', fontFamily:'inherit' },
}

export default function ForgotPassword() {
  const [email, setEmail] = useState('')
  const m = useMutation({ mutationFn: e => api.post('/auth/forgot-password', { email: e }).then(r => r.data) })
  return (
    <div style={S.page}>
      <div style={S.card}>
        <div style={{ textAlign:'center', marginBottom:'24px' }}>
          <div style={{ fontSize:'3rem', marginBottom:'12px' }}>🔑</div>
          <h2 style={{ fontSize:'20px', fontWeight:'800', color:'#1e293b', marginBottom:'6px' }}>استعادة كلمة المرور</h2>
          <p style={{ color:'#64748b', fontSize:'13px', lineHeight:1.6 }}>أدخل بريدك الإلكتروني وسنرسل لك رابط الاستعادة</p>
        </div>
        {m.isSuccess ? (
          <div style={{ background:'#f0fdf4', border:'1px solid #bbf7d0', borderRadius:'10px', padding:'16px', color:'#15803d', textAlign:'center', fontSize:'13px' }}>
            📧 تم إرسال رابط الاستعادة — تحقق من بريدك الإلكتروني
          </div>
        ) : (
          <form onSubmit={e => { e.preventDefault(); m.mutate(email) }}>
            <div style={{ marginBottom:'16px' }}>
              <label style={{ display:'block', fontSize:'11px', fontWeight:'700', color:'#374151', marginBottom:'6px', textTransform:'uppercase' }}>البريد الإلكتروني</label>
              <input style={S.inp} type="email" value={email} onChange={e=>setEmail(e.target.value)} placeholder="example@email.com" required />
            </div>
            <button style={{ ...S.btn, opacity:m.isPending?.6:1 }} type="submit" disabled={m.isPending}>
              {m.isPending ? '⏳ جاري الإرسال...' : 'إرسال رابط الاستعادة'}
            </button>
          </form>
        )}
        <div style={{ textAlign:'center', marginTop:'20px' }}>
          <Link to="/login" style={{ color:'#4F46E5', fontSize:'13px', fontWeight:'600' }}>← العودة لتسجيل الدخول</Link>
        </div>
      </div>
    </div>
  )
}
