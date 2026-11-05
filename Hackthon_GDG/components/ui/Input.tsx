import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  id: string;
  prefix?: string;
}

const Input: React.FC<InputProps> = ({ label, id, prefix, ...props }) => {
  return (
    <div>
      <label htmlFor={id} className="block text-sm font-medium text-gray-700">
        {label}
      </label>
      <div className="mt-1 relative rounded-md shadow-sm">
        {prefix && (
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <span className="text-gray-500 sm:text-sm">{prefix}</span>
          </div>
        )}
        <input
          id={id}
          {...props}
          className={`appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm bg-white text-black placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm ${prefix ? 'pl-10' : ''}`}
        />
      </div>
    </div>
  );
};

export default Input;