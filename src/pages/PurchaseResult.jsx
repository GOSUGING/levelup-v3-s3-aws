import React, { useEffect, useState, useRef } from "react";
import { useParams, Link } from "react-router-dom";
import { PRODUCTS } from "../data/products";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import QRCode from "qrcode";

const API_URL =
  import.meta.env.VITE_PAYMENT_BASEURL ??
  "http://56.228.34.53:8083";

export default function PurchaseResult() {
  const { id } = useParams();
  const [payment, setPayment] = useState(null);
  const [items, setItems] = useState([]);
  const [qrCode, setQrCode] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const pdfRef = useRef();

  // ======================
  // Cargar pago + QR
  // ======================
  useEffect(() => {
    const cargar = async () => {
      try {
        setLoading(true);
        setError("");

        const res = await fetch(`${API_URL}/api/payments/${id}`);
        if (!res.ok) throw new Error("No se pudo cargar el pago");

        const data = await res.json();
        setPayment(data);

        // Parsear rawPayload
        let raw = data.rawPayload;
        let parsed = [];

        try {
          if (!raw) parsed = [];
          else if (typeof raw === "string") parsed = JSON.parse(raw);
          else if (Array.isArray(raw)) parsed = raw;
          else parsed = [];
        } catch {
          parsed = [];
        }

        setItems(parsed);

        // Generar Código QR
        const qrText = `Compra ID: ${data.id}\nTotal: ${data.total}\nCliente: ${data.nombreUsuario}`;
        const qrURL = await QRCode.toDataURL(qrText);
        setQrCode(qrURL);

      } catch (err) {
        setError(err?.message || "Error al cargar detalle");
      } finally {
        setLoading(false);
      }
    };

    cargar();
    window.scrollTo(0, 0);
  }, [id]);

  // ======================
  // Descargar PDF
  // ======================
  const downloadPDF = async () => {
    const input = pdfRef.current;
    const canvas = await html2canvas(input, { scale: 3 });
    const imgData = canvas.toDataURL("image/png");

    const pdf = new jsPDF("p", "mm", "a4");
    const width = pdf.internal.pageSize.getWidth();
    const height = (canvas.height * width) / canvas.width;

    pdf.addImage(imgData, "PNG", 0, 0, width, height);
    pdf.save(`boleta_${id}.pdf`);
  };

  // ======================
  // Enviar por correo (requiere endpoint backend)
  // ======================
  const sendEmail = async () => {
    alert("📩 Esta función requiere un endpoint en el backend.");
  };

  return (
    <main>
      <div className="result-container" style={{ padding: "20px" }}>
        <h2 className="text-center mb-4 animate__animated animate__fadeInDown">Compra realizada con éxito 🎉</h2>

        {loading && <p>Cargando...</p>}
        {error && <div className="alert alert-danger">{error}</div>}

        {payment && (
          <div
            ref={pdfRef}
            style={{
              background: "white",
              padding: "25px",
              borderRadius: "10px",
              width: "100%",
              maxWidth: "750px",
              margin: "0 auto",
              boxShadow: "0 0 15px rgba(0,0,0,0.15)",
              animation: "fadeIn 0.6s ease"
            }}
          >
            {/* ENCABEZADO */}
            <div style={{ textAlign: "center", marginBottom: "20px" }}>
              <h3 style={{ marginBottom: 0 }}>BOLETA ELECTRÓNICA</h3>
              <small style={{ color: "#777" }}>
                Confirmación: <strong>{payment.id}</strong>
              </small>
            </div>

            {/* QR */}
            <div style={{ textAlign: "center", marginBottom: "20px" }}>
              <img src={qrCode} alt="QR de compra" width={120} />
              <p style={{ marginTop: "5px" }}>Escanea tu código QR</p>
            </div>

            {/* INFO CLIENTE */}
            <div style={{ marginBottom: "15px" }}>
              <p><strong>Estado:</strong> {payment.estado}</p>
              <p><strong>Fecha:</strong> {payment.fecha}</p>
              <p><strong>Cliente:</strong> {payment.nombreUsuario}</p>
              <p><strong>Dirección de envío:</strong> {payment.direccionEnvio}</p>
            </div>

            <hr />

            {/* TABLA PRODUCTOS */}
            <h5>Productos comprados</h5>
            <table className="table table-striped" style={{ fontSize: "0.9rem" }}>
              <thead>
                <tr>
                  <th>Producto</th>
                  <th>Cant.</th>
                  <th>Precio</th>
                  <th>Total</th>
                </tr>
              </thead>
              <tbody>
                {items.map((it, idx) => {
                  const ref = PRODUCTS.find(
                    (p) => String(p.id) === String(it.productId)
                  );
                  const nombre = ref?.name || `Producto #${it.productId}`;
                  const img = ref?.img || null;

                  return (
                    <tr key={idx}>
                      <td>
                        <div style={{ display: "flex", alignItems: "center" }}>
                          {img && (
                            <img
                              src={img}
                              alt={nombre}
                              style={{
                                width: "50px",
                                height: "50px",
                                marginRight: "10px",
                                borderRadius: "5px",
                                objectFit: "cover"
                              }}
                            />
                          )}
                          {nombre}
                        </div>
                      </td>
                      <td>{it.cantidad}</td>
                      <td>${Number(it.price).toLocaleString("es-CL")}</td>
                      <td>
                        ${Number(it.cantidad * it.price).toLocaleString("es-CL")}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>

            <hr />

            {/* RESUMEN TOTAL */}
            <div style={{ textAlign: "right", fontSize: "1.15rem" }}>
              <p>
                <strong>Total pagado:</strong>{" "}
                ${Number(payment.total).toLocaleString("es-CL")}
              </p>
              <p style={{ color: "gray" }}>
                Incluye IVA correspondiente
              </p>
            </div>

            <hr />

            {/* BOTONES */}
            <div className="d-flex justify-content-between mt-4">
              <button className="btn btn-success" onClick={downloadPDF}>
                Descargar PDF
              </button>

              <button className="btn btn-primary" onClick={sendEmail}>
                Enviar por correo
              </button>

              <Link to="/" className="btn btn-outline-dark">
                Volver al inicio
              </Link>
            </div>

            <div className="text-center mt-3">
              <Link to="/perfil" className="btn btn-link">
                Ver mis pedidos →
              </Link>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
