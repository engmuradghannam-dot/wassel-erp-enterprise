import { useState, useCallback } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import api from '@/api/axiosInstance'

export function useModule({ queryKey, endpoint, defaultForm = {}, onCreateSuccess }) {
  const [showForm, setShowForm]     = useState(false)
  const [showDelete, setShowDelete] = useState(null)
  const [editItem, setEditItem]     = useState(null)
  const [form, setForm]             = useState(defaultForm)
  const [search, setSearch]         = useState('')
  const [page, setPage]             = useState(1)
  const [filters, setFilters]       = useState({})
  const qc = useQueryClient()

  const query = useQuery({
    queryKey: [queryKey, page, search, filters],
    queryFn: async () => {
      const params = new URLSearchParams({ page, limit: 20, search, ...filters })
      const res = await api.get(`${endpoint}?${params}`)
      return res.data
    },
    staleTime: 30000,
  })

  const createM = useMutation({
    mutationFn: data => api.post(endpoint, data).then(r => r.data),
    onSuccess: () => {
      qc.invalidateQueries([queryKey])
      setShowForm(false); setForm(defaultForm)
      toast.success('تم الإضافة بنجاح ✅')
      onCreateSuccess?.()
    },
    onError: e => toast.error(e.response?.data?.message || 'فشل الإضافة'),
  })

  const updateM = useMutation({
    mutationFn: ({ id, data }) => api.put(`${endpoint}/${id}`, data).then(r => r.data),
    onSuccess: () => {
      qc.invalidateQueries([queryKey])
      setEditItem(null); setForm(defaultForm)
      toast.success('تم التحديث ✅')
    },
    onError: e => toast.error(e.response?.data?.message || 'فشل التحديث'),
  })

  const deleteM = useMutation({
    mutationFn: id => api.delete(`${endpoint}/${id}`).then(r => r.data),
    onSuccess: () => {
      qc.invalidateQueries([queryKey])
      setShowDelete(null)
      toast.success('تم الحذف')
    },
    onError: e => toast.error(e.response?.data?.message || 'فشل الحذف'),
  })

  const openEdit = useCallback((item) => {
    setEditItem(item); setForm({ ...defaultForm, ...item }); setShowForm(true)
  }, [])

  const closeForm = useCallback(() => {
    setShowForm(false); setEditItem(null); setForm(defaultForm)
  }, [])

  const setField = useCallback((key) => (e) => {
    const val = e?.target ? e.target.value : e
    setForm(f => ({ ...f, [key]: val }))
  }, [])

  return {
    // Data
    items: query.data?.data || [],
    pagination: query.data?.pagination || {},
    isLoading: query.isLoading,
    isError: query.isError,
    // Actions
    createM, updateM, deleteM,
    // Form
    form, setForm, setField,
    showForm, setShowForm,
    editItem, setEditItem,
    openEdit, closeForm,
    // Delete
    showDelete, setShowDelete,
    // Search & filter
    search, setSearch,
    page, setPage,
    filters, setFilters,
    // Helpers
    isSaving: createM.isPending || updateM.isPending,
  }
}
