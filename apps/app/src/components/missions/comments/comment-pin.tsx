"use client";

import { useState } from "react";

type CommentPinProps = {
  count: number;
  onClick: () => void;
  label?: string;
};

export function CommentPin({ count, onClick, label }: CommentPinProps) {
  const [hover, setHover] = useState(false);

  return (
    <div
      className="absolute left-10 top-2 z-10"
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
    >
      {/* Pin */}
      <button
        type="button"
        onClick={onClick}
        className="
          relative h-9 w-9 rounded-full
          flex items-center justify-center
          bg-white shadow-lg shadow-slate-300/60
          border-2 border-sky-500
          outline-none
        "
      >
        <span
          className="
            flex h-6 w-6 items-center justify-center rounded-full
            bg-red-500 text-white text-[13px] font-semibold
          "
        >
          {count}
        </span>

        {/* petite “queue” en bas à gauche */}
        <span
          className="
            absolute -bottom-1 left-1.5
            h-3 w-3 rounded-bl-2xl rounded-tr-full
            bg-white border-l-2 border-b-2 border-sky-500
          "
        />
      </button>

      {/* Tooltip / bulle avec le texte de la question */}
      {hover && label && (
        <div
          className="
            absolute left-1/2 mt-2 w-max max-w-xs -translate-x-1/2
            rounded-2xl border border-sky-400 bg-white
            px-3 py-2 shadow-lg shadow-slate-300/60
          "
        >
          <p className="text-[11px] font-medium text-slate-900 line-clamp-2">
            {label}
          </p>
        </div>
      )}
    </div>
  );
}
