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

// Категории профессиональных фотографий из Wikimedia Commons
const categories = [
  'Featured_pictures_on_Wikimedia_Commons_(landscapes)',
  'Quality_images_of_nature',
  'Featured_pictures_of_mountains',
  'Quality_images_of_seascapes',
  'Featured_pictures_of_forests',
  'Quality_images_of_sunsets',
  'Featured_pictures_of_lakes',
  'Quality_images_of_architecture'
];

async function getRandomImageUrl() {
  try {
    const category = categories[Math.floor(Math.random() * categories.length)];
    
    const response = await fetch(
      `https://commons.wikimedia.org/w/api.php?action=query&format=json&generator=categorymembers&gcmtitle=Category:${category}&gcmlimit=50&prop=imageinfo&iiprop=url&iiurlwidth=1920&origin=*`
    );
    
    const data = await response.json();
    
    if (data.query && data.query.pages) {
      const pages = Object.values(data.query.pages);
      const imagesWithUrls = pages.filter(page => 
        page.imageinfo && 
        page.imageinfo[0] && 
        page.imageinfo[0].thumburl &&
        !usedUrls.includes(page.imageinfo[0].thumburl)
      );
      
      if (imagesWithUrls.length > 0) {
        const randomPage = imagesWithUrls[Math.floor(Math.random() * imagesWithUrls.length)];
        const imageUrl = randomPage.imageinfo[0].thumburl;
        
        usedUrls.push(imageUrl);
        if (usedUrls.length > 50) usedUrls.shift();
        
        return imageUrl;
      } else {
        return getRandomImageUrl();
      }
    }
    
    console.error('No images found');
    return null;
  } catch (error) {
    console.error('Error:', error);
    return null;
  }
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

async function loadNewImage() {
  loader.style.display = 'block';
  
  const imageUrl = await getRandomImageUrl();
  
  if (!imageUrl) {
    loader.style.display = 'none';
    alert('Ошибка загрузки изображения. Попробуйте ещё раз.');
    return;
  }
  
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
    console.error('Image load error');
    loadNewImage();
  };
  
  img.src = imageUrl;
}
