import { useState, useRef, useEffect } from 'react';
import { useIntersectionObserver } from '@react-hookz/web';
import {Navbar} from "../../../../Navbar"

export function InfiniteScrollerPicsum() {
  const [images, setImages] = useState([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const loaderRef = useRef(null);
  
  // Use a much lower threshold to start loading earlier.
  // This will trigger loading when the loader is still far from view
  const threshold = 0.05;
  // Cap to prevent excessive API usage
  const imagesCap = 70;
  
  // Function to fetch images from Picsum Photos
  const fetchImages = async () => {
    if (!hasMore || loading|| images.length >= imagesCap) return;
    
    setLoading(true);
    try {
      // Use Picsum Photos API with a consistent limit
      const limit = 10; // Keep this fixed at 10
      const response = await fetch(`https://picsum.photos/v2/list?page=${page}&limit=${limit}`);
      
      if (!response.ok) throw new Error('Failed to fetch images');
      
      const data = await response.json();
      
      // Check if we've reached the API's limit
      if (data.length === 0) {
        setHasMore(false);
      } else {
        // Transform the data to include width and height for better rendering
        const processedImages = data.map(img => ({
          ...img,
          // Set consistent image dimensions for better layout
          width: 1200,
          height: 800
        }));
        
        setImages(prevImages => {
      const newImages = [...prevImages, ...processedImages];
      if (newImages.length >= imagesCap) {
        setHasMore(false); // Manually stop fetching at the cap
        return newImages.slice(0, imagesCap);
      }
      return newImages;
    });

        setPage(prevPage => prevPage + 1);
      }
    } catch (err) {
      setError(err);
      console.error("Error fetching images:", err);
    } finally {
      setLoading(false);
    }
  };

  // Use the useIntersectionObserver hook with a much lower threshold
  const intersectionEntry = useIntersectionObserver(loaderRef, {
    threshold: [threshold],
    // Add rootMargin to start loading even before the loader is visible
    rootMargin: '500px 0px',
  });

  // Load initial images when component mounts (ONLY ONCE)
  useEffect(() => {
    const loadInitial = async () => {
      await fetchImages();
    };
    
    loadInitial();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Trigger fetch when the loader becomes visible
  useEffect(() => {
    if (intersectionEntry?.isIntersecting && !loading && hasMore) {
      fetchImages();
    }
  }, [intersectionEntry?.isIntersecting, loading, hasMore]);

  return (
    <>
    <Navbar  title="React Hookz Infinite Scroll" sourcePath="react-hookz-web/jsx" />
    <div className="container mx-auto p-4">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {images.map((image, index) => (
          <div key={`${image.id}-${index}`} className="overflow-hidden rounded-lg shadow-md hover:shadow-xl transition-shadow duration-300">
            <a href={image.url} target="_blank" rel="noopener noreferrer" className="block relative">
              <img 
                src={image.download_url} 
                alt={`Photo by ${image.author}`}
                className="w-full h-64 object-cover transition-transform duration-500 hover:scale-105"
                loading="lazy" // Native lazy loading
              />
              <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-60 text-white p-2">
                <p className="text-sm font-medium">Photo by {image.author}</p>
              </div>
            </a>
          </div>
        ))}
      </div>
      
      {/* Position this earlier in the viewport */}
      <div 
        ref={loaderRef}
        className="py-8 text-center mt-4"
      >
        {loading && (
          <div className="flex justify-center items-center space-x-2">
            <div className="w-3 h-3 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
            <div className="w-3 h-3 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
            <div className="w-3 h-3 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
          </div>
        )}
        {error && <p className="text-red-500">Error: {error.message}</p>}
        {!hasMore && (
          <p className="text-gray-500">
            Manually stopped fetching at {imagesCap} images to prevent excessive API usage. 
            Thanks for browsing responsibly!
          </p>
        )}
      </div>
    </div></>
  );
}