import axios from 'axios';

// Base URL del microservicio de productos

const baseURL = import.meta.env?.VITE_PRODUCT_BASEURL || 'http://56.228.34.53:8085';

export const api = axios.create({
  baseURL,
});
// Obtiene lista de productos: soporta respuesta plana (array) o paginada (Spring Page)
export async function getProducts() {
  const { data } = await api.get('/api/v1/products');
  if (Array.isArray(data)) return data;
  if (data && Array.isArray(data.content)) return data.content;
  return [];
}

// Obtiene un producto por ID
export async function getProduct(id) {
  const { data } = await api.get(`/api/v1/products/${id}`);
  return data;
}

// Actualiza un producto completo (PUT /{id})
export async function updateProduct(product) {
  const { data } = await api.put(`/api/v1/products/${product.id}`,
    {
      id: product.id,
      name: product.name,
      description: product.description,
      price: Number(product.price),
      img: product.img,
      category: product.category,
      stock: Number(product.stock),
    }
  );
  return data;
}

// Crea un nuevo producto
export async function createProduct(product) {
  const payload = {
    name: product.name,
    description: product.description,
    price: Number(product.price),
    img: product.img,
    category: product.category,
    stock: Number(product.stock),
  }
  const { data } = await api.post('/api/v1/products', payload)
  return data
}

export async function uploadProductImage(file) {
  const fd = new FormData()
  fd.append('file', file)
  const { data } = await api.post('/api/v1/products/image', fd, {
    headers: { 'Content-Type': 'multipart/form-data' }
  })
  return data
}

export async function deleteProduct(id) {
  await api.delete(`/api/v1/products/${id}`)
}

// Configuración de productos destacados
export async function getFeaturedConfig() {
  const { data } = await api.get('/api/v1/products/featured-config')
  return data
}

export async function saveFeaturedConfig({ title, maxCount, productIds }) {
  const payload = { title, maxCount: Number(maxCount), productIds }
  const { data } = await api.put('/api/v1/products/featured-config', payload)
  return data
}

