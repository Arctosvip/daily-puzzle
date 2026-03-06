const canvas = document.getElementById('puzzleCanvas');
const ctx = canvas.getContext('2d');
const sizeSelect = document.getElementById('sizeSelect');
const newImageBtn = document.getElementById('newImageBtn');

let img = null;
let gridSize = parseInt(sizeSelect.value, 10);
let pieces = [];
let pieceWidth = 0;
let pieceHeight = 0;
let firstSelection = null;

// Получаем случайное фото с picsum.photos (без API ключа, без CORS проблем)
function fetchRandomImageUrl() {
  const randomId = Math.floor(Math.random() * 1000) + 1;
  return `https://picsum.photos/id/${randomId}/800/600`;
}

function loadNewImage() {
  firstSelection = null;
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  const imageUrl = fetchRandomImageUrl();
  img = new Image();
  img.crossOrigin = 'anonymous';

  img.onload = () => {
    setupCanvasAndPieces();
    drawPieces();
  };

  img.onerror = () => {
    // Если картинка не загрузилась, пробуем другую
    loadNewImage();
  };

  img.src = imageUrl;
}

function setupCanvasAndPieces() {
  const targetWidth = Math.min(window.innerWidth - 40, 600);
  const ratio = img.height / img.width;
  const targetHeight = Math.round(targetWidth * ratio);

  canvas.width = targetWidth;
  canvas.height = targetHeight;

  gridSize = parseInt(sizeSelect.value, 10);
  pieceWidth = canvas.width / gridSize;
  pieceHeight = canvas.height / gridSize;

  pieces = [];
  for (let row = 0; row < gridSize; row++) {
    for (let col = 0; col < gridSize; col++) {
      pieces.push({
        originalRow: row,
        originalCol: col,
        currentRow: row,
        currentCol: col
      });
    }
  }
  shufflePieces();
}

function shufflePieces() {
  for (let i = pieces.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    const tmpRow = pieces[i].currentRow;
    const tmpCol = pieces[i].currentCol;
    pieces[i].currentRow = pieces[j].currentRow;
    pieces[i].currentCol = pieces[j].currentCol;
    pieces[j].currentRow = tmpRow;
    pieces[j].currentCol = tmpCol;
  }
}

function drawPieces() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  pieces.forEach(piece => {
    const sx = (piece.originalCol * img.width) / gridSize;
    const sy = (piece.originalRow * img.height) / gridSize;
    const sWidth = img.width / gridSize;
    const sHeight = img.height / gridSize;
    const dx = piece.currentCol * pieceWidth;
    const dy = piece.currentRow * pieceHeight;
    ctx.drawImage(img, sx, sy, sWidth, sHeight, dx, dy, pieceWidth, pieceHeight);
  });

  // Рисуем сетку
  ctx.strokeStyle = 'rgba(255,255,255,0.3)';
  ctx.lineWidth = 1;
  for (let r = 0; r <= gridSize; r++) {
    ctx.beginPath();
    ctx.moveTo(0, r * pieceHeight);
    ctx.lineTo(canvas.width, r * pieceHeight);
    ctx.stroke();
  }
  for (let c = 0; c <= gridSize; c++) {
    ctx.beginPath();
    ctx.moveTo(c * pieceWidth, 0);
    ctx.lineTo(c * pieceWidth, canvas.height);
    ctx.stroke();
  }

  // Подсветка выбранного кусочка
  if (firstSelection) {
    ctx.strokeStyle = '#facc15';
    ctx.lineWidth = 3;
    ctx.strokeRect(
      firstSelection.currentCol * pieceWidth + 1.5,
      firstSelection.currentRow * pieceHeight + 1.5,
      pieceWidth - 3,
      pieceHeight - 3
    );
  }
}

function findPieceAt(x, y) {
  const col = Math.floor(x / pieceWidth);
  const row = Math.floor(y / pieceHeight);
  return pieces.find(p => p.currentRow === row && p.currentCol === col);
}

function swapPieces(p1, p2) {
  const tmpRow = p1.currentRow;
  const tmpCol = p1.currentCol;
  p1.currentRow = p2.currentRow;
  p1.currentCol = p2.currentCol;
  p2.currentRow = tmpRow;
  p2.currentCol = tmpCol;
}

function checkSolved() {
  return pieces.every(p => p.currentRow === p.originalRow && p.currentCol === p.originalCol);
}

canvas.addEventListener('click', e => {
  if (!img) return;
  const rect = canvas.getBoundingClientRect();
  const x = (e.clientX - rect.left) * (canvas.width / rect.width);
  const y = (e.clientY - rect.top) * (canvas.height / rect.height);
  const clickedPiece = findPieceAt(x, y);
  if (!clickedPiece) return;
  if (!firstSelection) {
    firstSelection = clickedPiece;
  } else if (clickedPiece === firstSelection) {
    firstSelection = null;
  } else {
    swapPieces(firstSelection, clickedPiece);
    firstSelection = null;
    drawPieces();
    if (checkSolved()) {
      setTimeout(() => alert('Готово! Картинка собрана.'), 100);
      return;
    }
  }
  drawPieces();
});

// Тач-поддержка для телефонов
canvas.addEventListener('touchend', e => {
  e.preventDefault();
  if (!img) return;
  const touch = e.changedTouches[0];
  const rect = canvas.getBoundingClientRect();
  const x = (touch.clientX - rect.left) * (canvas.width / rect.width);
  const y = (touch.clientY - rect.top) * (canvas.height / rect.height);
  const clickedPiece = findPieceAt(x, y);
  if (!clickedPiece) return;
  if (!firstSelection) {
    firstSelection = clickedPiece;
  } else if (clickedPiece === firstSelection) {
    firstSelection = null;
  } else {
    swapPieces(firstSelection, clickedPiece);
    firstSelection = null;
    drawPieces();
    if (checkSolved()) {
      setTimeout(() => alert('Готово! Картинка собрана.'), 100);
      return;
    }
  }
  drawPieces();
});

sizeSelect.addEventListener('change', () => {
  if (!img) return;
  setupCanvasAndPieces();
  drawPieces();
});

newImageBtn.addEventListener('click', () => loadNewImage());

loadNewImage();
