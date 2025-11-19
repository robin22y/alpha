import { useState, useEffect } from "react";

interface Props {
  onSelect: (value: boolean) => void;
}

export default function LifeBufferAsk({ onSelect }: Props) {
  const [show, setShow] = useState(false);
  
  useEffect(() => {
    const seen = localStorage.getItem("zdebt_life_buffer_choice");
    if (!seen) setShow(true);
  }, []);

  const choose = (value: string) => {
    localStorage.setItem("zdebt_life_buffer_choice", value);
    setShow(false);
    onSelect(value === "yes");
  };

  if (!show) return null;

  return (
    <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-xl shadow-sm mb-6">
      <div className="font-semibold text-yellow-800 text-lg mb-2">
        🟡 Add a small safety amount?
      </div>
      <p className="text-sm text-yellow-900 leading-relaxed mb-3">
        Real life has small surprise costs: school trip, birthday gift,
        repair, travel, broken item. These can add £50–£200 in a month.
        Adding a small "Life Happens" amount keeps your plan real.
        <br />
        <span className="text-xs opacity-80">(You can change this anytime.)</span>
      </p>
      <div className="space-y-2">
        <button
          onClick={() => choose("yes")}
          className="w-full bg-yellow-600 text-white py-2 rounded-lg font-semibold hover:bg-yellow-700 transition-all"
        >
          Yes, add it
        </button>
        <button
          onClick={() => choose("no")}
          className="w-full bg-gray-200 text-gray-800 py-2 rounded-lg font-semibold hover:bg-gray-300 transition-all"
        >
          No, not now
        </button>
      </div>
    </div>
  );
}

