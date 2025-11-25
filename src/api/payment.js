// api/payment.js
import axios from "axios";

// El .env entrega solo el host/puerto
// Ej: http://56.228.34.53:8083
const base = import.meta.env.VITE_PAYMENT_BASEURL;

// Agregamos la ruta real del controller
// Resultado final: http://56.228.34.53:8083/api/payments
const paymentApi = axios.create({
  baseURL: base + "/api/payments"
});

// --- ENDPOINTS ---

export async function checkout(payload) {
  const { data } = await paymentApi.post("/checkout", payload);
  return data;
}

export async function getPayments() {
  const { data } = await paymentApi.get("/");
  return Array.isArray(data) ? data : [];
}

export async function getPayment(id) {
  const { data } = await paymentApi.get(`/${id}`);
  return data;
}
