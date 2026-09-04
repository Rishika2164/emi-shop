import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { fetchProductBySlug } from "../api/client";
import VariantSelector from "../components/VariantSelector";
import EmiPlanRow from "../components/EmiPlanRow";
import { formatRupees } from "../utils/format";

export default function ProductDetail() {
  const { slug } = useParams();
  const [product, setProduct] = useState(null);
  const [status, setStatus] = useState("loading");
  const [selectedVariantId, setSelectedVariantId] = useState(null);
  const [selectedPlanId, setSelectedPlanId] = useState(null);
  const [confirmed, setConfirmed] = useState(false);

  useEffect(() => {
    setStatus("loading");
    setConfirmed(false);
    fetchProductBySlug(slug)
      .then((data) => {
        setProduct(data.product);
        const defaultVariant = data.product.variants.find((v) => v.is_default) || data.product.variants[0];
        setSelectedVariantId(defaultVariant?.id);
        setSelectedPlanId(defaultVariant?.emiPlans?.[0]?.id);
        setStatus("ready");
      })
      .catch(() => setStatus("error"));
  }, [slug]);

  if (status === "loading") {
    return <main className="mx-auto max-w-5xl px-6 py-12 text-ink-soft">Loading…</main>;
  }

  if (status === "error" || !product) {
    return (
      <main className="mx-auto max-w-5xl px-6 py-12">
        <p className="text-ink-soft">Couldn't find that product.</p>
        <Link to="/" className="mt-2 inline-block text-forest underline">
          Back to all products
        </Link>
      </main>
    );
  }

  const variant = product.variants.find((v) => v.id === selectedVariantId) || product.variants[0];
  const plan = variant.emiPlans.find((p) => p.id === selectedPlanId) || variant.emiPlans[0];

  function handleVariantChange(variantId) {
    setSelectedVariantId(variantId);
    const newVariant = product.variants.find((v) => v.id === variantId);
    setSelectedPlanId(newVariant?.emiPlans?.[0]?.id);
    setConfirmed(false);
  }

  return (
    <main className="mx-auto max-w-5xl px-6 py-12">
      <Link to="/" className="text-sm text-ink-soft hover:text-forest">
        ← All products
      </Link>

      <div className="mt-6 grid grid-cols-1 gap-10 lg:grid-cols-2">
        <div>
          <div className="aspect-square overflow-hidden border border-line bg-white">
            {variant.image_url && (
              <img
                src={variant.image_url}
                alt={`${product.name} in ${variant.color}`}
                className="h-full w-full object-cover"
              />
            )}
          </div>
        </div>

        <div>
          {variant.mrp > variant.price && (
            <span className="mb-2 inline-block bg-gold px-2 py-0.5 text-xs font-medium text-white">
              NEW
            </span>
          )}
          <h1 className="font-display text-3xl leading-tight">{product.name}</h1>
          <p className="text-ink-soft">
            {variant.storage ? `${variant.storage} · ` : ""}
            {product.brand}
          </p>

          <div className="mt-4 flex items-baseline gap-3">
            <span className="text-2xl font-medium">{formatRupees(variant.price)}</span>
            {variant.mrp > variant.price && (
              <span className="text-ink-soft line-through">{formatRupees(variant.mrp)}</span>
            )}
          </div>

          <p className="mt-6 text-sm text-ink-soft">{product.description}</p>

          <div className="mt-6 border-t border-line pt-6">
            <VariantSelector
              variants={product.variants}
              selectedId={selectedVariantId}
              onSelect={handleVariantChange}
            />
          </div>

          <div className="mt-8">
            <h2 className="font-display text-lg">EMI plans backed by mutual funds</h2>
            <div className="mt-3 divide-y divide-line border border-line bg-paper">
              {variant.emiPlans.map((emiPlan) => (
                <EmiPlanRow
                  key={emiPlan.id}
                  plan={emiPlan}
                  isSelected={emiPlan.id === selectedPlanId}
                  onSelect={setSelectedPlanId}
                />
              ))}
            </div>
          </div>

          <button
            type="button"
            onClick={() => setConfirmed(true)}
            className="mt-6 w-full bg-forest py-3 font-medium text-white transition-colors hover:bg-forest-dark"
          >
            Proceed with {formatRupees(plan.monthly_amount)}/mo for {plan.tenure_months} months
          </button>

          {confirmed && (
            <p className="mt-3 text-sm text-cashback">
              Plan selected — {variant.color} {variant.storage}, {plan.tenure_months} months at{" "}
              {plan.interest_rate}% interest.
            </p>
          )}
        </div>
      </div>
    </main>
  );
}
