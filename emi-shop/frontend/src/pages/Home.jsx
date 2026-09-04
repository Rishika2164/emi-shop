import { useEffect, useState } from "react";
import { fetchProducts } from "../api/client";
import ProductCard from "../components/ProductCard";

export default function Home() {
  const [products, setProducts] = useState([]);
  const [status, setStatus] = useState("loading");

  useEffect(() => {
    fetchProducts()
      .then((data) => {
        setProducts(data.products);
        setStatus("ready");
      })
      .catch(() => setStatus("error"));
  }, []);

  return (
    <main className="mx-auto max-w-6xl px-6 py-12">
      <header className="mb-10 max-w-xl">
        <h1 className="font-display text-3xl leading-tight">
          Own it today, pay in pieces backed by your mutual funds
        </h1>
        <p className="mt-3 text-ink-soft">
          Pick a phone, choose a tenure that fits your budget, and let your SIP cover the rest.
        </p>
      </header>

      {status === "loading" && <p className="text-ink-soft">Loading products…</p>}
      {status === "error" && (
        <p className="text-ink-soft">
          Couldn't reach the API. Make sure the backend server is running.
        </p>
      )}

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </main>
  );
}
