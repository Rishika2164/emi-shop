import { Routes, Route, Link } from "react-router-dom";
import Home from "./pages/Home";
import ProductDetail from "./pages/ProductDetail";

export default function App() {
  return (
    <div className="min-h-screen">
      <nav className="border-b border-line bg-card">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <Link to="/" className="font-display text-xl">
            Sprout
          </Link>
          <span className="text-xs text-ink-soft">Shop now, invest later</span>
        </div>
      </nav>

      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/products/:slug" element={<ProductDetail />} />
      </Routes>
    </div>
  );
}
