// Test script to check hero slides data
fetch('http://localhost:3000/api/hero-slides/all')
  .then(response => response.json())
  .then(data => {
    console.log('Hero slides data:');
    console.log(JSON.stringify(data, null, 2));
    
    // Check each slide's image URL
    data.forEach((slide, index) => {
      console.log(`\nSlide ${index + 1}:`);
      console.log(`  ID: ${slide._id || slide.id}`);
      console.log(`  Title: ${slide.title}`);
      console.log(`  Image URL: ${slide.imageUrl}`);
      
      // Test image URL processing
      if (slide.imageUrl) {
        // Simple test - just check if it's a valid URL format
        try {
          new URL(slide.imageUrl);
          console.log(`  Image URL is valid`);
        } catch (e) {
          console.log(`  Image URL is not a valid URL: ${slide.imageUrl}`);
        }
      } else {
        console.log(`  No image URL provided`);
      }
    });
  })
  .catch(error => {
    console.error('Error fetching hero slides:', error);
  });