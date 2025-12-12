import { useState, useMemo } from 'react';

const IconPicker = ({ selectedIcon, onIconSelect, onClose }) => {
  const [searchTerm, setSearchTerm] = useState('');

  // Comprehensive list of emojis organized by categories
  const emojiCategories = {
    'Electronics': ['🔌', '📱', '💻', '🖥️', '🖨️', '🖱️', '⌨️', '🎧', '📺', '📸', '🎮', '⌚', '🔋'],
    'Home & Furniture': ['🏠', '🛋️', '🛏️', '🚪', '🪑', '🛋️', '🛏️', '🚽', '🛁', '🚿', '🧴', '🧼'],
    'Fashion': ['👕', '👖', '👗', '👠', '👟', '🧦', '🧤', '👜', '🕶️', '👒', '🎩', '👑'],
    'Food & Drink': ['🍎', '🍕', '🍔', '🍟', '🍣', '🍦', '🍩', '🎂', '☕', '🍷', '🍺', '🥤'],
    'Sports & Fitness': ['⚽', '🏀', '🏈', '⚾', '🎾', '🏐', '🏉', '🥏', '🎱', '🏓', '🏸', '🥊'],
    'Transportation': ['🚗', '🚕', '🚙', '🚌', '🚎', '🏎️', '🚓', '🚑', '🚒', '✈️', '🚀', '🚲'],
    'Nature': ['🌲', '🌳', '🌴', '🌱', '🌿', '☘️', '🍀', '🎍', '🌵', '🌾', '💐', '🌷'],
    'Animals': ['🐶', '🐱', '🐭', '🐹', '🐰', '🦊', '🐻', '🐼', '🐨', '🐯', '🦁', '🐮'],
    'Business': ['💼', '💰', '💳', '💎', '⚖️', '🔧', '🔨', '💡', '📎', '📏', '📌', '📊'],
    'Healthcare': ['❤️', '💊', '🌡️', '🩹', '🩺', '💉', '🦷', '🧠', '🦴', '👀', '👂', '👃'],
    'Education': ['📚', '📖', '🎓', '✏️', '📝', '📁', '📅', '📈', '📉', '📊', '📋', '📌'],
    'Activities': ['🎨', '🎭', '🎬', '🎤', '🎧', '🎼', '🎹', '🥁', '🎷', '🎺', '🎸', '🎮']
  };

  // Flatten all emojis into a single array for searching
  const allEmojis = useMemo(() => {
    return Object.values(emojiCategories).flat();
  }, []);

  // Filter emojis based on search term
  const filteredEmojis = useMemo(() => {
    if (!searchTerm) return allEmojis;
    return allEmojis.filter(emoji => 
      emoji.includes(searchTerm) || 
      Object.keys(emojiCategories).some(category => 
        category.toLowerCase().includes(searchTerm.toLowerCase())
      )
    );
  }, [searchTerm, allEmojis]);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        <div className="border-b border-gray-200 dark:border-gray-700 p-4 flex justify-between items-center">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Select an Icon
          </h3>
          <button 
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
              </svg>
            </div>
            <input
              type="text"
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              placeholder="Search icons..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          {selectedIcon && (
            <div className="mt-3 flex items-center">
              <span className="text-sm text-gray-600 dark:text-gray-300 mr-2">Selected:</span>
              <span className="text-2xl">{selectedIcon}</span>
            </div>
          )}
        </div>
        
        <div className="overflow-y-auto flex-grow p-4">
          {searchTerm ? (
            // Show filtered results
            <div>
              <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-2">
                Search Results ({filteredEmojis.length})
              </h4>
              <div className="grid grid-cols-8 sm:grid-cols-10 md:grid-cols-12 gap-2">
                {filteredEmojis.map((emoji, index) => (
                  <button
                    key={index}
                    className={`flex items-center justify-center p-2 rounded-lg text-2xl hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors ${
                      selectedIcon === emoji 
                        ? 'bg-blue-100 dark:bg-blue-900 ring-2 ring-blue-500' 
                        : ''
                    }`}
                    onClick={() => onIconSelect(emoji)}
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            // Show categorized emojis
            <div className="space-y-6">
              {Object.entries(emojiCategories).map(([category, emojis]) => (
                <div key={category}>
                  <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-2">
                    {category}
                  </h4>
                  <div className="grid grid-cols-8 sm:grid-cols-10 md:grid-cols-12 gap-2">
                    {emojis.map((emoji, index) => (
                      <button
                        key={index}
                        className={`flex items-center justify-center p-2 rounded-lg text-2xl hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors ${
                          selectedIcon === emoji 
                            ? 'bg-blue-100 dark:bg-blue-900 ring-2 ring-blue-500' 
                            : ''
                        }`}
                        onClick={() => onIconSelect(emoji)}
                      >
                        {emoji}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
        
        <div className="border-t border-gray-200 dark:border-gray-700 p-4 flex justify-end">
          <button
            type="button"
            className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md shadow-sm text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white dark:border-gray-600 dark:hover:bg-gray-600"
            onClick={onClose}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default IconPicker;