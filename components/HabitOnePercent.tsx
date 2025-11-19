'use client';

import { useState, useEffect } from "react";

export default function HabitOnePercent({
  monthlyIncome,
}: {
  monthlyIncome: number;
}) {
  const [showSetup, setShowSetup] = useState(false);
  const [target, setTarget] = useState<number | null>(null);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem("zdebt_habit_target");
    if (saved) {
      const num = Number(saved);
      if (!Number.isNaN(num) && num > 0) {
        setTarget(num);
      }
    }
    
    // Check if dismissed in this session
    const dismissedFlag = sessionStorage.getItem("zdebt_habit_dismissed");
    if (dismissedFlag === "true") {
      setDismissed(true);
    }
  }, []);

  const onePercent = monthlyIncome * 0.01;

  const saveTarget = () => {
    if (target && target > 0) {
      localStorage.setItem("zdebt_habit_target", String(target));
      setShowSetup(false);
    }
  };

  const clearTarget = () => {
    localStorage.removeItem("zdebt_habit_target");
    setTarget(null);
    setShowSetup(false);
  };

  // Hide if dismissed for this session
  if (dismissed && !target && !showSetup) {
    return null;
  }

  // Show target if user already set one and not editing
  if (target && !showSetup) {
    return (
      <div className="bg-green-50 border border-green-200 p-4 rounded-xl mb-6">
        <div className="font-bold text-green-800 text-lg">
          🌱 Your 1% Habit Target
        </div>
        <p className="text-sm text-green-900 mt-1">
          You chose a monthly improvement of{" "}
          <strong>£{target.toFixed(2)}</strong>.
        </p>

        <button
          className="mt-3 text-sm text-green-700 underline hover:text-green-900 transition-colors"
          onClick={() => setShowSetup(true)}
        >
          Change or remove target
        </button>
      </div>
    );
  }

  return (
    <div className="bg-green-50 border border-green-200 p-4 rounded-xl mb-6">
      {!showSetup && (
        <>
          <div className="font-semibold text-green-800 text-lg">
            🌱 The 1% Habit (Optional)
          </div>

          <p className="text-sm text-green-900 mt-2 leading-relaxed">
            A small monthly improvement — your choice how.
            <br />
            <br />
            This is not advice — it's a simple habit idea.
            <br />
            <br />
            1% of your monthly income = <strong>£{onePercent.toFixed(2)}</strong>
            <br />
            (That's £{(onePercent * 12).toFixed(2)} per year.)
          </p>

          <div className="mt-4 text-sm text-green-900">
            <p className="mb-2">People usually improve 1% by:</p>
            <ul className="list-disc list-inside space-y-1 text-xs">
              <li>earning a bit more (extra hours, side work)</li>
              <li>or spending a bit less (one subscription or takeaway)</li>
            </ul>
          </div>

          <p className="text-sm text-green-900 mt-4">
            Would you like to track a small monthly improvement target?
            <br />
            It's your choice — no pressure.
          </p>

          <div className="mt-4 flex gap-2">
            <button
              className="flex-1 bg-green-600 text-white py-2 rounded-lg font-semibold hover:bg-green-700 transition-colors"
              onClick={() => {
                setTarget(Math.round(onePercent));
                setShowSetup(true);
              }}
            >
              Set a 1% target
            </button>

            <button
              className="flex-1 bg-gray-200 text-gray-800 py-2 rounded-lg font-semibold hover:bg-gray-300 transition-colors"
              onClick={() => {
                // Hide the component for this session only
                sessionStorage.setItem("zdebt_habit_dismissed", "true");
                setDismissed(true);
              }}
            >
              Not now
            </button>
          </div>

          <p className="text-[11px] text-green-900 mt-3 opacity-70">
            This is a habit idea, not advice.
          </p>
        </>
      )}

      {showSetup && (
        <div className="mt-2">
          <div className="mb-2 text-sm font-medium text-green-800">
            📈 Choose your monthly improvement
          </div>

          <p className="text-xs text-green-900 mb-3">
            A small amount can help over time.
          </p>

          <div className="flex justify-between text-xs text-green-700 mb-1">
            <span>£10</span>
            <span>£200</span>
          </div>

          <input
            type="range"
            min={10}
            max={200}
            step={5}
            value={target ?? Math.round(onePercent)}
            onChange={(e) => setTarget(Number(e.target.value))}
            className="w-full h-2 bg-green-200 rounded-lg appearance-none cursor-pointer slider"
            style={{
              background: `linear-gradient(to right, #16A34A 0%, #16A34A ${((target ?? Math.round(onePercent)) - 10) / 190 * 100}%, #D1FAE5 ${((target ?? Math.round(onePercent)) - 10) / 190 * 100}%, #D1FAE5 100%)`
            }}
          />

          <div className="text-sm text-green-900 mt-3 font-semibold">
            Monthly improvement: <strong>£{(target ?? Math.round(onePercent)).toFixed(2)}</strong>
          </div>

          <div className="flex gap-2 mt-4">
            <button
              onClick={saveTarget}
              className="flex-1 bg-green-600 text-white py-2 rounded-lg font-semibold hover:bg-green-700 transition-colors"
            >
              Save target
            </button>

            <button
              onClick={clearTarget}
              className="flex-1 bg-gray-200 text-gray-800 py-2 rounded-lg font-semibold hover:bg-gray-300 transition-colors"
            >
              Remove
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

