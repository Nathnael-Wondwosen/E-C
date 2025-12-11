import Head from 'next/head';

export default function CssTest() {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <Head>
        <title>CSS Test</title>
      </Head>
      
      <div>
        <h1 className="test-bg">If this has blue background, CSS is working</h1>
        <p style={{ marginTop: '1rem', padding: '1rem', backgroundColor: '#ef4444', color: 'white', borderRadius: '0.5rem' }}>
          This should have a red background (inline styles)
        </p>
      </div>
    </div>
  );
}