import React from "react";

interface LogoProps {
  className?: string;
  size?: "sm" | "md" | "lg";
}

export default function Logo({ className = "", size = "md" }: LogoProps) {
  const getDimensions = () => {
    switch (size) {
      case "sm":
        return "h-6 w-6";
      case "lg":
        return "h-10 w-10";
      case "md":
      default:
        return "h-8 w-8";
    }
  };

  return (
    <div className={`flex items-center justify-center shrink-0 ${className}`}>
      <svg
        className={`${getDimensions()} text-red-600 fill-red-600`}
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Heartbeat Pulse-Loop inside a Blood Drop */}
        <path
          d="M12 2C12 2 19.5 9.5 19.5 14C19.5 18.1421 16.1421 21.5 12 21.5C7.85786 21.5 4.5 18.1421 4.5 14C4.5 9.5 12 2 12 2Z"
          className="fill-red-600 stroke-red-600"
          strokeWidth="1"
        />
        {/* ECG pulse heartbeat line */}
        <path
          d="M8.5 14.5H10.2L11 12L12.5 16.5L13.3 14H15.5"
          stroke="white"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        />
      </svg>
    </div>
  );
}
