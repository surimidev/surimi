import Counter from './components/Counter';

import './App.css';

function App() {
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

export default App;
