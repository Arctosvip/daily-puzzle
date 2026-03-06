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

let usedUrls = [];

// Темы для поиска профессиональных фотографий
const searchTerms = [
  'landscape', 'mountains', 'ocean', 'forest', 'architecture',
  'sunset', 'nature', 'city', 'abstract', 'minimal'
];

async function getRandomImageUrl() {
  try {
    // Используем Lorem Picsum - надежный сервис с качественными изображениями
    const randomId = Math.floor(Math.random() * 1000) + 1;
    const imageUrl = `https://picsum.photos/id/${randomId}/600/400`;    
    usedUrls.push(imageUrl);
    if (usedUrls.length > 50) usedUrls.shift();
    
    return imageUrl;
  } catch (error) {
    console.error('Ошибка загрузки изображения:', error);
    throw error;
  }
}

function resizeCanvas() {
  const container = canvas.parentElement;
  const size = Math.min(container.clientWidth, container.clientHeight);
  canvas.width = size;
  canvas.height = size;
}

function loadNewImage() {
  loader.style.display = 'block';
  newImageBtn.disabled = true;
  
  getRandomImageUrl().then(url => {
    img = new Image();
    img.crossOrigin = 'Anonymous';
    
    img.onload = () => {
      loader.style.display = 'none';
      newImageBtn.disabled = false;
      setupPuzzle();
    };
    
    img.onerror = () => {
      loader.style.display = 'none';
      newImageBtn.disabled = false;
      alert('Ошибка загрузки изображения. Попробуйте еще раз.');
    };
    
    img.src = url;
  }).catch(error => {
    loader.style.display = 'none';
    newImageBtn.disabled = false;
    alert('Ошибка загрузки изображения. Попробуйте еще раз.');
  });
}

function setupPuzzle() {
  pieces = [];
  firstSelection = null;
  
  pieceWidth = canvas.width / gridSize;
  pieceHeight = canvas.height / gridSize;
  
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
  
  shufflePieces();
  drawPuzzle();
}

function shufflePieces() {
  for (let i = pieces.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    
    const tempRow = pieces[i].currentRow;
    const tempCol = pieces[i].currentCol;
    
    pieces[i].currentRow = pieces[j].currentRow;
    pieces[i].currentCol = pieces[j].currentCol;
    
    pieces[j].currentRow = tempRow;
    pieces[j].currentCol = tempCol;
  }
}

function drawPuzzle() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  
  for (const piece of pieces) {
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
  }
  
  if (firstSelection) {
    const dx = firstSelection.currentCol * pieceWidth;
    const dy = firstSelection.currentRow * pieceHeight;
    
    ctx.strokeStyle = '#FFD700';
    ctx.lineWidth = 4;
    ctx.strokeRect(dx, dy, pieceWidth, pieceHeight);
  }
}

function getPieceAt(x, y) {
  const col = Math.floor(x / pieceWidth);
  const row = Math.floor(y / pieceHeight);
  
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

function checkWin() {
  return pieces.every(p => p.currentRow === p.correctRow && p.currentCol === p.correctCol);
}

canvas.addEventListener('click', (e) => {
  if (!img) return;
  
  const rect = canvas.getBoundingClientRect();
  const x = e.clientX - rect.left;
  const y = e.clientY - rect.top;
  
  const clickedPiece = getPieceAt(x, y);
  
  if (!clickedPiece) return;
  
  if (!firstSelection) {
    firstSelection = clickedPiece;
  } else {
    swapPieces(firstSelection, clickedPiece);
    firstSelection = null;
    
    drawPuzzle();
    
    if (checkWin()) {
      setTimeout(() => {
        ctx.strokeStyle = 'transparent';
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        alert('Поздравляем! Вы собрали пазл!');
      }, 100);
      return;
    }
  }
  
  drawPuzzle();
});

sizeSelect.addEventListener('change', () => {
  gridSize = parseInt(sizeSelect.value, 10);
  if (img) {
    setupPuzzle();
  }
});

newImageBtn.addEventListener('click', loadNewImage);

window.addEventListener('resize', () => {
  resizeCanvas();
  if (img) {
    setupPuzzle();
  }
});

resizeCanvas();
loadNewImage();
