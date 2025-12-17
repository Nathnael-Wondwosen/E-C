// Using built-in fetch API (Node.js 18+)

async function testUpdateNavbarLink() {
  try {
    console.log('Testing navbar link update...');
    
    const response = await fetch('http://localhost:3000/api/navbar-links/2', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        title: 'Updated Products',
        url: '/products-new',
        type: 'internal',
        enabled: true,
        order: 2
      }),
    });
    
    console.log('Response status:', response.status);
    
    if (response.ok) {
      const updatedLink = await response.json();
      console.log('Update successful:', JSON.stringify(updatedLink, null, 2));
    } else {
      const errorText = await response.text();
      console.log('Update failed:', errorText);
    }
  } catch (error) {
    console.error('Error testing navbar link update:', error);
  }
}

testUpdateNavbarLink();