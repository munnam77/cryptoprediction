import React from 'react';

export type FilterTab = {
  id: string;
  label: string;
  count?: number;
};

interface FilterTabsProps {
  tabs: FilterTab[];
  activeTab: string;
  onTabChange: (tabId: string) => void;
  className?: string;
}

/**
 * FilterTabs Component
 * 
 * A set of tabs for filtering cryptocurrency data by category
 * (e.g., All, Trending, Watchlist, etc.)
 */
const FilterTabs: React.FC<FilterTabsProps> = ({
  tabs,
  activeTab,
  onTabChange,
  className = ''
}) => {
  return (
    <div className={`flex overflow-x-auto scrollbar-hide ${className}`}>
      <div className="flex space-x-1 p-1 bg-gray-800 rounded-lg">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={`
              px-4 py-2 rounded-md text-sm font-medium whitespace-nowrap transition-colors
              ${activeTab === tab.id 
                ? 'bg-gray-700 text-white shadow-sm' 
                : 'text-gray-400 hover:text-white hover:bg-gray-700'
              }
            `}
            aria-current={activeTab === tab.id ? 'page' : undefined}
          >
            {tab.label}
            {tab.count !== undefined && (
              <span className={`ml-2 px-1.5 py-0.5 text-xs rounded-full ${
                activeTab === tab.id 
                  ? 'bg-gray-600 text-gray-300' 
                  : 'bg-gray-700 text-gray-400'
              }`}>
                {tab.count}
              </span>
            )}
          </button>
        ))}
      </div>
    </div>
  );
};

export default FilterTabs; 