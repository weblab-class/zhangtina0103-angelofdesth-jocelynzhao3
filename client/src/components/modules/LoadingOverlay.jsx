import React, { useState, useEffect } from "react";
import "./LoadingOverlay.css";

const LoadingOverlay = () => {
  const [displayText, setDisplayText] = useState("3");
  const [key, setKey] = useState(0);
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    // Add class to body when overlay mounts
    document.body.classList.add('loading-active');

    // Show 3
    const timer1 = setTimeout(() => {
      setKey(k => k + 1);
      setDisplayText("2");
      
      const timer2 = setTimeout(() => {
        setKey(k => k + 1);
        setDisplayText("1");
        
        const timer3 = setTimeout(() => {
          setKey(k => k + 1);
          setDisplayText("GO!");
          
          const timer4 = setTimeout(() => {
            setIsVisible(false);
            // Remove class from body when overlay unmounts
            document.body.classList.remove('loading-active');
          }, 1000);
          return () => clearTimeout(timer4);
        }, 1000);
        return () => clearTimeout(timer3);
      }, 1000);
      return () => clearTimeout(timer2);
    }, 1000);

    return () => {
      clearTimeout(timer1);
      // Cleanup: ensure body class is removed when component unmounts
      document.body.classList.remove('loading-active');
    };
  }, []);

  if (!isVisible) return null;

  return (
    <div className="LoadingOverlay">
      <div 
        key={key} 
        className={`LoadingOverlay-content ${displayText === "GO!" ? "go" : ""}`}
      >
        {displayText}
      </div>
    </div>
  );
};

export default LoadingOverlay;
