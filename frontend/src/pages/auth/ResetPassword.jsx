import { useState } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import { useMutation } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import api from '@/api/axiosInstance'

export default function ResetPassword() {
  const [params] = useSearchParams()
  const nav = useNavigate()
  const [form, setForm] = useState({ password:'', confirm:'' })
  const [show, setShow] = useState(false)
  const token = params.get('token'), email = params.get('email')
  const m = useMutation({
    mutationFn: d => api.post('/auth/reset-password', d).then(r => r.data),
    onSuccess: () => { toast.success('تم تغيير كلمة المرور!'); nav('/login') },
    onError: e => toast.error(e.response?.data?.message || 'فشل التغيير'),
  })
  const submit = e => {
    e.preventDefault()
    if (form.password !== form.confirm) { toast.error('كلمات المرور غير متطابقة'); return }
    m.mutate({ token, email, newPassword: form.password })
  }
  const S = {
    page: { minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center', background:'#f8fafc', direction:'rtl', fontFamily:"'Cairo',sans-serif", padding:'2rem' },
    card: { width:'100%', maxWidth:'400px', background:'#fff', borderRadius:'16px', padding:'2.5rem', boxShadow:'0 4px 20px rgba(0,0,0,0.08)', border:'1px solid #e2e8f0' },
    inp: { width:'100%', padding:'12px 44px 12px 14px', background:'#f8fafc', border:'1.5px solid #e2e8f0', borderRadius:'9px', color:'#1e293b', fontSize:'14px', fontFamily:'inherit', direction:'rtl', outline:'none' },
    btn: { width:'100%', padding:'13px', background:'linear-gradient(135deg,#4F46E5,#7C3AED)', color:'#fff', border:'none', borderRadius:'9px', fontSize:'14px', fontWeight:'800', cursor:'pointer', fontFamily:'inherit' },
  }
  return (
    <div style={S.page}>
      <div style={S.card}>
        <div style={{ textAlign:'center', marginBottom:'24px' }}>
          <div style={{ fontSize:'3rem', marginBottom:'12px' }}>🔐</div>
          <h2 style={{ fontSize:'20px', fontWeight:'800', color:'#1e293b', marginBottom:'4px' }}>كلمة مرور جديدة</h2>
          <p style={{ color:'#64748b', fontSize:'12px' }}>{email}</p>
        </div>
        <form onSubmit={submit}>
          {[['password','كلمة المرور الجديدة'],['confirm','تأكيد كلمة المرور']].map(([k,l]) => (
            <div key={k} style={{ marginBottom:'16px' }}>
              <label style={{ display:'block', fontSize:'11px', fontWeight:'700', color:'#374151', marginBottom:'6px', textTransform:'uppercase' }}>{l}</label>
              <div style={{ position:'relative' }}>
                <input style={S.inp} type={show?'text':'password'} value={form[k]} onChange={e=>setForm(f=>({...f,[k]:e.target.value}))} placeholder="••••••••" required minLength={8} />
                <button type="button" onClick={()=>setShow(v=>!v)} style={{ position:'absolute', right:'12px', top:'50%', transform:'translateY(-50%)', background:'none', border:'none', cursor:'pointer', fontSize:'15px', color:'#94a3b8' }}>{show?'🙈':'👁️'}</button>
              </div>
            </div>
          ))}
          <button style={{ ...S.btn, opacity:m.isPending?.6:1 }} type="submit" disabled={m.isPending}>
            {m.isPending ? '⏳...' : '💾 حفظ كلمة المرور'}
          </button>
        </form>
      </div>
    </div>
  )
}
