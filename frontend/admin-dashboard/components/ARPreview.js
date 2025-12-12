import { useState, useRef, useEffect } from 'react';

const ARPreview = ({ product, onClose }) => {
  const [isSupported, setIsSupported] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);

  useEffect(() => {
    // Check if WebRTC is supported
    if (!navigator.mediaDevices || !window.WebGLRenderingContext) {
      setIsSupported(false);
    }
    
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  const startARPreview = async () => {
    if (!isSupported) return;
    
    setIsLoading(true);
    
    try {
      // In a real implementation, this would initialize the AR session
      // For this demo, we'll simulate AR functionality
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'environment' } 
      });
      
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      
      // Simulate AR overlay after a delay
      setTimeout(() => {
        setIsLoading(false);
      }, 1500);
    } catch (err) {
      console.error('Error accessing camera:', err);
      setIsLoading(false);
    }
  };

  const stopARPreview = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
      <div className="relative w-full max-w-4xl bg-gray-900 rounded-lg overflow-hidden">
        <div className="absolute top-4 right-4 z-10">
          <button 
            onClick={() => {
              stopARPreview();
              onClose();
            }}
            className="p-2 bg-red-500 text-white rounded-full hover:bg-red-600 transition"
          >
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        {!isSupported ? (
          <div className="p-8 text-center text-white">
            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100">
              <svg className="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <h3 className="mt-4 text-lg font-medium text-white">AR Not Supported</h3>
            <div className="mt-2 text-sm text-gray-300">
              <p>Your device or browser doesn't support the required AR features.</p>
              <p className="mt-2">Requirements: Camera access and WebGL support.</p>
            </div>
          </div>
        ) : (
          <div className="relative">
            {isLoading ? (
              <div className="flex flex-col items-center justify-center h-96 text-white">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mb-4"></div>
                <p>Initializing AR Preview...</p>
                <p className="text-sm text-gray-300 mt-2">Make sure to allow camera access</p>
              </div>
            ) : (
              <>
                <video 
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className="w-full h-auto max-h-screen"
                />
                
                {/* AR Overlay - In a real implementation, this would be rendered with WebGL */}
                <div className="absolute inset-0 pointer-events-none">
                  <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                    <div className="bg-blue-500 bg-opacity-20 border-2 border-blue-400 rounded-lg p-4 backdrop-blur-sm">
                      <h3 className="text-white font-bold text-lg">{product.name}</h3>
                      <p className="text-white">${product.price.toFixed(2)}</p>
                      <div className="mt-2 bg-gray-800 bg-opacity-70 p-2 rounded">
                        <p className="text-xs text-gray-200">AR Preview Mode</p>
                        <p className="text-xs text-gray-300">Place the product in your environment</p>
                      </div>
                    </div>
                  </div>
                  
                  {/* Tracking points visualization */}
                  <div className="absolute top-10 left-10 w-4 h-4 bg-green-500 rounded-full animate-pulse"></div>
                  <div className="absolute top-20 right-20 w-4 h-4 bg-yellow-500 rounded-full animate-pulse"></div>
                  <div className="absolute bottom-32 left-1/4 w-4 h-4 bg-purple-500 rounded-full animate-pulse"></div>
                </div>
              </>
            )}
            
            <div className="absolute bottom-4 left-0 right-0 flex justify-center">
              <button
                onClick={startARPreview}
                disabled={isLoading}
                className={`px-6 py-3 rounded-full font-medium text-white ${
                  isLoading 
                    ? 'bg-gray-500 cursor-not-allowed' 
                    : 'bg-blue-600 hover:bg-blue-700'
                }`}
              >
                {isLoading ? 'Starting AR...' : 'Start AR Preview'}
              </button>
            </div>
          </div>
        )}
        
        <div className="p-4 bg-gray-800 text-white text-sm">
          <div className="flex items-center">
            <svg className="h-5 w-5 text-blue-400 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>Position your camera to view the product in your environment</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ARPreview;