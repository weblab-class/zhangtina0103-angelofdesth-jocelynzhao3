import { useEffect, useRef } from "react";

const useTextFit = (text, containerRef, maxFontSize = 40, minFontSize = 16) => {
  const textRef = useRef(null);

  useEffect(() => {
    const container = containerRef.current;
    const textElement = textRef.current;

    if (!container || !textElement || !text) return;

    const fitText = () => {
      let fontSize = maxFontSize;
      textElement.style.fontSize = `${fontSize}px`;

      while (
        (textElement.scrollWidth > container.clientWidth ||
          textElement.scrollHeight > container.clientHeight) &&
        fontSize > minFontSize
      ) {
        fontSize -= 1;
        textElement.style.fontSize = `${fontSize}px`;
      }
    };

    fitText();

    // Re-run on window resize
    window.addEventListener("resize", fitText);
    return () => window.removeEventListener("resize", fitText);
  }, [text, maxFontSize, minFontSize]);

  return textRef;
};

export default useTextFit;
