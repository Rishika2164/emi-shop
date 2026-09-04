const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:4000/api";

async function request(path) {
  const res = await fetch(`${API_BASE}${path}`);
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error || `Request failed: ${res.status}`);
  }
  return res.json();
}

export function fetchProducts() {
  return request("/products");
}

export function fetchProductBySlug(slug) {
  return request(`/products/${slug}`);
}
