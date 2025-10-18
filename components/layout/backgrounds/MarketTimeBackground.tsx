'use client';

import React from 'react';

export default function MarketTimeBackground() {
  return (
    <>
      {/* Base gradient - Cyan/Blue theme */}
      <div 
        className="absolute inset-0 opacity-10"
        style={{
          background: 'linear-gradient(135deg, rgba(34, 211, 238, 0.3), rgba(59, 130, 246, 0.3))'
        }}
      />
      
      {/* Rotating clock markers */}
      <div className="absolute inset-0 flex items-center justify-center overflow-hidden">
        <div className="clock-markers" />
      </div>
      
      {/* Time particles */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="time-particle time-particle-1" />
        <div className="time-particle time-particle-2" />
        <div className="time-particle time-particle-3" />
        <div className="time-particle time-particle-4" />
      </div>
      
      <style jsx>{`
        .clock-markers {
          position: relative;
          width: 200px;
          height: 200px;
          border-radius: 50%;
          border: 1px solid rgba(34, 211, 238, 0.1);
          animation: rotate 60s infinite linear;
        }
        
        .clock-markers::before,
        .clock-markers::after {
          content: '';
          position: absolute;
          background: rgba(34, 211, 238, 0.2);
        }
        
        .clock-markers::before {
          width: 1px;
          height: 100%;
          left: 50%;
          transform: translateX(-50%);
        }
        
        .clock-markers::after {
          width: 100%;
          height: 1px;
          top: 50%;
          transform: translateY(-50%);
        }
        
        .time-particle {
          position: absolute;
          width: 3px;
          height: 3px;
          background: rgba(34, 211, 238, 0.6);
          border-radius: 50%;
          animation: pulse-move 8s infinite ease-in-out;
        }
        
        .time-particle-1 {
          top: 20%;
          left: 20%;
          animation-delay: 0s;
        }
        
        .time-particle-2 {
          top: 70%;
          left: 30%;
          animation-delay: 2s;
        }
        
        .time-particle-3 {
          top: 40%;
          right: 25%;
          animation-delay: 4s;
        }
        
        .time-particle-4 {
          top: 80%;
          right: 20%;
          animation-delay: 6s;
        }
        
        @keyframes rotate {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }
        
        @keyframes pulse-move {
          0%, 100% {
            opacity: 0.3;
            transform: scale(1);
          }
          50% {
            opacity: 0.8;
            transform: scale(1.5);
          }
        }
      `}</style>
    </>
  );
}
