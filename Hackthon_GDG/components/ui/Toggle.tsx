import React, { useState } from 'react';

interface ToggleProps {
  label: string;
  initialValue?: boolean;
}

const Toggle: React.FC<ToggleProps> = ({ label, initialValue = true }) => {
  const [enabled, setEnabled] = useState(initialValue);

  return (
    <div className="flex items-center justify-between">
      <span className="text-sm font-medium text-gray-900">{label}</span>
      <button
        type="button"
        onClick={() => setEnabled(!enabled)}
        className={`${
          enabled ? 'bg-indigo-600' : 'bg-gray-200'
        } relative inline-flex items-center h-6 rounded-full w-11 transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500`}
      >
        <span
          className={`${
            enabled ? 'translate-x-6' : 'translate-x-1'
          } inline-block w-4 h-4 transform bg-white rounded-full transition-transform duration-200 ease-in-out`}
        />
      </button>
    </div>
  );
};

export default Toggle;
