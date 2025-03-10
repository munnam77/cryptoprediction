import React, { useState, useEffect, useRef } from 'react';
import { Search, X } from 'lucide-react';

interface SearchBarProps {
  onSearch: (query: string) => void;
  placeholder?: string;
  className?: string;
}

/**
 * SearchBar Component
 * 
 * A search input field with clear button and search icon
 * for filtering cryptocurrency data
 */
const SearchBar: React.FC<SearchBarProps> = ({
  onSearch,
  placeholder = 'Search cryptocurrencies...',
  className = ''
}) => {
  const [query, setQuery] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  
  // Handle input change
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setQuery(value);
    onSearch(value);
  };
  
  // Handle clear button click
  const handleClear = () => {
    setQuery('');
    onSearch('');
    // Focus the input after clearing
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };
  
  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ctrl+K or Cmd+K to focus search
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        if (inputRef.current) {
          inputRef.current.focus();
        }
      }
      
      // Escape to clear and blur
      if (e.key === 'Escape' && document.activeElement === inputRef.current) {
        handleClear();
        inputRef.current?.blur();
      }
    };
    
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);
  
  return (
    <div className={`relative ${className}`}>
      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
        <Search size={18} className="text-gray-400" />
      </div>
      
      <input
        ref={inputRef}
        type="text"
        value={query}
        onChange={handleChange}
        placeholder={placeholder}
        className="w-full bg-gray-800 text-white placeholder-gray-400 rounded-lg py-2 pl-10 pr-10 focus:outline-none focus:ring-2 focus:ring-blue-500"
        aria-label="Search"
      />
      
      {query && (
        <button
          onClick={handleClear}
          className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-white"
          aria-label="Clear search"
        >
          <X size={18} />
        </button>
      )}
      
      <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
        <kbd className="hidden sm:inline-flex items-center px-1.5 text-xs text-gray-400 bg-gray-700 rounded">
          {navigator.platform.indexOf('Mac') === 0 ? '⌘' : 'Ctrl'}+K
        </kbd>
      </div>
    </div>
  );
};

export default SearchBar; 