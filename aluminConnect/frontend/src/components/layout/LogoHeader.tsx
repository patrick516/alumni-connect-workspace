import React from "react";

const LogoHeader: React.FC = () => {
  return (
    <div className="w-full bg-gradient-to-r from-blue-50/95 via-white/95 to-blue-50/95 backdrop-blur-sm border-b border-gray-200 shadow-md">
      <div className="w-full px-4 py-4 md:py-6 flex justify-center items-center">
        <img
          src="/Logo.png"
          alt="Alumni Connect Logo"
          className="h-14 md:h-20 w-auto object-contain"
        />
      </div>
    </div>
  );
};

export default LogoHeader;
