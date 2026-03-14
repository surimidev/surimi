'use client';

import { useState } from 'react';

import './counter.css';

interface CounterProps {
  className?: string;
}

export const Counter = ({ className }: CounterProps) => {
  const [count, setCount] = useState(0);

  return (
    <div className={className}>
      <button type="button" onClick={() => setCount((c) => c + 1)}>
        count is {count}
      </button>
    </div>
  );
};
