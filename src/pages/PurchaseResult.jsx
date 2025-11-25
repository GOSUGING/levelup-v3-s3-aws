import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { PRODUCTS } from "../data/products";

const API_URL =
  import.meta.env.VITE_PAYMENT_BASEURL ??
  "http://56.228.34.53:8083";

export default function PurchaseResult() {
  const { id } = useParams();
  const [payment, setPayment] = useState(null);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const cargar = async () => {
      try {
        setLoading(true);
        setError("");
        const res = await fetch(`${API_URL}/api/payments/${id}`);
        if (!res.ok) throw new Error("No se pudo cargar el pago");
        const data = await res.json();
        setPayment(data);

        try {
          const raw = data?.rawPayload || "[]";
          const parsed = JSON.parse(raw);
          setItems(Array.isArray(parsed) ? parsed : []);
        } catch {
          setItems([]);
        }
      } catch (e) {
        setError(e?.message || "Error al cargar el detalle de compra");
      } finally {
        setLoading(false);
      }
    };
    cargar();
    window.scrollTo(0, 0);
  }, [id]);

  return (
    <main>
      <div className="result-container">
        <h2>Detalle de la Compra</h2>
        {loading && <p>Cargando detalle...</p>}
        {error && <div className="alert alert-danger">{error}</div>}

        {payment && (
          <>
            <p><strong>ID de Pago:</strong> {payment.id}</p>
            <p><strong>Estado:</strong> {payment.estado}</p>
            <p><strong>Total:</strong> ${Number(payment.total || 0).toLocaleString("es-CL")}</p>
            <p><strong>Cantidad total:</strong> {payment.cantidad || 0}</p>

            <hr />
            <h5>Items</h5>
            {items.length > 0 ? (
              <div style={{ textAlign: "left", margin: "0 auto", maxWidth: 600 }}>
                {items.map((it, idx) => {
                  const ref = PRODUCTS.find(p => String(p.id) === String(it.productId));
                  const nombre = it.nombre || ref?.name || `Producto #${it.productId}`;
                  return (
                    <div key={idx} style={{ display: "flex", justifyContent: "space-between", padding: "6px 0" }}>
                      <span>{nombre}</span>
                      <span>{it.cantidad} × ${Number(it.price || 0).toLocaleString("es-CL")}</span>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p>No hay items para mostrar.</p>
            )}

            <div className="mt-4">
              <Link to="/" className="btn btn-outline-dark">
                Volver a la página principal
              </Link>
            </div>
          </>
        )}
      </div>
    </main>
  );
}