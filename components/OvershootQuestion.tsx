import React from "react";

interface Props {
  overshootAmount: number;
  setOvershootAmount: (v: number) => void;
}

export default function OvershootQuestion({
  overshootAmount,
  setOvershootAmount,
}: Props) {
  const hasOvershoot = overshootAmount > 0;

  const handleYes = () => {
    if (overshootAmount <= 0) {
      setOvershootAmount(50); // default guess
    }
  };

  const handleNo = () => {
    setOvershootAmount(0);
  };

  return (
    <div className="mt-6 bg-yellow-50 border border-yellow-200 p-4 rounded-xl text-sm">
      <div className="font-semibold text-yellow-800 mb-1">
        🟡 Do you sometimes spend more than this?
      </div>
      <p className="text-yellow-900 text-sm mb-3 leading-relaxed">
        Many people use extra money like credit card, Klarna/pay-in-3,
        overdraft or help from family and friends. This is normal.
        <br />
        <strong>This is optional</strong> — you can skip this and continue. If you want, you can add this extra spending here, so your plan
        stays real.
      </p>

      <div className="flex gap-2 mb-3">
        <button
          type="button"
          onClick={handleYes}
          className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-all ${
            hasOvershoot
              ? "bg-yellow-600 text-white"
              : "bg-yellow-100 text-yellow-800 hover:bg-yellow-200"
          }`}
        >
          Yes, I spend extra
        </button>
        <button
          type="button"
          onClick={handleNo}
          className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-all ${
            !hasOvershoot
              ? "bg-gray-800 text-white"
              : "bg-gray-100 text-gray-800 hover:bg-gray-200"
          }`}
        >
          No, I don't
        </button>
      </div>

      {hasOvershoot && (
        <div className="mt-2">
          <div className="flex justify-between mb-1">
            <span className="text-xs text-yellow-900">
              Extra spending on credit (per month)
            </span>
            <span className="text-xs font-semibold text-yellow-900">
              £{overshootAmount.toFixed(0)}
            </span>
          </div>
          <input
            type="range"
            min={0}
            max={500}
            step={10}
            value={overshootAmount}
            onChange={(e) => setOvershootAmount(Number(e.target.value))}
            className="w-full h-2 bg-yellow-200 rounded-lg appearance-none cursor-pointer slider"
            style={{
              background: `linear-gradient(to right, #FCD34D 0%, #FCD34D ${(overshootAmount / 500) * 100}%, #FEF3C7 ${(overshootAmount / 500) * 100}%, #FEF3C7 100%)`
            }}
          />
          <div className="flex justify-between text-[11px] text-yellow-800 mt-1">
            <span>£0</span>
            <span>£500</span>
          </div>
          <p className="text-[11px] text-yellow-900 mt-1">
            A small guess is fine. This just helps explain your debt
            better.
          </p>
        </div>
      )}
    </div>
  );
}

