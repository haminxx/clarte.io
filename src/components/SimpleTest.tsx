// Simple test component to verify React is working
export function SimpleTest() {
  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: '#3b82f6',
      color: 'white',
      fontSize: '24px',
      fontFamily: 'system-ui, sans-serif'
    }}>
      <div style={{ textAlign: 'center' }}>
        <h1>✅ React is Working!</h1>
        <p style={{ fontSize: '16px', marginTop: '16px' }}>
          If you see this, React is rendering correctly.
        </p>
        <p style={{ fontSize: '14px', marginTop: '8px', opacity: 0.8 }}>
          Check console (F12) for any errors.
        </p>
      </div>
    </div>
  );
}
