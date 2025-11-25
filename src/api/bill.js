import axios from 'axios'

const baseURL = (import.meta.env?.VITE_BILL_BASEURL ?? 'http://56.228.34.53:8086').trim()

export const billApi = axios.create({ baseURL })

export async function getBills() {
  const { data } = await billApi.get('/api/bill/list')
  return Array.isArray(data) ? data : []
}

export async function getBill(id) {
  const { data } = await billApi.get(`/api/bill/${id}`)
  return data
}