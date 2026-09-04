import { Link } from "react-router-dom";
import { formatRupees } from "../utils/format";

export default function ProductCard({ product }) {
  const { defaultVariant } = product;

  return (
    <Link
      to={`/products/${product.slug}`}
      className="group block border border-line bg-card transition-colors hover:border-forest"
    >
      <div className="aspect-square overflow-hidden bg-paper">
        {defaultVariant?.image_url && (
          <img
            src={defaultVariant.image_url}
            alt={product.name}
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
        )}
      </div>
      <div className="p-4">
        <p className="text-xs text-ink-soft">{product.brand}</p>
        <h3 className="font-display text-lg leading-snug">{product.name}</h3>
        {defaultVariant && (
          <div className="mt-2 flex items-baseline gap-2">
            <span className="font-medium">{formatRupees(defaultVariant.price)}</span>
            {defaultVariant.mrp > defaultVariant.price && (
              <span className="text-sm text-ink-soft line-through">
                {formatRupees(defaultVariant.mrp)}
              </span>
            )}
          </div>
        )}
        <p className="mt-1 text-xs text-cashback">EMI plans backed by mutual funds</p>
      </div>
    </Link>
  );
}
