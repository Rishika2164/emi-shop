import { formatRupees } from "../utils/format";

export default function EmiPlanRow({ plan, isSelected, onSelect }) {
  return (
    <label
      className={`flex cursor-pointer items-center justify-between gap-4 border-l-2 px-4 py-3 transition-colors ${
        isSelected ? "border-forest bg-white" : "border-transparent hover:bg-white/60"
      }`}
    >
      <div className="flex items-center gap-3">
        <input
          type="radio"
          name="emi-plan"
          checked={isSelected}
          onChange={() => onSelect(plan.id)}
          className="h-4 w-4 accent-forest"
        />
        <div>
          <div className="flex items-baseline gap-2">
            <span className="font-medium">{formatRupees(plan.monthly_amount)}</span>
            <span className="text-sm text-ink-soft">x {plan.tenure_months} months</span>
          </div>
          {plan.cashback_amount > 0 && (
            <p className="text-xs text-cashback">
              Additional cashback of {formatRupees(plan.cashback_amount)}
            </p>
          )}
        </div>
      </div>
      <span className="whitespace-nowrap text-sm text-ink-soft">
        {plan.interest_rate === 0 ? "0% interest" : `${plan.interest_rate}% interest`}
      </span>
    </label>
  );
}
