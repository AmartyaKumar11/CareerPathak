function App() {
  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: 'red',
      color: 'white',
      fontSize: '48px',
      padding: '40px',
      textAlign: 'center'
    }}>
      <h1>🔴 RED TEST APP 🔴</h1>
      <p>If you see this, you're using our App.tsx</p>
      <p>Current time: {new Date().toLocaleTimeString()}</p>
      <p>This should appear instead of any careers page</p>
    </div>
  );
}

export default App;
