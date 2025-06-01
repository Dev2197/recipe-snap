import React from "react";
import { ChefHat } from "lucide-react";

const LoadingSpinner = () => {
  return (
    <div className="flex flex-col items-center justify-center">
      <div className="relative">
        {/* Outer spinning ring */}
        <div className="w-16 h-16 border-4 border-gray-200 border-t-primary-600 rounded-full animate-spin"></div>

        {/* Inner chef hat icon */}
        <div className="absolute inset-0 flex items-center justify-center">
          <ChefHat className="h-6 w-6 text-primary-600 animate-pulse" />
        </div>
      </div>

      {/* Animated dots */}
      <div className="flex space-x-1 mt-4">
        <div
          className="w-2 h-2 bg-primary-600 rounded-full animate-bounce"
          style={{ animationDelay: "0ms" }}
        ></div>
        <div
          className="w-2 h-2 bg-primary-600 rounded-full animate-bounce"
          style={{ animationDelay: "150ms" }}
        ></div>
        <div
          className="w-2 h-2 bg-primary-600 rounded-full animate-bounce"
          style={{ animationDelay: "300ms" }}
        ></div>
      </div>
    </div>
  );
};

export default LoadingSpinner;
