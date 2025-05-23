import React from 'react';

interface InfoItem {
  label: string;
  value: string;
}

interface InfoPanelProps {
  title: string;
  items: InfoItem[];
}

export const InfoPanel: React.FC<InfoPanelProps> = ({ title, items }) => {
  return (
    <div className="bg-white/10 backdrop-blur-md p-6 rounded-xl">
      <h3 className="text-xl font-bold mb-4">{title}</h3>
      <div className="space-y-2">
        {items.map((item, index) => (
          <div key={index} className="flex justify-between py-2 border-b border-white/20 last:border-b-0">
            <span>{item.label}:</span>
            <span className="font-medium">{item.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
};