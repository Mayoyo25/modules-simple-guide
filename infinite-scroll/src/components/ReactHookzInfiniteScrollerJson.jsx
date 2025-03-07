import { useState, useRef, useEffect } from 'react';
import { useIntersectionObserver } from '@react-hookz/web'; 

export function InfiniteScrollerJson() {
  const [items, setItems] = useState([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const loaderRef = useRef(null);

  // Create a proper fetchData function
  const fetchData = async () => {
    if (!hasMore || loading) return;
    
    setLoading(true);
    try {
      // Fetch posts from JSONPlaceholder API
      const response = await fetch(
        `https://jsonplaceholder.typicode.com/posts?_limit=10&_page=${page}`
      );
      
      if (!response.ok) throw new Error('Failed to fetch data');
      
      const data = await response.json();
      
      // Update state based on response
      setItems(prevItems => [...prevItems, ...data]);
      setHasMore(data.length > 0); // Stop fetching if no more data is returned
      setPage(prevPage => prevPage + 1);
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  // Use the useIntersectionObserver hook to detect when the loader is visible
  const intersectionEntry = useIntersectionObserver(loaderRef, {
    threshold: [0.5], // Pass threshold as an array
  });

  // Trigger fetch when the loader is intersecting and not already loading
  useEffect(() => {
    if (intersectionEntry?.isIntersecting && !loading && hasMore) {
      fetchData();
    }
  }, [intersectionEntry, loading, hasMore]);

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Infinite Scroll Demo</h1>
      
      <div className="space-y-4">
        {items.map(item => (
          <div key={item.id} className="p-4 border rounded shadow">
            <h2 className="text-lg font-semibold">{item.title}</h2>
            <p>{item.body}</p>
          </div>
        ))}
      </div>
      
      {/* Loader element that triggers next page load */}
      <div 
        ref={loaderRef}
        className="py-4 text-center"
      >
        {loading && <p>Loading more items...</p>}
        {error && <p className="text-red-500">Error: {error.message}</p>}
        {!hasMore && items.length > 0 && <p>No more items to load</p>}
      </div>
    </div>
  );
}