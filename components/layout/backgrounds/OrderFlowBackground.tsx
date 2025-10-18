'use client';

import React from 'react';

export default function OrderFlowBackground() {
  return (
    <>
      {/* Base gradient */}
      <div 
        className="absolute inset-0 opacity-10"
        style={{
          background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.3), rgba(6, 182, 212, 0.3))'
        }}
      />
      
      {/* Animated flow lines */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="flow-line flow-line-1" />
        <div className="flow-line flow-line-2" />
        <div className="flow-line flow-line-3" />
      </div>
      
      {/* Floating particles */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="particle particle-1" />
        <div className="particle particle-2" />
        <div className="particle particle-3" />
        <div className="particle particle-4" />
      </div>
      
      <style jsx>{`
        .flow-line {
          position: absolute;
          width: 100%;
          height: 2px;
          background: linear-gradient(90deg, transparent, rgba(6, 182, 212, 0.5), transparent);
          animation: flowUp 8s infinite linear;
        }
        
        .flow-line-1 {
          left: 10%;
          animation-delay: 0s;
        }
        
        .flow-line-2 {
          left: 50%;
          animation-delay: 2.5s;
        }
        
        .flow-line-3 {
          left: 80%;
          animation-delay: 5s;
        }
        
        .particle {
          position: absolute;
          width: 4px;
          height: 4px;
          background: rgba(59, 130, 246, 0.6);
          border-radius: 50%;
          animation: floatUp 12s infinite linear;
        }
        
        .particle-1 {
          left: 20%;
          animation-delay: 0s;
        }
        
        .particle-2 {
          left: 45%;
          animation-delay: 3s;
        }
        
        .particle-3 {
          left: 65%;
          animation-delay: 6s;
        }
        
        .particle-4 {
          left: 85%;
          animation-delay: 9s;
        }
        
        @keyframes flowUp {
          0% {
            bottom: -10%;
            opacity: 0;
          }
          10% {
            opacity: 1;
          }
          90% {
            opacity: 1;
          }
          100% {
            bottom: 110%;
            opacity: 0;
          }
        }
        
        @keyframes floatUp {
          0% {
            bottom: -5%;
            opacity: 0;
          }
          10% {
            opacity: 0.8;
          }
          90% {
            opacity: 0.8;
          }
          100% {
            bottom: 105%;
            opacity: 0;
          }
        }
      `}</style>
    </>
  );
}
