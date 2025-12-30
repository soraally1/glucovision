import React from 'react';

interface MobileWrapperProps {
  children: React.ReactNode;
}

const MobileWrapper: React.FC<MobileWrapperProps> = ({ children }) => {
  return (
    <div className="min-h-screen w-full bg-gray-100 flex justify-center items-center overflow-hidden">
      <div className="w-full max-w-[480px] h-[100dvh] bg-white shadow-2xl relative overflow-y-auto overflow-x-hidden flex flex-col">
        {children}
      </div>
    </div>
  );
};

export default MobileWrapper;
