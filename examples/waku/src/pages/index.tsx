'use client';

import { Counter } from '../components/counter';

import '../app.css';

export default function HomePage() {
  return (
    <div id="app">
      <h1>Surimi</h1>
      <div className="card">
        <Counter className="counter counter-a" />
        <Counter className="counter counter-b" />
      </div>
    </div>
  );
}
