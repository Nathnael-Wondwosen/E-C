import { useState, useEffect } from 'react';

export default function FilterSidebar({ filters = {}, categories = [], onFilterChange, onClearFilters }) {
  const [priceRange, setPriceRange] = useState([filters.minPrice || 0, filters.maxPrice || 1000]);
  const [tempSearch, setTempSearch] = useState(filters.search);

  // Update local state when filters change
  useEffect(() => {
    setPriceRange([filters.minPrice || 0, filters.maxPrice || 1000]);
    setTempSearch(filters.search || '');
  }, [filters]);

  const handlePriceChange = (index, value) => {
    const newRange = [...priceRange];
    newRange[index] = Number(value);
    setPriceRange(newRange);
  };

  const applyPriceFilter = () => {
    onFilterChange('minPrice', priceRange[0]);
    onFilterChange('maxPrice', priceRange[1]);
  };

  const handleSearchChange = (e) => {
    setTempSearch(e.target.value);
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    onFilterChange('search', tempSearch);
  };

  const toggleCategory = (category) => {
    const currentCategories = Array.isArray(filters.categories) ? filters.categories : [];
    let newCategories;
    
    if (currentCategories.includes(category)) {
      newCategories = currentCategories.filter(c => c !== category);
    } else {
      newCategories = [...currentCategories, category];
    }
    
    onFilterChange('categories', newCategories);
  };

  const selectAllCategories = () => {
    // Extract category names from category objects
    const allCategoryNames = categories.map(cat => cat.name);
    onFilterChange('categories', allCategoryNames);
  };

  const clearCategories = () => {
    onFilterChange('categories', []);
  };

  return (
    <div className="bg-white shadow-lg border-0" style={{
      boxSizing: 'border-box',
      margin: 0,
      padding: 0,
      borderRadius: '0',
      border: '0',
      boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
      position: 'sticky',
      top: '1.5rem',
      fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
    }}>
      <div className="flex justify-between items-center p-4 border-b border-gray-100" style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '1rem',
        borderBottom: '1px solid #f3f4f6',
        boxSizing: 'border-box'
      }}>
        <h2 className="text-lg font-bold text-gray-900 tracking-tight" style={{
          fontSize: '1.125rem',
          fontWeight: '700',
          color: '#111827',
          letterSpacing: '-0.025em',
          margin: 0
        }}>Filters</h2>
        <button 
          onClick={onClearFilters}
          className="text-sm text-blue-600 hover:text-blue-800 font-medium"
          style={{
            fontSize: '0.875rem',
            color: '#2563eb',
            cursor: 'pointer',
            fontWeight: '500',
            margin: 0,
            padding: 0,
            border: 'none',
            background: 'none'
          }}
        >
          Clear All
        </button>
      </div>

      {/* Search Filter */}
      <div className="p-4 border-b border-gray-100" style={{
        padding: '1rem',
        borderBottom: '1px solid #f3f4f6',
        boxSizing: 'border-box'
      }}>
        <form onSubmit={handleSearchSubmit}>
          <div className="relative" style={{
            position: 'relative',
            boxSizing: 'border-box'
          }}>
            <input
              type="text"
              value={tempSearch}
              onChange={handleSearchChange}
              placeholder="Search products..."
              className="w-full px-3 py-2 border-0 bg-gray-50 text-gray-900 placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
              style={{
                width: '100%',
                padding: '0.5rem 0.75rem',
                border: '0',
                backgroundColor: '#f9fafb',
                color: '#111827',
                borderRadius: '0',
                boxSizing: 'border-box',
                fontSize: '0.875rem',
                fontWeight: '400',
                transition: 'all 0.2s ease',
                fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
              }}
            />
            <button 
              type="submit"
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              style={{
                position: 'absolute',
                right: '0.75rem',
                top: '50%',
                transform: 'translateY(-50%)',
                color: '#9ca3af',
                cursor: 'pointer',
                background: 'none',
                border: 'none',
                padding: 0
              }}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
              </svg>
            </button>
          </div>
        </form>
      </div>

      {/* Category Filter */}
      <div className="p-4 border-b border-gray-100" style={{
        padding: '1rem',
        borderBottom: '1px solid #f3f4f6',
        boxSizing: 'border-box'
      }}>
        <div className="flex justify-between items-center mb-3" style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '0.75rem',
          boxSizing: 'border-box'
        }}>
          <h3 className="font-semibold text-gray-900 tracking-tight" style={{
            fontWeight: '600',
            color: '#111827',
            letterSpacing: '-0.025em',
            margin: 0
          }}>Categories</h3>
          <div className="flex space-x-3" style={{
            display: 'flex',
            gap: '0.75rem'
          }}>
            <button 
              onClick={selectAllCategories}
              className="text-xs text-blue-600 hover:text-blue-800 font-medium"
              style={{
                fontSize: '0.75rem',
                color: '#2563eb',
                cursor: 'pointer',
                fontWeight: '500',
                margin: 0,
                padding: 0,
                border: 'none',
                background: 'none'
              }}
            >
              Select All
            </button>
            <button 
              onClick={clearCategories}
              className="text-xs text-gray-500 hover:text-gray-700 font-medium"
              style={{
                fontSize: '0.75rem',
                color: '#6b7280',
                cursor: 'pointer',
                fontWeight: '500',
                margin: 0,
                padding: 0,
                border: 'none',
                background: 'none'
              }}
            >
              Clear
            </button>
          </div>
        </div>
        
        <div className="space-y-3 max-h-60 overflow-y-auto pr-2" style={{
          maxHeight: '15rem',
          overflowY: 'auto',
          paddingRight: '0.5rem',
          boxSizing: 'border-box'
        }}>
          {categories && Array.isArray(categories) && categories.map((category, index) => (
            <div key={category.id || index} className="flex items-center" style={{
              display: 'flex',
              alignItems: 'center',
              boxSizing: 'border-box'
            }}>
              <input
                type="checkbox"
                id={`category-${category.id || index}`}
                checked={Array.isArray(filters.categories) && filters.categories.includes(category.name)}
                onChange={() => toggleCategory(category.name)}
                className="h-3.5 w-3.5 text-blue-600 border-gray-300 rounded-none focus:ring-blue-500"
                style={{
                  height: '0.875rem',
                  width: '0.875rem',
                  color: '#2563eb',
                  border: '1px solid #d1d5db',
                  borderRadius: '0',
                  boxSizing: 'border-box',
                  accentColor: '#2563eb'
                }}
              />
              <label 
                htmlFor={`category-${category.id || index}`} 
                className="ml-2.5 text-gray-700 text-xs font-medium"
                style={{
                  marginLeft: '0.625rem',
                  color: '#374151',
                  cursor: 'pointer',
                  boxSizing: 'border-box',
                  fontSize: '0.75rem',
                  fontWeight: '500'
                }}
              >
                {category.name}
              </label>
            </div>
          ))}
        </div>
      </div>

      {/* Price Range Filter */}
      <div className="p-4 border-b border-gray-100" style={{
        padding: '1rem',
        borderBottom: '1px solid #f3f4f6',
        boxSizing: 'border-box'
      }}>
        <h3 className="font-semibold text-gray-900 mb-3 tracking-tight" style={{
          fontWeight: '600',
          color: '#111827',
          marginBottom: '0.75rem',
          letterSpacing: '-0.025em',
          margin: 0
        }}>Price Range</h3>
        
        <div className="space-y-5" style={{
          boxSizing: 'border-box'
        }}>
          <div className="flex items-center space-x-4" style={{
            display: 'flex',
            alignItems: 'center',
            gap: '1rem',
            boxSizing: 'border-box'
          }}>
            <div className="flex-1" style={{
              flex: '1',
              boxSizing: 'border-box'
            }}>
              <label className="block text-xs text-gray-500 mb-2 uppercase tracking-wide" style={{
                display: 'block',
                fontSize: '0.75rem',
                color: '#6b7280',
                marginBottom: '0.5rem',
                textTransform: 'uppercase',
                letterSpacing: '0.025em'
              }}>Min ($)</label>
              <input
                type="number"
                value={priceRange[0]}
                onChange={(e) => handlePriceChange(0, e.target.value)}
                className="w-full px-2 py-1.5 border-0 bg-gray-50 text-gray-900 focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
                style={{
                  width: '100%',
                  padding: '0.375rem 0.5rem',
                  border: '0',
                  backgroundColor: '#f9fafb',
                  color: '#111827',
                  borderRadius: '0',
                  boxSizing: 'border-box',
                  fontSize: '0.875rem',
                  transition: 'all 0.2s ease',
                  fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
                }}
              />
            </div>
            
            <div className="flex-1" style={{
              flex: '1',
              boxSizing: 'border-box'
            }}>
              <label className="block text-xs text-gray-500 mb-2 uppercase tracking-wide" style={{
                display: 'block',
                fontSize: '0.75rem',
                color: '#6b7280',
                marginBottom: '0.5rem',
                textTransform: 'uppercase',
                letterSpacing: '0.025em'
              }}>Max ($)</label>
              <input
                type="number"
                value={priceRange[1]}
                onChange={(e) => handlePriceChange(1, e.target.value)}
                className="w-full px-2 py-1.5 border-0 bg-gray-50 text-gray-900 focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
                style={{
                  width: '100%',
                  padding: '0.375rem 0.5rem',
                  border: '0',
                  backgroundColor: '#f9fafb',
                  color: '#111827',
                  borderRadius: '0',
                  boxSizing: 'border-box',
                  fontSize: '0.875rem',
                  transition: 'all 0.2s ease',
                  fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
                }}
              />
            </div>
          </div>
          
          <button
            onClick={applyPriceFilter}
            className="w-full bg-blue-600 text-white py-2 rounded-none hover:bg-blue-700 transition duration-200 font-medium"
            style={{
              width: '100%',
              backgroundColor: '#2563eb',
              color: '#fff',
              padding: '0.5rem 0',
              borderRadius: '0',
              cursor: 'pointer',
              transition: 'background-color 0.2s ease',
              fontWeight: '500',
              border: 'none'
            }}
          >
            Apply Price Range
          </button>
        </div>
      </div>

      {/* Other Filters */}
      <div className="p-4 space-y-3" style={{
        padding: '1rem',
        boxSizing: 'border-box'
      }}>
        {/* In Stock Filter */}
        <div className="flex items-center" style={{
          display: 'flex',
          alignItems: 'center',
          boxSizing: 'border-box'
        }}>
          <input
            type="checkbox"
            id="inStock"
            checked={filters.inStock}
            onChange={(e) => onFilterChange('inStock', e.target.checked)}
            className="h-3.5 w-3.5 text-blue-600 border-gray-300 rounded-none focus:ring-blue-500"
            style={{
              height: '0.875rem',
              width: '0.875rem',
              color: '#2563eb',
              border: '1px solid #d1d5db',
              borderRadius: '0',
              boxSizing: 'border-box',
              accentColor: '#2563eb'
            }}
          />
          <label 
            htmlFor="inStock" 
            className="ml-2.5 text-gray-700 text-xs font-medium"
            style={{
              marginLeft: '0.625rem',
              color: '#374151',
              cursor: 'pointer',
              fontSize: '0.75rem',
              fontWeight: '500'
            }}
          >
            In Stock Only
          </label>
        </div>

        {/* Discount Filter */}
        <div className="flex items-center" style={{
          display: 'flex',
          alignItems: 'center',
          boxSizing: 'border-box'
        }}>
          <input
            type="checkbox"
            id="hasDiscount"
            checked={filters.hasDiscount}
            onChange={(e) => onFilterChange('hasDiscount', e.target.checked)}
            className="h-3.5 w-3.5 text-blue-600 border-gray-300 rounded-none focus:ring-blue-500"
            style={{
              height: '0.875rem',
              width: '0.875rem',
              color: '#2563eb',
              border: '1px solid #d1d5db',
              borderRadius: '0',
              boxSizing: 'border-box',
              accentColor: '#2563eb'
            }}
          />
          <label 
            htmlFor="hasDiscount" 
            className="ml-2.5 text-gray-700 text-xs font-medium"
            style={{
              marginLeft: '0.625rem',
              color: '#374151',
              cursor: 'pointer',
              fontSize: '0.75rem',
              fontWeight: '500'
            }}
          >
            On Sale
          </label>
        </div>

        {/* New Arrivals Filter */}
        <div className="flex items-center" style={{
          display: 'flex',
          alignItems: 'center',
          boxSizing: 'border-box'
        }}>
          <input
            type="checkbox"
            id="isNew"
            checked={filters.isNew}
            onChange={(e) => onFilterChange('isNew', e.target.checked)}
            className="h-3.5 w-3.5 text-blue-600 border-gray-300 rounded-none focus:ring-blue-500"
            style={{
              height: '0.875rem',
              width: '0.875rem',
              color: '#2563eb',
              border: '1px solid #d1d5db',
              borderRadius: '0',
              boxSizing: 'border-box',
              accentColor: '#2563eb'
            }}
          />
          <label 
            htmlFor="isNew" 
            className="ml-2.5 text-gray-700 text-xs font-medium"
            style={{
              marginLeft: '0.625rem',
              color: '#374151',
              cursor: 'pointer',
              fontSize: '0.75rem',
              fontWeight: '500'
            }}
          >
            New Arrivals
          </label>
        </div>

        {/* Rating Filter */}
        <div>
          <h3 className="font-semibold text-gray-900 mb-2 tracking-tight" style={{
            fontWeight: '600',
            color: '#111827',
            marginBottom: '0.5rem',
            letterSpacing: '-0.025em',
            margin: 0
          }}>Minimum Rating</h3>
          <select
            value={filters.minRating}
            onChange={(e) => onFilterChange('minRating', Number(e.target.value))}
            className="w-full px-2 py-1.5 border-0 bg-gray-50 text-gray-900 focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all appearance-none"
            style={{
              width: '100%',
              padding: '0.375rem 0.5rem',
              border: '0',
              backgroundColor: '#f9fafb',
              color: '#111827',
              borderRadius: '0',
              boxSizing: 'border-box',
              fontSize: '0.875rem',
              transition: 'all 0.2s ease',
              fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
              appearance: 'none',
              backgroundImage: 'url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns=\'http://www.w3.org/2000/svg\' viewBox=\'0 0 24 24\' fill=\'none\' stroke=\'currentColor\' stroke-width=\'2\' stroke-linecap=\'round\' stroke-linejoin=\'round\'%3e%3cpolyline points=\'6 9 12 15 18 9\'%3e%3c/polyline%3e%3c/svg%3e")',
              backgroundRepeat: 'no-repeat',
              backgroundPosition: 'right 0.5rem center',
              backgroundSize: '0.75rem'
            }}
          >
            <option value={0}>Any Rating</option>
            <option value={4}>4+ Stars</option>
            <option value={3}>3+ Stars</option>
            <option value={2}>2+ Stars</option>
            <option value={1}>1+ Star</option>
          </select>
        </div>
      </div>
    </div>
  );
}