import React, { useState } from 'react';

export interface StarRatingProps {
  label: string;
  icon?: string;
  value?: number;
  defaultValue?: number;
  readOnly?: boolean;
  onChange?: (value: number) => void;
}

export function StarRating({ label, icon, value, defaultValue = 3, readOnly, onChange }: StarRatingProps) {
  const [internal, setInternal] = useState(defaultValue);
  const current = value ?? internal;

  function handleStarClick(star: number) {
    if (readOnly) return;
    const next = star === current ? star - 1 : star;
    if (value === undefined) setInternal(next);
    onChange?.(next);
  }

  return (
    <div className="pl-rating">
      <span className="pl-rating-label">
        {icon && (
          <span className="pl-icon" aria-hidden="true">
            {icon}
          </span>
        )}
        {label}
      </span>
      <div className="pl-stars" aria-label={label}>
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            className={`pl-star${star <= current ? ' pl-star-on' : ''}`}
            aria-pressed={star <= current}
            aria-label={`${star} estrela${star > 1 ? 's' : ''}`}
            disabled={readOnly}
            onClick={() => handleStarClick(star)}
          >
            <span className={`pl-icon${star <= current ? ' pl-icon-fill' : ''}`} aria-hidden="true">
              star
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}
