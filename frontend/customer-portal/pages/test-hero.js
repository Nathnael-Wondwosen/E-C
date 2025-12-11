import { useState, useEffect } from 'react';
import { getCachedHeroSlides } from '../utils/heroDataService';

export default function TestHero() {
  const [slides, setSlides] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadSlides = async () => {
      try {
        const data = await getCachedHeroSlides();
        setSlides(data);
        setLoading(false);
      } catch (error) {
        console.error('Error loading slides:', error);
        setLoading(false);
      }
    };

    loadSlides();
  }, []);

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <h1>Hero Slides Test</h1>
      <pre>{JSON.stringify(slides, null, 2)}</pre>
    </div>
  );
}