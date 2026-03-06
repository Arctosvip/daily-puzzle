const canvas = document.getElementById('puzzleCanvas');
const ctx = canvas.getContext('2d');
const sizeSelect = document.getElementById('sizeSelect');
const newImageBtn = document.getElementById('newImageBtn');
const loader = document.getElementById('loader');

let img = null;
let gridSize = parseInt(sizeSelect.value, 10);
let pieces = [];
let pieceWidth = 0;
let pieceHeight = 0;
let firstSelection = null;

let usedIndices = [];

// Массив с качественными изображениями (работают без VPN)
const imageUrls = [
  'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1920&q=80',
  'https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=1920&q=80',
  'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=1920&q=80',
  'https://images.unsplash.com/photo-1472214103451-9374bd1c798e?w=1920&q=80',
  'https://images.unsplash.com/photo-1433086966358-54859d0ed716?w=1920&q=80',
  'https://images.unsplash.com/photo-1501594907352-04cda38ebc29?w=1920&q=80',
  'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?w=1920&q=80',
  'https://images.unsplash.com/photo-1447752875215-b2761acb3c5d?w=1920&q=80',
  'https://images.unsplash.com/photo-1475924156734-496f6cac6ec1?w=1920&q=80',
  'https://images.unsplash.com/photo-1418065460487-3e41a6c84dc5?w=1920&q=80',
  'https://images.unsplash.com/photo-1519681393784-d120267933ba?w=1920&q=80',
  'https://images.unsplash.com/photo-1502082553048-f009c37129b9?w=1920&q=80',
  'https://images.unsplash.com/photo-1465146633011-14f8e0781093?w=1920&q=80',
  'https://images.unsplash.com/photo-1426604966848-d7adac402bff?w=1920&q=80',
  'https://images.unsplash.com/photo-1504893524553-b855bce32c67?w=1920&q=80',
  'https://images.unsplash.com/photo-1511884642898-4c92249e20b6?w=1920&q=80',
  'https://images.unsplash.com/photo-1483086431886-3590a88317fe?w=1920&q=80',
  'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=1920&q=80',
  'https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?w=1920&q=80',
  'https://images.unsplash.com/photo-1439066615861-d1af74d74000?w=1920&q=80'
];

function getRandomImageUrl() {
  let index = Math.floor(Math.random() * imageUrls.length);
  
  while (usedIndices.includes(index) && usedIndices.length < imageUrls.length) {
    index = Math.floor(Math.random() * imageUrls.length);
  }
  
  usedIndices.push(index);
  if (usedIndices.length >= imageUrls.length) {
    usedIndices = [];
  }
  
  return imageUrls[index];
}

function resizeCanvas() {
  const container = document.querySelector('.game-container');
  const maxWidth = container.clientWidth;
  const maxHeight = window.innerHeight - 150;
  
  if (img) {
    const aspectRatio = img.width / img.height;
    let newWidth = maxWidth;
    let newHeight = newWidth / aspectRatio;
    
    if (newHeight > maxHeight) {
      newHeight = maxHeight;
      newWidth = newHeight * aspectRatio;
    }
    
    canvas.width = newWidth;
    canvas.height = newHeight;
    
    pieceWidth = canvas.width / gridSize;
    pieceHeight = canvas.height / gridSize;
  }
}

function setupCanvasAndPieces() {
  if (!img) return;
  
  resizeCanvas();
  
  pieces = [];
  for (let row = 0; row < gridSize; row++) {
    for (let col = 0; col < gridSize; col++) {
      pieces.push({
        correctRow: row,
        correctCol: col,
        currentRow: row,
        currentCol: col
      });
    }
  }
  
  for (let i = pieces.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    const temp = pieces[i];
    pieces[i] = pieces[j];
    pieces[j] = temp;
  }
  
  pieces.forEach((piece, index) => {
    piece.currentRow = Math.floor(index / gridSize);
    piece.currentCol = index % gridSize;
  });
}

function drawPieces() {
  if (!img) return;
  
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  
  pieces.forEach((piece) => {
    const sx = piece.correctCol * (img.width / gridSize);
    const sy = piece.correctRow * (img.height / gridSize);
    const sWidth = img.width / gridSize;
    const sHeight = img.height / gridSize;
    
    const dx = piece.currentCol * pieceWidth;
    const dy = piece.currentRow * pieceHeight;
    
    ctx.drawImage(img, sx, sy, sWidth, sHeight, dx, dy, pieceWidth, pieceHeight);
    
    ctx.strokeStyle = '#333';
    ctx.lineWidth = 2;
    ctx.strokeRect(dx, dy, pieceWidth, pieceHeight);
    
    if (firstSelection && 
        firstSelection.currentRow === piece.currentRow && 
        firstSelection.currentCol === piece.currentCol) {
      ctx.strokeStyle = '#FFD700';
      ctx.lineWidth = 4;
      ctx.strokeRect(dx, dy, pieceWidth, pieceHeight);
    }
  });
  
  checkWin();
}

function checkWin() {
  const isWin = pieces.every(piece => 
    piece.correctRow === piece.currentRow && 
    piece.correctCol === piece.currentCol
  );
  
  if (isWin && pieces.length > 0) {
    setTimeout(() => {
      alert('Поздравляем! Вы собрали пазл!');
    }, 100);
  }
}

function getPieceAt(row, col) {
  return pieces.find(p => p.currentRow === row && p.currentCol === col);
}

function swapPieces(piece1, piece2) {
  const tempRow = piece1.currentRow;
  const tempCol = piece1.currentCol;
  
  piece1.currentRow = piece2.currentRow;
  piece1.currentCol = piece2.currentCol;
  
  piece2.currentRow = tempRow;
  piece2.currentCol = tempCol;
}

function handleTap(x, y) {
  const col = Math.floor(x / pieceWidth);
  const row = Math.floor(y / pieceHeight);
  
  if (col < 0 || col >= gridSize || row < 0 || row >= gridSize) {
    return;
  }
  
  const clickedPiece = getPieceAt(row, col);
  
  if (!clickedPiece) return;
  
  if (!firstSelection) {
    firstSelection = clickedPiece;
    drawPieces();
  } else {
    if (firstSelection === clickedPiece) {
      firstSelection = null;
      drawPieces();
      return;
    }
    
    swapPieces(firstSelection, clickedPiece);
    firstSelection = null;
    drawPieces();
  }
}

canvas.addEventListener('click', e => handleTap(e.clientX, e.clientY));
canvas.addEventListener('touchend', e => {
  e.preventDefault();
  const touch = e.changedTouches[0];
  handleTap(touch.clientX, touch.clientY);
}, { passive: false });

sizeSelect.addEventListener('change', () => {
  if (!img) return;
  gridSize = parseInt(sizeSelect.value, 10);
  setupCanvasAndPieces();
  drawPieces();
});

newImageBtn.addEventListener('click', () => loadNewImage());
window.addEventListener('resize', () => {
  if (!img) return;
  setupCanvasAndPieces();
  drawPieces();
});

resizeCanvas();
loadNewImage();

function loadNewImage() {
  loader.style.display = 'block';
  
  const imageUrl = getRandomImageUrl();
  
  img = new Image();
  img.crossOrigin = 'anonymous';
  
  img.onload = () => {
    loader.style.display = 'none';
    gridSize = parseInt(sizeSelect.value, 10);
    setupCanvasAndPieces();
    drawPieces();
  };
  
  img.onerror = () => {
    loader.style.display = 'none';
    alert('Ошибка загрузки изображения. Попробуйте ещё раз.');
  };
  
  img.src = imageUrl;
}
