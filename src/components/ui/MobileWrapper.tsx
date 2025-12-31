import React from 'react';

interface MobileWrapperProps {
  children: React.ReactNode;
}

const MobileWrapper: React.FC<MobileWrapperProps> = ({ children }) => {
  return (
    <div className="min-h-screen w-full bg-gray-100 flex justify-center items-center overflow-hidden">
      {/* Mobile: max-width wrapper, Desktop: full width */}
      <div className="w-full max-w-[480px] lg:max-w-none h-[100dvh] bg-white shadow-2xl lg:shadow-none relative overflow-y-auto overflow-x-hidden flex flex-col">
        {children}
      </div>
    </div>
  );
};

export default MobileWrapper;
