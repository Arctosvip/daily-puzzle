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
const topics = ['art-culture', 'architecture-interior', 'nature', 'food-drink'];

async function getRandomImageUrl() {
  try {
    const topic = topics[Math.floor(Math.random() * topics.length)];
        const response = await fetch(`https://api.unsplash.com/photos/random?topics=${topic}&count=1&orientation=landscape`, {
      headers: { Authorization: 'Client-ID q50hZG99HuZIlPqjslhVnFYfKJOUxFdeQ52SZc3rEHo' }    });
    const data = await response.json();
    if (Array.isArray(data) && data.length > 0) {
      const url = data[0].urls.regular;
      if (url && !usedUrls.includes(url)) {
        usedUrls.push(url);
        if (usedUrls.length > 50) usedUrls.shift();
        return url;
      }
    }
  } catch (e) {
    console.error('Unsplash API failed', e);
    alert('Не удалось загрузить изображение. Проверьте VPN.');
    return null;}

function resizeCanvas() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}

function loadNewImage() {
  firstSelection = null;
  loader.classList.add('visible');
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  getRandomImageUrl().then(imageUrl => {
    img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      loader.classList.remove('visible');
      setupCanvasAndPieces();
      drawPieces();
    };
    img.onerror = () => {
      loader.classList.remove('visible');
      loadNewImage();
    };
    img.src = imageUrl;
  });
}

function setupCanvasAndPieces() {
  resizeCanvas();
  gridSize = parseInt(sizeSelect.value, 10);
  
  const canvasAspect = canvas.width / canvas.height;
  const imgAspect = img.naturalWidth / img.naturalHeight;
  
  let drawWidth, drawHeight, offsetX = 0, offsetY = 0;
  
  if (canvasAspect > imgAspect) {
    drawHeight = canvas.height;
    drawWidth = drawHeight * imgAspect;
    offsetX = (canvas.width - drawWidth) / 2;
  } else {
    drawWidth = canvas.width;
    drawHeight = drawWidth / imgAspect;
    offsetY = (canvas.height - drawHeight) / 2;
  }
  
  pieceWidth = drawWidth / gridSize;
  pieceHeight = drawHeight / gridSize;
  
  pieces = [];
  for (let row = 0; row < gridSize; row++) {
    for (let col = 0; col < gridSize; col++) {
      pieces.push({
        originalRow: row,
        originalCol: col,
        currentRow: row,
        currentCol: col,
        offsetX,
        offsetY
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
  ctx.fillStyle = '#000';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  
  pieces.forEach(piece => {
    const sx = (piece.originalCol * img.naturalWidth) / gridSize;
    const sy = (piece.originalRow * img.naturalHeight) / gridSize;
    const sWidth = img.naturalWidth / gridSize;
    const sHeight = img.naturalHeight / gridSize;
    const dx = piece.offsetX + piece.currentCol * pieceWidth;
    const dy = piece.offsetY + piece.currentRow * pieceHeight;
    ctx.drawImage(img, sx, sy, sWidth, sHeight, dx, dy, pieceWidth, pieceHeight);
  });
  
  ctx.strokeStyle = 'rgba(255,255,255,0.2)';
  ctx.lineWidth = 1;
  const offsetX = pieces[0].offsetX;
  const offsetY = pieces[0].offsetY;
  for (let r = 0; r <= gridSize; r++) {
    ctx.beginPath();
    ctx.moveTo(offsetX, offsetY + r * pieceHeight);
    ctx.lineTo(offsetX + gridSize * pieceWidth, offsetY + r * pieceHeight);
    ctx.stroke();
  }
  for (let c = 0; c <= gridSize; c++) {
    ctx.beginPath();
    ctx.moveTo(offsetX + c * pieceWidth, offsetY);
    ctx.lineTo(offsetX + c * pieceWidth, offsetY + gridSize * pieceHeight);
    ctx.stroke();
  }
  
  if (firstSelection) {
    ctx.strokeStyle = '#facc15';
    ctx.lineWidth = 3;
    const fx = firstSelection.offsetX + firstSelection.currentCol * pieceWidth;
    const fy = firstSelection.offsetY + firstSelection.currentRow * pieceHeight;
    ctx.strokeRect(fx + 2, fy + 2, pieceWidth - 4, pieceHeight - 4);
  }
}

function findPieceAt(x, y) {
  const offsetX = pieces[0].offsetX;
  const offsetY = pieces[0].offsetY;
  const relX = x - offsetX;
  const relY = y - offsetY;
  if (relX < 0 || relY < 0) return null;
  const col = Math.floor(relX / pieceWidth);
  const row = Math.floor(relY / pieceHeight);
  if (col >= gridSize || row >= gridSize) return null;
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

function handleTap(clientX, clientY) {
  if (!img) return;
  const clickedPiece = findPieceAt(clientX, clientY);
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
}

canvas.addEventListener('click', e => handleTap(e.clientX, e.clientY));
canvas.addEventListener('touchend', e => {
  e.preventDefault();
  const touch = e.changedTouches[0];
  handleTap(touch.clientX, touch.clientY);
}, { passive: false });

sizeSelect.addEventListener('change', () => {
  if (!img) return;
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
