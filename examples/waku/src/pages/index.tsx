import { Counter } from '../components/counter';

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

export const getConfig = () => {
  return { render: 'static' } as const;
};
