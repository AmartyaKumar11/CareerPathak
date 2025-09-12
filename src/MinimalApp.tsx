import { useState } from 'react';

export const MinimalApp = () => {
  const [message, setMessage] = useState('React hooks are working!');
  
  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <h1>Minimal React Test</h1>
      <p>{message}</p>
      <button onClick={() => setMessage('Button clicked at ' + new Date().toLocaleTimeString())}>
        Test useState
      </button>
    </div>
  );
};
