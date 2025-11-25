import { vi, describe, it, expect, beforeEach } from 'vitest'

const getMock = vi.fn()

vi.mock('axios', () => ({
  default: { create: vi.fn(() => ({ get: getMock })) },
}))

beforeEach(() => {
  getMock.mockReset()
})

describe('api/products', () => {
  it('getProducts llama al endpoint y normaliza array plano', async () => {
    const { getProducts } = await import('../api/products')
    getMock.mockResolvedValueOnce({ data: [{ id: 1 }, { id: 2 }] })
    const res = await getProducts()
    expect(getMock).toHaveBeenCalledWith('/api/v1/products')
    expect(res.length).toBe(2)
  })

  it('getProducts extrae content desde respuesta paginada', async () => {
    const { getProducts } = await import('../api/products')
    getMock.mockResolvedValueOnce({ data: { content: [{ id: 3 }] } })
    const res = await getProducts()
    expect(res).toEqual([{ id: 3 }])
  })

  it('getProduct llama al endpoint con id', async () => {
    const { getProduct } = await import('../api/products')
    getMock.mockResolvedValueOnce({ data: { id: 10 } })
    const res = await getProduct(10)
    expect(getMock).toHaveBeenCalledWith('/api/v1/products/10')
    expect(res).toEqual({ id: 10 })
  })
})