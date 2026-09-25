import { useState, useEffect } from 'react';
import './App.css';

function App() {
  const [backendStatus, setBackendStatus] = useState('Checking...');

  useEffect(() => {
    fetch('http://localhost:5000/api/health')
      .then((res) => {
        if (!res.ok) throw new Error('Network response was not ok');
        return res.json();
      })
      .then((data) => setBackendStatus(data.message || 'Connected'))
      .catch(() => setBackendStatus('Offline (Run backend on port 5000)'));
  }, []);

  return (
    <div className="container">
      <header className="header">
        <h1>CodeAlpha E-Commerce Store</h1>
        <p className="subtitle">Minimal Setup</p>
      </header>

      <main className="card">
        <h2>System Status</h2>
        <div className="status-row">
          <span className="label">Frontend:</span>
          <span className="status ready">Ready (React.js)</span>
        </div>
        <div className="status-row">
          <span className="label">Backend:</span>
          <span className={`status ${backendStatus === 'Backend is running' ? 'ready' : 'pending'}`}>
            {backendStatus}
          </span>
        </div>
        <p className="info">
          Backend health endpoint: <code>GET /api/health</code>
        </p>
      </main>
    </div>
  );
}

export default App;
