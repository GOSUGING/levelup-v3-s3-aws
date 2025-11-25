// src/pages/PurchasePages.jsx
import React, { useContext, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import { CartContext } from "../context/CartContext";
import "../App.css";
import { findCouponByCode } from "../api/coupons";

const API_URL = import.meta.env.VITE_PAYMENT_BASEURL;


export default function PurchasePages() {
  const { user, token } = useContext(AuthContext);     // si manejas JWT
  const { cartItems, cartSubtotal, removeFromCart, clearCart } = useContext(CartContext);
  const navigate = useNavigate();

  const [payment, setPayment] = useState({
    cardName: "",
    cardNumber: "",
    expiry: "", // MM/YY
    cvv: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError]   = useState("");
  const [success, setSuccess] = useState("");
  const [expiryError, setExpiryError] = useState("");
  const [couponCode, setCouponCode] = useState("");
  const [couponError, setCouponError] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState(null);

  const duocEligible = String(user?.email || '').toLowerCase().endsWith('@duocuc.cl');
  const duocPercent = duocEligible ? 20 : 0;
  const discountPercent = appliedCoupon?.porcentajeDescuento ? Number(appliedCoupon.porcentajeDescuento) : 0;
  const totalDiscountPercent = Math.max(duocPercent, discountPercent);
  const discountAmount = useMemo(() => {
    const subtotal = Number(cartSubtotal || 0);
    return Math.round(subtotal * (totalDiscountPercent / 100));
  }, [cartSubtotal, totalDiscountPercent]);
  const totalWithDiscount = useMemo(() => {
    const subtotal = Number(cartSubtotal || 0);
    return Math.max(0, subtotal - discountAmount);
  }, [cartSubtotal, discountAmount]);

  const onChange = (e) => {
    const { name, value } = e.target;
    setPayment((p) => ({ ...p, [name]: value }));
  };

  const handleCardNameChange = (e) => {
    const filtered = e.target.value.replace(/[^\p{L}\s]/gu, '');
    setPayment((p) => ({ ...p, cardName: filtered }));
  };

  const handleCardNumberChange = (e) => {
    let digits = e.target.value.replace(/\D/g, "").slice(0, 16);
    const grouped = digits.replace(/(\d{4})(?=\d)/g, "$1 ");
    setPayment((p) => ({ ...p, cardNumber: grouped }));
  };

  const handleExpiryChange = (e) => {
    let digits = e.target.value.replace(/\D/g, "").slice(0, 4);
    const monthStr = digits.slice(0, 2);
    const month = monthStr ? parseInt(monthStr, 10) : NaN;
    let formatted = digits.length >= 3 ? monthStr + "/" + digits.slice(2) : digits;
    if (digits.length >= 2) {
      if (isNaN(month) || month < 1 || month > 12) {
        setExpiryError("Mes inválido (01–12)");
      } else {
        setExpiryError("");
      }
    } else {
      setExpiryError("");
    }
    setPayment((p) => ({ ...p, expiry: formatted }));
  };

  const handleCvvChange = (e) => {
    let digits = e.target.value.replace(/\D/g, "").slice(0, 4);
    setPayment((p) => ({ ...p, cvv: digits }));
  };

  const handlePay = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!user?.id) {
      setError("Debes iniciar sesión para comprar.");
      return;
    }

    const exp = payment.expiry;
    const validFormat = /^\d{2}\/\d{2}$/.test(exp);
    const expMonth = validFormat ? parseInt(exp.slice(0,2), 10) : NaN;
    if (!validFormat || expMonth < 1 || expMonth > 12) {
      setError("Fecha de expiración inválida (MM/YY)");
      return;
    }
    const nameOk = /^([\p{L}]+(?:\s+[\p{L}]+)*)$/u.test(String(payment.cardName || '').trim());
    if (!nameOk) {
      setError("Nombre en la tarjeta inválido");
      return;
    }
    const cardDigits = String(payment.cardNumber || '').replace(/\D/g, '');
    if (cardDigits.length < 13 || cardDigits.length > 19) {
      setError("Número de tarjeta inválido");
      return;
    }
    const cvvDigits = String(payment.cvv || '').replace(/\D/g, '');
    if (!(cvvDigits.length === 3 || cvvDigits.length === 4)) {
      setError("CVV inválido");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/payments/checkout`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          userId: user.id,
          items: cartItems.map(it => {
            const basePrice = Number(it.price) || 0;
            const price = totalDiscountPercent > 0
              ? Math.round(basePrice * (1 - totalDiscountPercent / 100))
              : Math.round(basePrice);
            return {
              productId: Number(it.productId ?? it.id),
              nombre: it.name,
              cantidad: Number(it.qty ?? 1),
              price,
            };
          }),
          coupon: appliedCoupon ? { codigo: appliedCoupon.codigo, porcentaje: discountPercent } : null,
          duocBenefit: duocEligible ? { porcentaje: duocPercent } : null,
          payment: {
            cardName: payment.cardName,
            cardNumber: payment.cardNumber.replace(/\s/g, ""),
            expiry: payment.expiry,
            cvv: payment.cvv,
          },
        }),
      });

      if (!res.ok) {
        const msg = await res.text();
        throw new Error(msg || "No se pudo procesar el pago");
      }

      const data = await res.json();
      await clearCart();
      setSuccess(`Compra OK (Pago #${data.id}).`);
      navigate(`/compra/${data.id}`);
    } catch (err) {
      let msg = err?.message || "Error en el pago";
      const isConnRefused = msg.includes("Failed to fetch") || msg.includes("NetworkError") || err?.name === "TypeError";
      if (isConnRefused) {
        let port = "";
        try { const u = new URL(API_URL); port = u.port; } catch {}
        msg = port ? `No se pudo conectar con PaymentService (puerto ${port}).` : "No se pudo conectar con PaymentService.";
      }
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const applyCoupon = async () => {
    setCouponError("");
    setAppliedCoupon(null);
    const code = String(couponCode || "").trim();
    if (!code) { setCouponError("Ingresa un código de cupón"); return; }
    try {
      const c = await findCouponByCode(code);
      if (!c) { setCouponError("Cupon Inválido"); return; }
      const estado = String(c.estado || "").toUpperCase();
      if (estado !== "HABILITADO") { setCouponError("Cupon Deshabilitado"); return; }
      setAppliedCoupon(c);
    } catch (e) {
      const msg = e?.message === 'Network Error'
        ? 'No se pudo conectar con CouponsService (puerto 8084).'
        : (e?.message || 'Error al validar cupón');
      setCouponError(msg);
    }
  };

  return (
    <main>
      <div className="page-container">
        <h3>Pagar</h3>

        {error && <div className="alert alert-danger text-center">{error}</div>}
        {success && <div className="alert alert-success text-center">{success}</div>}

        <div className="row">
          <div className="col-md-6">
            <div className="cart-container">
              <h5>Tu Carrito</h5>
              {cartItems.length === 0 ? (
                <p>Carrito vacío</p>
              ) : (
                <>
                  {cartItems.map((item) => (
                    <div key={item.id} className="cart-list-item">
                      <div className="fw-semibold" style={{ flex: 1 }}>{item.name}</div>
                      <small className="text-light" style={{ marginRight: 10 }}>
                        {(item.qty || 1)} × ${Number(item.price || 0).toLocaleString("es-CL")}
                      </small>
                      <div className="fw-bold" style={{ marginRight: 10 }}>
                        ${(Number(item.price || 0) * (item.qty || 1)).toLocaleString("es-CL")}
                      </div>
                      <button
                        type="button"
                        className="btn btn-sm btn-danger"
                        aria-label="Eliminar"
                        onClick={() => removeFromCart(item.id)}
                      >
                        ×
                      </button>
                    </div>
                  ))}
                  <div className="cart-total">Subtotal: ${cartSubtotal.toLocaleString("es-CL")}</div>
                  <div className="mt-2">
                    <label className="form-label">Ingresar cupón</label>
                    <div className="d-flex gap-2">
                      <input
                        value={couponCode}
                        onChange={(e) => setCouponCode(e.target.value.toUpperCase().replace(/[^A-Za-z0-9-]/g, ''))}
                        className="form-control"
                        placeholder="Ej: DESCUENTO10"
                        style={{ maxWidth: 240 }}
                      />
                      <button type="button" className="btn btn-outline-light" onClick={applyCoupon}>Aplicar cupón</button>
                    </div>
                    {couponError && <small className="text-danger">{couponError}</small>}
                    {appliedCoupon && (
                      <div className="mt-2">
                        <small className="text-success">Cupón aplicado: {appliedCoupon.codigo} (-{discountPercent}%)</small>
                      </div>
                    )}
                    {duocEligible && (
                      <div className="mt-2">
                        <small className="text-success">Por ser usuario DUOCUC, usted tiene un 20% de Descuento!</small>
                      </div>
                    )}
                  </div>
                  {totalDiscountPercent > 0 && (
                    <div className="cart-total">Descuento: -${discountAmount.toLocaleString("es-CL")}</div>
                  )}
                  <div className="cart-total">Total: ${totalWithDiscount.toLocaleString("es-CL")}</div>
                </>
              )}
            </div>
          </div>
          <div className="col-md-6">
            <div className="payment-container">
              <form onSubmit={handlePay} className="payment-form">
                <div className="mb-3">
                  <label className="form-label">Nombre en la tarjeta</label>
                  <input
                    name="cardName"
                    value={payment.cardName}
                    onChange={handleCardNameChange}
                    required
                    className="form-control"
                    aria-label="Nombre en la tarjeta"
                  />
                </div>
                <div className="mb-3">
                  <label className="form-label">Número de tarjeta</label>
                  <input
                    name="cardNumber"
                    inputMode="numeric"
                    maxLength={19}
                    value={payment.cardNumber}
                    onChange={handleCardNumberChange}
                    placeholder="1234 5678 9012 3456"
                    required
                    className="form-control"
                    aria-label="Número de tarjeta"
                  />
                </div>
                <div className="row">
                  <div className="col mb-3">
                    <label className="form-label">Expira (MM/YY)</label>
                    <input
                      name="expiry"
                      inputMode="numeric"
                      maxLength={5}
                      value={payment.expiry}
                      onChange={handleExpiryChange}
                      placeholder="MM/YY"
                      required
                      className="form-control"
                      aria-label="Fecha de expiración"
                    />
                    {expiryError && <small className="text-danger">{expiryError}</small>}
                  </div>
                  <div className="col mb-3">
                    <label className="form-label">CVV</label>
                    <input
                      name="cvv"
                      inputMode="numeric"
                      maxLength={4}
                      value={payment.cvv}
                      onChange={handleCvvChange}
                      required
                      className="form-control"
                      aria-label="CVV"
                    />
                  </div>
                </div>
                <div className="d-flex justify-content-center">
                  <button className="btn btn-custom" type="submit" disabled={loading || !!expiryError}>
                    {loading ? "Procesando..." : "Pagar ahora"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
