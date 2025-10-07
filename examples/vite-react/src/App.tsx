import { useState } from 'react';

import Button from '#components/button';

import './App.css';

function App() {
  const [count, setCount] = useState(0);

  return (
    <div id="app">
      <div>
        <a href="https://vite.dev" target="_blank" rel="noopener noreferrer">
          vite
        </a>
        <a href="https://react.dev" target="_blank" rel="noopener noreferrer">
          react
        </a>
      </div>
      <h1>Surimi + Vite + React</h1>
      <div className="card">
        <Button
          kind="primary"
          onClick={() => {
            setCount(count => count + 1);
          }}
        >
          count is {count}
        </Button>
        <Button
          kind="primary"
          onClick={() => {
            setCount(count => count + 1);
          }}
        >
          count is {count}
        </Button>
      </div>
    </div>
  );
}

export default App;
