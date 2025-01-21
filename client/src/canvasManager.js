let canvas;

export const drawCanvas = (drawState, canvasRef) => {
  if (!canvasRef) return;
  
  canvas = canvasRef;
  const ctx = canvas.getContext('2d');
  
  // Clear the canvas
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  
  // Set background
  ctx.fillStyle = '#f5f5f5';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  
  // Add any game drawing logic here
  // For example, drawing players, spells, etc.
};
