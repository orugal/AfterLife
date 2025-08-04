import React from 'react';
import heartIcon from '../assets/corazon.png';

const Loading = () => {
  return (
    <div className="fixed inset-0 bg-gray-900 bg-opacity-90 flex flex-col items-center justify-center z-50">
      <img src={heartIcon} alt="Loading Heart" className="w-24 h-24 animate-breathing" />
      <p className="text-white text-2xl font-semibold mt-4">Loading...</p>
    </div>
  );
};

export default Loading;
