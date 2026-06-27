import { useERPStore } from '@/store/erpStore'
import { t } from '@/i18n'

export function PageHeader({ title, icon, actions }) {
  const { lang } = useERPStore()
  return (
    <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:'20px', flexWrap:'wrap', gap:'12px' }}>
      <h1 style={{ fontSize:'20px', fontWeight:'800', color:'var(--gray-800)', display:'flex', alignItems:'center', gap:'10px' }}>
        <span>{icon}</span>{title}
      </h1>
      {actions && <div style={{ display:'flex', gap:'8px', alignItems:'center', flexWrap:'wrap' }}>{actions}</div>}
    </div>
  )
}

export function SearchBar({ value, onChange, placeholder = 'بحث...' }) {
  return (
    <input className="search-input" value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} />
  )
}

export function StatusBadge({ status }) {
  const ST = {
    active:'نشط', inactive:'غير نشط', pending:'معلق', approved:'معتمد',
    rejected:'مرفوض', draft:'مسودة', paid:'مدفوع', unpaid:'غير مدفوع',
    overdue:'متأخر', cancelled:'ملغى', completed:'مكتمل', partial:'جزئي',
    sent:'مُرسل', open:'مفتوح', closed:'مغلق', won:'مُكسب', lost:'خسارة',
    new:'جديد', qualified:'مؤهل', proposal:'عرض', negotiation:'تفاوض',
    planning:'تخطيط', on_hold:'متوقف', in_progress:'جاري', todo:'قادم',
    done:'مكتمل', review:'مراجعة', active_trial:'تجريبي', expired:'منتهي',
  }
  return <span className={`badge badge-${status}`}>{ST[status] || status}</span>
}

export function ConfirmDelete({ item, onConfirm, onCancel, loading }) {
  return (
    <div className="modal-overlay" onClick={onCancel}>
      <div className="modal" style={{ maxWidth:'380px' }} onClick={e => e.stopPropagation()}>
        <div style={{ textAlign:'center', marginBottom:'20px' }}>
          <div style={{ fontSize:'3rem', marginBottom:'12px' }}>⚠️</div>
          <h3 style={{ fontSize:'16px', fontWeight:'800', color:'var(--gray-800)', marginBottom:'8px' }}>تأكيد الحذف</h3>
          <p style={{ color:'var(--gray-500)', fontSize:'13px', lineHeight:1.7 }}>
            هل أنت متأكد من حذف <strong style={{ color:'var(--gray-700)' }}>{item?.name || item?.title || item?.number || 'هذا العنصر'}</strong>؟<br/>
            لا يمكن التراجع عن هذا الإجراء.
          </p>
        </div>
        <div style={{ display:'flex', gap:'10px' }}>
          <button className="btn btn-ghost" style={{ flex:1 }} onClick={onCancel}>إلغاء</button>
          <button className="btn btn-danger" style={{ flex:1 }} onClick={() => onConfirm(item?._id)} disabled={loading}>
            {loading ? '⏳' : '🗑️'} حذف
          </button>
        </div>
      </div>
    </div>
  )
}

export function LoadingTable({ cols = 5 }) {
  return (
    <div className="table-wrap">
      <table className="table">
        <tbody>
          {[1,2,3,4,5].map(i => (
            <tr key={i}>
              {Array(cols).fill(0).map((_,j) => (
                <td key={j}>
                  <div style={{ height:'14px', borderRadius:'4px', background:'linear-gradient(90deg,#f1f5f9 25%,#e2e8f0 50%,#f1f5f9 75%)', backgroundSize:'200% 100%', animation:'shimmer 1.5s infinite' }}/>
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export function Pagination({ pagination, page, onPage }) {
  if (!pagination?.pages || pagination.pages <= 1) return null
  return (
    <div className="pagination">
      <span className="page-info">
        {pagination.total} سجل — صفحة {page} من {pagination.pages}
      </span>
      <button className={`page-btn ${page === 1 ? '' : ''}`} onClick={() => onPage(1)} disabled={page===1}>«</button>
      <button className="page-btn" onClick={() => onPage(page-1)} disabled={page===1}>‹</button>
      {Array.from({ length: Math.min(pagination.pages, 5) }, (_,i) => {
        const p = Math.max(1, Math.min(page-2, pagination.pages-4)) + i
        return (
          <button key={p} className={`page-btn ${page===p?'active':''}`} onClick={() => onPage(p)}>{p}</button>
        )
      })}
      <button className="page-btn" onClick={() => onPage(page+1)} disabled={page===pagination.pages}>›</button>
      <button className="page-btn" onClick={() => onPage(pagination.pages)} disabled={page===pagination.pages}>»</button>
    </div>
  )
}
