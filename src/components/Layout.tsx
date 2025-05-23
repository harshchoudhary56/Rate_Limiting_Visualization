import React, { ReactNode } from 'react';

interface Tab {
  id: string;
  label: string;
}

interface LayoutProps {
  title: string;
  subtitle: string;
  tabs: Tab[];
  activeTab: string;
  onTabChange: (tabId: string) => void;
  children: ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({
  title,
  subtitle,
  tabs,
  activeTab,
  onTabChange,
  children
}) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 text-white">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-2 text-shadow">{title}</h1>
          <p className="text-xl">{subtitle}</p>
        </div>

        <div className="flex justify-center mb-8 flex-wrap gap-2">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              className={`px-6 py-3 rounded-full text-white font-medium transition-all duration-300 ${
                activeTab === tab.id
                  ? 'bg-white/30 shadow-lg transform -translate-y-1'
                  : 'bg-white/10 hover:bg-white/20'
              }`}
              onClick={() => onTabChange(tab.id)}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {children}
      </div>
    </div>
  );
};