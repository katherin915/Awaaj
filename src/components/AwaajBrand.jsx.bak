import React from 'react';
import awaazLogo from '../assets/awaaz-logo.svg';

/**
 * Awaaj Brand Component
 * Displays the Awaaj logo with bilingual text
 * Use this component consistently across the app
 */

export const AwaajLogo = ({ size = 'md', showText = true, animated = false }) => {
  const sizes = {
    sm: 'h-8 w-8',
    md: 'h-12 w-12',
    lg: 'h-16 w-16',
    xl: 'h-20 w-20',
  };

  const textSizes = {
    sm: 'text-lg',
    md: 'text-2xl',
    lg: 'text-3xl',
    xl: 'text-4xl',
  };

  return (
    <div className="flex items-center gap-3 group">
      <div className={`relative ${animated ? 'voice-wave' : ''}`}>
        <img
          src={awaazLogo}
          alt="Awaaj Logo"
          className={`${sizes[size]} transition-all duration-300 group-hover:scale-110 ${
            animated ? 'animate-float' : 'group-hover:rotate-3'
          } drop-shadow-awaaj`}
        />
      </div>
      {showText && (
        <div className="flex flex-col">
          <span className={`${textSizes[size]} font-display font-bold text-gradient-awaaj`}>
            Awaaj
          </span>
          <span className="text-xs font-medium text-awaaj-muted dark:text-gray-400 font-hindi">
            आवाज़ - Voice of People
          </span>
        </div>
      )}
    </div>
  );
};

export const AwaajBadge = ({ text = "Awaaj", icon = null }) => {
  return (
    <div className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-gradient-awaaj text-white shadow-awaaj group hover:shadow-awaaj-lg transition-all duration-300 hover:scale-105">
      {icon ? (
        <img src={awaazLogo} alt="Awaaj" className="h-6 w-6 group-hover:rotate-12 transition-transform" />
      ) : null}
      <span className="font-bold text-sm uppercase tracking-wider">{text}</span>
    </div>
  );
};

export const AwaajHeroText = ({ children, className = "" }) => {
  return (
    <h1 className={`font-display font-black text-gradient-awaaj ${className}`}>
      {children}
    </h1>
  );
};

export const AwaajSubtext = ({ children, className = "" }) => {
  return (
    <p className={`font-hindi text-awaaj-muted dark:text-gray-400 ${className}`}>
      {children}
    </p>
  );
};

export default AwaajLogo;
