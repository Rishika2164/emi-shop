export default function VariantSelector({ variants, selectedId, onSelect }) {
  const storages = [...new Set(variants.map((v) => v.storage).filter(Boolean))];
  const colors = [...new Set(variants.map((v) => v.color))];

  const selected = variants.find((v) => v.id === selectedId);

  function pick(storage, color) {
    const match = variants.find(
      (v) => (storage ? v.storage === storage : true) && v.color === color
    );
    if (match) onSelect(match.id);
  }

  return (
    <div className="space-y-4">
      {storages.length > 0 && (
        <div>
          <p className="mb-2 text-sm text-ink-soft">Storage</p>
          <div className="flex flex-wrap gap-2">
            {storages.map((storage) => {
              const isActive = selected?.storage === storage;
              const available = variants.some((v) => v.storage === storage);
              return (
                <button
                  key={storage}
                  type="button"
                  disabled={!available}
                  onClick={() => pick(storage, selected.color)}
                  className={`border px-3 py-1.5 text-sm transition-colors ${
                    isActive
                      ? "border-forest bg-forest text-white"
                      : "border-line hover:border-forest"
                  }`}
                >
                  {storage}
                </button>
              );
            })}
          </div>
        </div>
      )}

      <div>
        <p className="mb-2 text-sm text-ink-soft">Colour — {selected?.color}</p>
        <div className="flex flex-wrap gap-2">
          {colors.map((color) => {
            const variantForColor = variants.find(
              (v) => v.color === color && (!selected?.storage || v.storage === selected.storage)
            );
            const isActive = selected?.color === color;
            const swatch = variants.find((v) => v.color === color)?.color_hex || "#ccc";
            return (
              <button
                key={color}
                type="button"
                disabled={!variantForColor}
                title={color}
                onClick={() => variantForColor && onSelect(variantForColor.id)}
                className={`h-8 w-8 rounded-full border-2 transition-transform ${
                  isActive ? "scale-110 border-forest" : "border-transparent"
                } ${!variantForColor ? "cursor-not-allowed opacity-30" : ""}`}
                style={{ backgroundColor: swatch }}
              />
            );
          })}
        </div>
      </div>
    </div>
  );
}
