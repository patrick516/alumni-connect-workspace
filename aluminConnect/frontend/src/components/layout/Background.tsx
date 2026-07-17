import React from "react";

interface BackgroundProps {
  children: React.ReactNode;
  imagePath?: string;
}

const Background: React.FC<BackgroundProps> = ({
  children,
  imagePath = "/students.webp",
}) => {
  return (
    <div className="min-h-screen relative">
      {/* Background Image */}
      <div
        className="fixed inset-0 bg-cover bg-center bg-no-repeat z-0"
        style={{
          backgroundImage: `url(${imagePath})`,
        }}
      ></div>

      {/* Content */}
      <div className="relative z-10">{children}</div>
    </div>
  );
};

export default Background;
