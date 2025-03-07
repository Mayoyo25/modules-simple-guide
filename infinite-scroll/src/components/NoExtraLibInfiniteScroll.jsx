import { useState, useRef, useEffect, useCallback, useMemo } from 'react';

// Custom hook to replace useIntersectionObserver with proper polyfill handling
function useIntersectionObserver(elementRef, options = {}) {
  const [entry, setEntry] = useState(null);
  
  useEffect(() => {
    const element = elementRef.current;
    if (!element || typeof IntersectionObserver === 'undefined') {
      // Fallback for browsers without IntersectionObserver support
      const checkVisibility = () => {
        if (element) {
          const rect = element.getBoundingClientRect();
          const isVisible = rect.top < window.innerHeight + 500; // Similar to rootMargin
          setEntry({ isIntersecting: isVisible });
        }
      };
      
      window.addEventListener('scroll', checkVisibility);
      checkVisibility(); // Initial check
      
      return () => window.removeEventListener('scroll', checkVisibility);
    }
    
    const observer = new IntersectionObserver(([entry]) => {
      setEntry(entry);
    }, options);
    
    observer.observe(element);
    
    return () => {
      observer.disconnect();
    };
  }, [elementRef, options.threshold, options.root, options.rootMargin]);
  
  return entry;
}

// Simple cache with localStorage
const imageCache = {
  get: (key) => {
    try {
      const item = localStorage.getItem(key);
      if (!item) return null;
      
      const parsed = JSON.parse(item);
      const now = new Date().getTime();
      
      // Check if item is expired (24h cache)
      if (now > parsed.expiry) {
        localStorage.removeItem(key);
        return null;
      }
      
      return parsed.value;
    } catch (e) {
      console.error('Error getting from cache', e);
      return null;
    }
  },
  
  set: (key, value) => {
    try {
      const expiry = new Date().getTime() + 24 * 60 * 60 * 1000; // 24 hours
      localStorage.setItem(key, JSON.stringify({ value, expiry }));
    } catch (e) {
      console.error('Error setting cache', e);
    }
  }
};

export function NoExraLibInfiniteScroller() {
  const [images, setImages] = useState([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const loaderRef = useRef(null);
  const prevImagesLengthRef = useRef(0);
  
  // Fixed image height for consistency
  const imageHeight = 300;
  const imagesCap = 70;
  
  // Keep track of loaded images to prevent showing loaders again
  const [loadedImages, setLoadedImages] = useState({});
  
  // Fetch images with proper error handling and retries
  const fetchImages = useCallback(async () => {
    if (!hasMore || loading || images.length >= imagesCap) return;
    
    // Check cache first
    const cacheKey = `picsum-page-${page}`;
    const cachedData = imageCache.get(cacheKey);
    
    if (cachedData) {
      setImages(prevImages => {
        const newImages = [...prevImages, ...cachedData];
        if (newImages.length >= imagesCap) {
          setHasMore(false);
          return newImages.slice(0, imagesCap);
        }
        return newImages;
      });
      
      setPage(prevPage => prevPage + 1);
      return;
    }
    
    setLoading(true);
    
    try {
      const limit = 10;
      const response = await fetch(`https://picsum.photos/v2/list?page=${page}&limit=${limit}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch images');
      }
      
      const data = await response.json();
      
      if (data.length === 0) {
        setHasMore(false);
      } else {
        // Process images with consistent dimensions
        const processedImages = data.map(img => ({
          ...img,
          width: 1200,
          height: 800
        }));
        
        // Cache the results
        imageCache.set(cacheKey, processedImages);
        
        // Update state while preserving scroll position
        setImages(prevImages => {
          const newImages = [...prevImages, ...processedImages];
          prevImagesLengthRef.current = newImages.length;
          
          if (newImages.length >= imagesCap) {
            setHasMore(false);
            return newImages.slice(0, imagesCap);
          }
          return newImages;
        });
        
        setPage(prevPage => prevPage + 1);
      }
    } catch (err) {
      console.error("Error fetching images:", err);
      setError(err.message);
      
      // Implement a simple retry with delay
      setTimeout(() => {
        setError(null);
        setLoading(false);
      }, 3000);
    } finally {
      setLoading(false);
    }
  }, [hasMore, loading, images.length, page]);

  // Use our custom intersection observer
  const intersectionEntry = useIntersectionObserver(loaderRef, {
    threshold: 0.1,
    rootMargin: '500px 0px',
  });

  // Load initial batch of images
  useEffect(() => {
    fetchImages();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Trigger fetch when loader is visible
  useEffect(() => {
    if (intersectionEntry?.isIntersecting && !loading && hasMore) {
      fetchImages();
    }
  }, [intersectionEntry?.isIntersecting, loading, hasMore, fetchImages]);

  // Proper image lazy loading with our shared useIntersectionObserver hook
  function LazyImage({ src, alt, className, imageId }) {
    const imgRef = useRef(null);
    const [isLoaded, setIsLoaded] = useState(loadedImages[imageId] || false);
    
    // Use our custom hook instead of creating a new IntersectionObserver
    const entry = useIntersectionObserver(imgRef, { 
      rootMargin: '200px 0px',
      threshold: 0.1
    });
    
    const isInView = entry?.isIntersecting;
    
    // When image loads successfully, store this state to prevent reloading
    const handleImageLoad = () => {
      setIsLoaded(true);
      setLoadedImages(prev => ({
        ...prev,
        [imageId]: true
      }));
    };
    
    // Handle errors the same way - we don't want to show a loader again
    const handleImageError = (e) => {
      e.target.onerror = null;
      e.target.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100' viewBox='0 0 100 100'%3E%3Crect width='100' height='100' fill='%23f0f0f0'/%3E%3Cpath d='M30,50 L70,50 M50,30 L50,70' stroke='%23cccccc' stroke-width='4'/%3E%3C/svg%3E";
      handleImageLoad();
    };
    
    return (
      <div 
        ref={imgRef} 
        className="relative w-full h-64 bg-gray-100"
      >
        {/* If we already loaded this image before, show it immediately */}
        {loadedImages[imageId] && (
          <img
            src={src}
            alt={alt}
            className={`${className} opacity-100 transition-opacity duration-300`}
          />
        )}
        
        {/* If image is in view but not yet loaded from a previous scroll */}
        {isInView && !loadedImages[imageId] && (
          <>
            <img
              src={src}
              alt={alt}
              className={`${className} ${isLoaded ? 'opacity-100' : 'opacity-0'} transition-opacity duration-300`}
              onLoad={handleImageLoad}
              onError={handleImageError}
            />
            {!isLoaded && (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
              </div>
            )}
          </>
        )}
        
        {/* Placeholder when image is not yet in view and not loaded */}
        {!isInView && !loadedImages[imageId] && (
          <div className="w-full h-full bg-gray-200 animate-pulse"></div>
        )}
      </div>
    );
  }

  return (
    <>
      <nav className="sticky top-0 z-10 bg-gray-800 text-white p-4 shadow-md">
        <div className="container mx-auto">
          <h1 className="text-xl font-bold">Infinite Scroll Gallery</h1>
          <p className="text-sm text-gray-300">Loaded {images.length} of {imagesCap} images</p>
        </div>
      </nav>
      
      <div className="container mx-auto p-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {images.map((image, index) => (
            <div 
              key={`${image.id}-${index}`} 
              className="overflow-hidden rounded-lg shadow-md hover:shadow-xl transition-shadow duration-300"
              style={{ minHeight: `${imageHeight}px` }}
            >
              <a 
                href={image.url} 
                target="_blank" 
                rel="noopener noreferrer" 
                className="block relative h-full"
              >
                <LazyImage 
                  src={image.download_url} 
                  alt={`Photo by ${image.author}`}
                  className="w-full h-64 object-cover transition-transform duration-500 hover:scale-105"
                  imageId={image.id} // Use image ID as a unique identifier
                />
                <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-60 text-white p-2">
                  <p className="text-sm font-medium">Photo by {image.author}</p>
                </div>
              </a>
            </div>
          ))}
        </div>
        
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
          {error && (
            <div className="text-red-500 p-4 bg-red-50 rounded-lg my-4">
              <p>Error: {error}</p>
              <button 
                onClick={() => {
                  setError(null);
                  fetchImages();
                }}
                className="mt-2 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
              >
                Retry
              </button>
            </div>
          )}
          {!hasMore && !loading && (
            <p className="text-gray-500">
              You've reached the end. Loaded {images.length} images.
            </p>
          )}
        </div>
      </div>
    </>
  );
}