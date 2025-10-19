import { useEffect, useMemo, useState } from 'react'
import '../styles/AdminTable.css'

function toCSV(rows, columns){
  const headers = columns.map(c=>`"${c.title.replace(/"/g,'"')}"`).join(',')
  const lines = rows.map(r=>columns.map(c=>{ const val=c.render?c.render(r[c.key], r):r[c.key]; const s= (val==null?'' : String(val)); return `"${s.replace(/"/g,'"')}"` }).join(','))
  return [headers, ...lines].join('\n')
}

export default function AdminTable({ items, columns, onEdit, onDelete, actions, storageKey = 'adm_tbl', searchKeys }) {
  const [query, setQuery] = useState('')
  const [page, setPage] = useState(1)
  const [limit, setLimit] = useState(10)

  useEffect(()=>{
    try{
      const saved = JSON.parse(localStorage.getItem(storageKey) || 'null')
      if(saved){ setQuery(saved.query||''); setPage(saved.page||1); setLimit(saved.limit||10) }
    }catch(e){
      void e
    }
  },[storageKey])

  useEffect(()=>{ localStorage.setItem(storageKey, JSON.stringify({ query, page, limit })) },[query, page, limit, storageKey])

  const keys = useMemo(()=> searchKeys || columns.map(c=>c.key), [searchKeys, columns])
  const filtered = useMemo(()=>{
    if(!query.trim()) return items
    const q = query.toLowerCase()
    return items.filter(it=> keys.some(k=> String(it[k] ?? '').toLowerCase().includes(q)))
  },[items, query, keys])

  const total = filtered.length
  const maxPage = Math.max(1, Math.ceil(total / limit))
  const clampedPage = Math.min(page, maxPage)
  const start = (clampedPage - 1) * limit
  const end = Math.min(start + limit, total)
  const pageRows = filtered.slice(start, end)

  const goFirst = ()=> setPage(1)
  const goPrev = ()=> setPage(p=> Math.max(1, p-1))
  const goNext = ()=> setPage(p=> Math.min(maxPage, p+1))
  const goLast = ()=> setPage(maxPage)
  const exportCSV = () => {
    const csv = toCSV(filtered, columns)
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${storageKey}.csv`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  return (
    <div className="admin-table-wrapper">
      <div className="admin-table-toolbar">
        <input className="table-search" placeholder="Search..." value={query} onChange={(e)=>{ setPage(1); setQuery(e.target.value) }} />
        <div className="table-tools">
          <label className="page-size">Rows per page
            <select value={limit} onChange={(e)=>{ setPage(1); setLimit(parseInt(e.target.value,10)) }}>
              <option value={10}>10</option>
              <option value={25}>25</option>
              <option value={50}>50</option>
              <option value={100}>100</option>
            </select>
          </label>
          <button className="outline-btn" onClick={exportCSV}>Export CSV</button>
        </div>
      </div>
      <table className="admin-table">
        <thead>
          <tr>
            {columns.map((c) => (<th key={c.key}>{c.title}</th>))}
            {(onEdit || onDelete || actions) && <th>Actions</th>}
          </tr>
        </thead>
        <tbody>
          {pageRows.map((item) => (
            <tr key={item.id}>
              {columns.map((c) => (
                <td key={c.key}>{c.render ? c.render(item[c.key], item) : (item[c.key] ?? '')}</td>
              ))}
              {(onEdit || onDelete || actions) && (
                <td className="actions">
                  {actions?.map((a) => (
                    <button key={a.label} className={a.kind === 'danger' ? 'danger-btn' : 'outline-btn'} onClick={() => a.onClick(item)}>{a.label}</button>
                  ))}
                  {onEdit && <button className="outline-btn" onClick={() => onEdit(item)}>Edit</button>}
                  {onDelete && <button className="danger-btn" onClick={() => onDelete(item)}>Delete</button>}
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
      <div className="table-footer">
        <div className="range">{`Showing ${total===0?0:start+1}–${end} of ${total}`}</div>
        <div className="pager">
          <button className="outline-btn" onClick={goFirst} disabled={clampedPage===1}>First</button>
          <button className="outline-btn" onClick={goPrev} disabled={clampedPage===1}>Previous</button>
          <span className="page-indicator">Page {clampedPage} / {maxPage}</span>
          <button className="outline-btn" onClick={goNext} disabled={clampedPage===maxPage}>Next</button>
          <button className="outline-btn" onClick={goLast} disabled={clampedPage===maxPage}>Last</button>
        </div>
      </div>
    </div>
  )
}
