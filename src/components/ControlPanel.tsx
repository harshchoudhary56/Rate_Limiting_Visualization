import React from 'react';

interface Control {
  label: string;
  value: number;
  min: number;
  max: number;
  onChange: (value: number) => void;
}

interface Action {
  label: string;
  onClick: () => void;
  primary: boolean;
}

interface ControlPanelProps {
  controls: Control[];
  actions: Action[];
}

export const ControlPanel: React.FC<ControlPanelProps> = ({ controls, actions }) => {
  return (
    <div className="bg-white/10 backdrop-blur-md p-6 rounded-xl mb-6">
      <div className="flex flex-wrap gap-5 mb-4">
        {controls.map((control, index) => (
          <div key={index} className="flex items-center">
            <label className="font-medium mr-2 min-w-24">{control.label}:</label>
            <input 
              type="number" 
              value={control.value} 
              min={control.min} 
              max={control.max}
              onChange={(e) => control.onChange(parseInt(e.target.value, 10) || control.min)}
              className="px-3 py-2 rounded-lg bg-white/90 text-gray-800 text-sm w-24 focus:outline-none focus:ring-2 focus:ring-white/50"
            />
          </div>
        ))}
      </div>
      <div className="flex flex-wrap gap-3">
        {actions.map((action, index) => (
          <button 
            key={index}
            onClick={action.onClick}
            className={`px-4 py-2 rounded-lg font-medium transition-all hover:shadow-lg hover:-translate-y-1 ${
              action.primary 
                ? 'bg-green-500 text-white hover:bg-green-600' 
                : 'bg-red-500 text-white hover:bg-red-600'
            }`}
          >
            {action.label}
          </button>
        ))}
      </div>
    </div>
  );
};