// Using built-in fetch API (Node.js 18+)

async function createSpecialOffer() {
  try {
    const response = await fetch('http://localhost:3000/api/special-offers', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        title: "Holiday Sale",
        subtitle: "Up to 50% off",
        description: "Limited time holiday sale on selected items",
        imageUrl: "/images/holiday-sale.jpg",
        discount: "50%",
        cta: "Shop Now",
        bgColor: "from-red-500 to-green-600",
        expiryDate: "2025-12-31",
        isActive: true
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`HTTP error! status: ${response.status}, message: ${errorText}`);
      return;
    }

    const offer = await response.json();
    console.log('Special offer created successfully:', offer);
  } catch (error) {
    console.error('Error creating special offer:', error);
  }
}

createSpecialOffer();