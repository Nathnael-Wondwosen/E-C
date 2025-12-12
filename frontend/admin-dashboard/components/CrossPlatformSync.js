import { useState, useEffect } from 'react';

const CrossPlatformSync = ({ products, categories, onSyncComplete }) => {
  const [syncStatus, setSyncStatus] = useState('idle'); // idle, syncing, synced, error
  const [syncProgress, setSyncProgress] = useState(0);
  const [lastSync, setLastSync] = useState(null);
  const [offlineChanges, setOfflineChanges] = useState([]);
  const [conflicts, setConflicts] = useState([]);

  // Simulate offline mode
  const [isOffline, setIsOffline] = useState(false);

  // Check for offline changes periodically
  useEffect(() => {
    const interval = setInterval(() => {
      // In a real implementation, this would check IndexedDB or localStorage for pending changes
      // For demo, we'll simulate with a mock function
      checkForOfflineChanges();
    }, 10000); // Check every 10 seconds

    return () => clearInterval(interval);
  }, []);

  // Check for offline changes
  const checkForOfflineChanges = () => {
    // Mock implementation - in reality this would check local storage
    const mockChanges = [
      { id: 'change_1', type: 'product_update', productId: 123, timestamp: Date.now() - 3600000 },
      { id: 'change_2', type: 'category_add', categoryId: 456, timestamp: Date.now() - 1800000 }
    ];
    
    setOfflineChanges(mockChanges);
  };

  // Sync with cloud
  const syncWithCloud = async () => {
    if (syncStatus === 'syncing') return;
    
    setSyncStatus('syncing');
    setSyncProgress(0);
    
    try {
      // Simulate sync process
      const steps = [
        'Connecting to cloud...',
        'Authenticating...',
        'Checking for remote changes...',
        'Uploading local changes...',
        'Resolving conflicts...',
        'Finalizing sync...'
      ];
      
      for (let i = 0; i < steps.length; i++) {
        await new Promise(resolve => setTimeout(resolve, 800)); // Simulate work
        setSyncProgress(((i + 1) / steps.length) * 100);
      }
      
      // Simulate conflict detection
      const mockConflicts = [
        {
          id: 'conflict_1',
          type: 'product_price_conflict',
          productId: 123,
          localValue: 29.99,
          remoteValue: 34.99,
          timestamp: Date.now()
        }
      ];
      
      if (mockConflicts.length > 0) {
        setConflicts(mockConflicts);
        setSyncStatus('conflict');
      } else {
        setSyncStatus('synced');
        setLastSync(new Date());
        setOfflineChanges([]);
        if (onSyncComplete) onSyncComplete();
      }
    } catch (error) {
      console.error('Sync error:', error);
      setSyncStatus('error');
    }
  };

  // Resolve conflict
  const resolveConflict = (conflictId, resolution) => {
    // In a real implementation, this would resolve the conflict and continue sync
    setConflicts(prev => prev.filter(c => c.id !== conflictId));
    
    // If no more conflicts, complete sync
    if (conflicts.length <= 1) {
      setSyncStatus('synced');
      setLastSync(new Date());
      setOfflineChanges([]);
      if (onSyncComplete) onSyncComplete();
    }
  };

  // Toggle offline mode
  const toggleOfflineMode = () => {
    setIsOffline(!isOffline);
  };

  return (
    <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
        <div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">
            Cross-Platform Synchronization
          </h3>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Sync your data across devices and enable offline editing
          </p>
        </div>
        
        <div className="mt-4 sm:mt-0 flex space-x-3">
          <button
            onClick={toggleOfflineMode}
            className={`inline-flex items-center px-3 py-2 border text-sm font-medium rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 ${
              isOffline
                ? 'border-yellow-300 text-yellow-800 bg-yellow-50 hover:bg-yellow-100 focus:ring-yellow-500 dark:border-yellow-600 dark:text-yellow-200 dark:bg-yellow-900/20 dark:hover:bg-yellow-900/30'
                : 'border-gray-300 text-gray-700 bg-white hover:bg-gray-50 focus:ring-blue-500 dark:border-gray-600 dark:text-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600'
            }`}
          >
            <svg className={`-ml-1 mr-2 h-4 w-4 ${isOffline ? 'text-yellow-500' : 'text-gray-500'}`} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            {isOffline ? 'Offline Mode' : 'Online Mode'}
          </button>
          
          <button
            onClick={syncWithCloud}
            disabled={syncStatus === 'syncing'}
            className={`inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white focus:outline-none focus:ring-2 focus:ring-offset-2 ${
              syncStatus === 'syncing'
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-blue-600 hover:bg-blue-700 focus:ring-blue-500'
            }`}
          >
            {syncStatus === 'syncing' ? (
              <>
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Syncing...
              </>
            ) : (
              'Sync Now'
            )}
          </button>
        </div>
      </div>
      
      {/* Sync Status */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Sync Status
          </span>
          {lastSync && (
            <span className="text-xs text-gray-500 dark:text-gray-400">
              Last sync: {lastSync.toLocaleTimeString()}
            </span>
          )}
        </div>
        
        <div className="w-full bg-gray-200 rounded-full h-2 dark:bg-gray-700">
          <div 
            className={`h-2 rounded-full ${
              syncStatus === 'synced' ? 'bg-green-600' : 
              syncStatus === 'syncing' ? 'bg-blue-600' : 
              syncStatus === 'error' ? 'bg-red-600' : 
              syncStatus === 'conflict' ? 'bg-yellow-600' : 
              'bg-gray-400'
            }`} 
            style={{ width: `${syncProgress}%` }}
          ></div>
        </div>
        
        <div className="mt-2 flex items-center">
          {syncStatus === 'synced' && (
            <span className="inline-flex items-center text-sm text-green-600 dark:text-green-400">
              <svg className="mr-1.5 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              Data synchronized
            </span>
          )}
          
          {syncStatus === 'syncing' && (
            <span className="inline-flex items-center text-sm text-blue-600 dark:text-blue-400">
              <svg className="mr-1.5 h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Synchronizing...
            </span>
          )}
          
          {syncStatus === 'error' && (
            <span className="inline-flex items-center text-sm text-red-600 dark:text-red-400">
              <svg className="mr-1.5 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Sync failed
            </span>
          )}
          
          {syncStatus === 'conflict' && (
            <span className="inline-flex items-center text-sm text-yellow-600 dark:text-yellow-400">
              <svg className="mr-1.5 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              Conflicts detected
            </span>
          )}
          
          {syncStatus === 'idle' && (
            <span className="text-sm text-gray-500 dark:text-gray-400">
              Ready to sync
            </span>
          )}
        </div>
      </div>
      
      {/* Offline Changes */}
      {offlineChanges.length > 0 && (
        <div className="mb-6">
          <h4 className="text-md font-medium text-gray-900 dark:text-white mb-3">
            Pending Offline Changes
          </h4>
          <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
            <ul className="space-y-2">
              {offlineChanges.map((change) => (
                <li key={change.id} className="flex items-center text-sm text-yellow-800 dark:text-yellow-200">
                  <svg className="mr-2 h-4 w-4 text-yellow-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                  <span>
                    {change.type === 'product_update' ? 'Product update' : 'Category addition'} - {Math.floor((Date.now() - change.timestamp) / 60000)} minutes ago
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
      
      {/* Conflicts Resolution */}
      {conflicts.length > 0 && (
        <div className="mb-6">
          <h4 className="text-md font-medium text-gray-900 dark:text-white mb-3">
            Conflict Resolution Required
          </h4>
          <div className="space-y-4">
            {conflicts.map((conflict) => (
              <div key={conflict.id} className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
                <div className="flex items-start">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                  </div>
                  <div className="ml-3 flex-1">
                    <h5 className="text-sm font-medium text-red-800 dark:text-red-200">
                      Price conflict detected
                    </h5>
                    <p className="mt-1 text-sm text-red-700 dark:text-red-300">
                      Product ID: {conflict.productId} has different prices in local and remote versions.
                    </p>
                    <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
                      <div className="border border-gray-200 dark:border-gray-700 rounded p-3">
                        <div className="text-xs text-gray-500 dark:text-gray-400">Local Version</div>
                        <div className="mt-1 text-lg font-bold text-gray-900 dark:text-white">${conflict.localValue}</div>
                        <button
                          onClick={() => resolveConflict(conflict.id, 'local')}
                          className="mt-2 inline-flex items-center px-3 py-1 border border-transparent text-xs font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                        >
                          Use Local
                        </button>
                      </div>
                      <div className="border border-gray-200 dark:border-gray-700 rounded p-3">
                        <div className="text-xs text-gray-500 dark:text-gray-400">Remote Version</div>
                        <div className="mt-1 text-lg font-bold text-gray-900 dark:text-white">${conflict.remoteValue}</div>
                        <button
                          onClick={() => resolveConflict(conflict.id, 'remote')}
                          className="mt-2 inline-flex items-center px-3 py-1 border border-transparent text-xs font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                        >
                          Use Remote
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
      
      {/* Sync Statistics */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
          <div className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Products</div>
          <div className="mt-1 text-2xl font-semibold text-gray-900 dark:text-white">{products.length}</div>
        </div>
        <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
          <div className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Categories</div>
          <div className="mt-1 text-2xl font-semibold text-gray-900 dark:text-white">{categories.length}</div>
        </div>
        <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
          <div className="text-sm font-medium text-gray-500 dark:text-gray-400">Offline Changes</div>
          <div className="mt-1 text-2xl font-semibold text-gray-900 dark:text-white">{offlineChanges.length}</div>
        </div>
      </div>
      
      <div className="mt-6 bg-blue-50 dark:bg-blue-900 rounded-lg p-4">
        <div className="flex">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-blue-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-blue-800 dark:text-blue-200">
              Offline Capability
            </h3>
            <div className="mt-2 text-sm text-blue-700 dark:text-blue-300">
              <p>
                {isOffline 
                  ? 'You are currently in offline mode. Changes will be synced when you reconnect.' 
                  : 'Enable offline mode to continue working without an internet connection. Your changes will sync automatically when you reconnect.'}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CrossPlatformSync;