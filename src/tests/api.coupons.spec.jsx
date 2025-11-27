import { describe, it, expect, vi } from 'vitest'
import { couponsApi, getCoupons, getCoupon, createCoupon, updateCoupon, deleteCoupon, findCouponByCode } from '../api/coupons.js'

describe('API Coupons operations', () => {
  it('GET /api/v1/coupons - lista de cupones', async () => {
    const serverList = [
      { id: 1, discount_code: 'DESCUENTO10', discount_value: 10, state: 'HABILITADO' },
      { id: 2, discount_code: 'OFERTA20', discount_value: 20, state: 'DESHABILITADO' },
    ]

    const spy = vi.spyOn(couponsApi, 'get').mockResolvedValueOnce({ data: serverList })

    const result = await getCoupons()

    expect(spy).toHaveBeenCalledWith('/api/v1/coupons')
    expect(result).toEqual([
      { id: 1, codigo: 'DESCUENTO10', porcentajeDescuento: 10, estado: 'HABILITADO' },
      { id: 2, codigo: 'OFERTA20', porcentajeDescuento: 20, estado: 'DESHABILITADO' },
    ])
  })

  it('GET /api/v1/coupons/{id} - detalle de cupón', async () => {
    const serverItem = { id: 5, discount_code: 'BLACKFRIDAY', discount_value: 50, state: 'HABILITADO' }
    const spy = vi.spyOn(couponsApi, 'get').mockResolvedValueOnce({ data: serverItem })

    const item = await getCoupon(5)
    expect(spy).toHaveBeenCalledWith('/api/v1/coupons/5')
    expect(item).toEqual({ id: 5, codigo: 'BLACKFRIDAY', porcentajeDescuento: 50, estado: 'HABILITADO' })
  })

  it('POST /api/v1/coupons - crear cupón', async () => {
    const model = { codigo: 'NUEVO15', porcentajeDescuento: 15, estado: 'HABILITADO' }
    const created = { id: 9, discount_code: 'NUEVO15', discount_value: 15, state: 'HABILITADO' }
    const spy = vi.spyOn(couponsApi, 'post').mockResolvedValueOnce({ data: created })

    const res = await createCoupon(model)
    expect(spy).toHaveBeenCalledWith('/api/v1/coupons', { discount_code: 'NUEVO15', discount_value: 15, state: 'HABILITADO' })
    expect(res).toEqual({ id: 9, codigo: 'NUEVO15', porcentajeDescuento: 15, estado: 'HABILITADO' })
  })

  it('PUT /api/v1/coupons/{id} - actualizar cupón', async () => {
    const updates = { codigo: 'NUEVO15', porcentajeDescuento: 25, estado: 'HABILITADO' }
    const updated = { id: 9, discount_code: 'NUEVO15', discount_value: 25, state: 'HABILITADO' }
    const spy = vi.spyOn(couponsApi, 'put').mockResolvedValueOnce({ data: updated })

    const res = await updateCoupon(9, updates)
    expect(spy).toHaveBeenCalledWith('/api/v1/coupons/9', { discount_code: 'NUEVO15', discount_value: 25, state: 'HABILITADO' })
    expect(res).toEqual({ id: 9, codigo: 'NUEVO15', porcentajeDescuento: 25, estado: 'HABILITADO' })
  })

  it('DELETE /api/v1/coupons/{id} - eliminar cupón', async () => {
    const spy = vi.spyOn(couponsApi, 'delete').mockResolvedValueOnce({ status: 200 })
    await deleteCoupon(12)
    expect(spy).toHaveBeenCalledWith('/api/v1/coupons/12')
  })

  it('GET /api/v1/coupons/code/{CODE} - buscar por código (ok)', async () => {
    const serverItem = { id: 7, discount_code: 'OFERTA20', discount_value: 20, state: 'HABILITADO' }
    const spy = vi.spyOn(couponsApi, 'get').mockResolvedValueOnce({ data: serverItem })

    const res = await findCouponByCode('oferta20')
    expect(spy).toHaveBeenCalledWith('/api/v1/coupons/code/OFERTA20')
    expect(res).toEqual({ id: 7, codigo: 'OFERTA20', porcentajeDescuento: 20, estado: 'HABILITADO' })
  })

  it('GET /api/v1/coupons/code/{CODE} - buscar por código (404 → null)', async () => {
    const err = { response: { status: 404 } }
    const spy = vi.spyOn(couponsApi, 'get').mockRejectedValueOnce(err)
    const res = await findCouponByCode('noexiste')
    expect(spy).toHaveBeenCalledWith('/api/v1/coupons/code/NOEXISTE')
    expect(res).toBeNull()
  })
})

