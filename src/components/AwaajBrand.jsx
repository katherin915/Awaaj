import React from "react";
import awaazLogo from "../assets/awaaz-logo.svg";

const sizes = {
  sm: "h-7 w-7",
  md: "h-10 w-10",
  lg: "h-14 w-14",
  xl: "h-18 w-18",
};

const textSizes = {
  sm: "text-base",
  md: "text-xl",
  lg: "text-2xl",
  xl: "text-3xl",
};

export const AwaajLogo = ({ size = "md", showText = true }) => (
  <div className="flex items-center gap-2">
    <img src={awaazLogo} alt="Awaaz" className={sizes[size]} />
    {showText && (
      <div className="leading-tight">
        <span className={`${textSizes[size]} font-bold text-orange-600 dark:text-orange-400`}>
          Awaaz
        </span>
        <span className="block text-[10px] text-gray-500 dark:text-gray-400">
          आवाज़
        </span>
      </div>
    )}
  </div>
);

export const AwaajBadge = ({ text = "Awaaz" }) => (
  <span className="inline-flex items-center gap-1.5 rounded-full bg-orange-600 text-white px-4 py-1.5 text-xs font-semibold">
    <img src={awaazLogo} alt="" className="h-4 w-4" />
    {text}
  </span>
);

export const AwaajHeroText = ({ children, className = "" }) => (
  <h1 className={`font-extrabold text-orange-600 dark:text-orange-400 ${className}`}>
    {children}
  </h1>
);

export const AwaajSubtext = ({ children, className = "" }) => (
  <p className={`text-gray-500 dark:text-gray-400 ${className}`}>{children}</p>
);

export default AwaajLogo;
