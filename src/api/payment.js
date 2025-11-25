// api/payment.js
import axios from "axios";

const baseURL = import.meta.env.VITE_PAYMENT_BASEURL; 
// EJ: http://56.228.34.53:8083/api/payments

export const paymentApi = axios.create({ baseURL });

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
