const SimpleApp = () => {
  console.log('✅ SimpleApp is rendering');
  return (
    <div style={{ 
      padding: '20px', 
      backgroundColor: 'lightblue', 
      minHeight: '100vh',
      fontSize: '24px' 
    }}>
      <h1>✅ React is Working!</h1>
      <p>This is a minimal test component.</p>
      <p>If you can see this, React is rendering correctly.</p>
    </div>
  );
};

export default SimpleApp;
