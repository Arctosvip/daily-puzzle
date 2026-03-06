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

// Прямые ссылки на красивые фото с Wikimedia Commons
// Доступны в России без VPN
const IMAGES = [
  'https://upload.wikimedia.org/wikipedia/commons/thumb/1/1a/24701-nature-natural-beauty.jpg/1280px-24701-nature-natural-beauty.jpg',
  'https://upload.wikimedia.org/wikipedia/commons/thumb/4/4e/Pleiades_large.jpg/1280px-Pleiades_large.jpg',
  'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a7/Camponotus_flavomarginatus_ant.jpg/1280px-Camponotus_flavomarginatus_ant.jpg',
  'https://upload.wikimedia.org/wikipedia/commons/thumb/4/47/PNG_transparency_demonstration_1.png/1280px-PNG_transparency_demonstration_1.png',
  'https://upload.wikimedia.org/wikipedia/commons/thumb/3/3f/Biome_map_07.svg/1280px-Biome_map_07.svg.png',
  'https://upload.wikimedia.org/wikipedia/commons/thumb/b/b9/Above_Gotham.jpg/1280px-Above_Gotham.jpg',
  'https://upload.wikimedia.org/wikipedia/commons/thumb/0/0c/GoldenGateBridge-001.jpg/1280px-GoldenGateBridge-001.jpg',
  'https://upload.wikimedia.org/wikipedia/commons/thumb/1/10/Empire_State_Building_%28aerial_view%29.jpg/800px-Empire_State_Building_%28aerial_view%29.jpg',
  'https://upload.wikimedia.org/wikipedia/commons/thumb/3/3a/Cat03.jpg/1280px-Cat03.jpg',
  'https://upload.wikimedia.org/wikipedia/commons/thumb/2/26/YellowLabradorLooking_new.jpg/1280px-YellowLabradorLooking_new.jpg',
  'https://upload.wikimedia.org/wikipedia/commons/thumb/4/43/Cute_dog.jpg/1280px-Cute_dog.jpg',
  'https://upload.wikimedia.org/wikipedia/commons/thumb/6/6d/Good_Food_Display_-_NCI_Visuals_Online.jpg/1280px-Good_Food_Display_-_NCI_Visuals_Online.jpg',
  'https://upload.wikimedia.org/wikipedia/commons/thumb/a/ae/Olympic_flag.jpg/1280px-Olympic_flag.jpg',
  'https://upload.wikimedia.org/wikipedia/commons/thumb/e/ec/Mona_Lisa%2C_by_Leonardo_da_Vinci%2C_from_C2RMF_retouched.jpg/800px-Mona_Lisa%2C_by_Leonardo_da_Vinci%2C_from_C2RMF_retouched.jpg',
  'https://upload.wikimedia.org/wikipedia/commons/thumb/e/ea/Van_Gogh_-_Starry_Night_-_Google_Art_Project.jpg/1280px-Van_Gogh_-_Starry_Night_-_Google_Art_Project.jpg',
  'https://upload.wikimedia.org/wikipedia/commons/thumb/5/50/Vd-Orig.png/1280px-Vd-Orig.png',
  'https://upload.wikimedia.org/wikipedia/commons/thumb/8/8e/Marmot-edit1.jpg/1280px-Marmot-edit1.jpg',
  'https://upload.wikimedia.org/wikipedia/commons/thumb/1/1e/Stonehenge.jpg/1280px-Stonehenge.jpg',
  'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a0/Sunset_over_the_sea.jpg/1280px-Sunset_over_the_sea.jpg',
  'https://upload.wikimedia.org/wikipedia/commons/thumb/9/9c/Mus_musculus_-_Thomas_Brown.jpg/1280px-Mus_musculus_-_Thomas_Brown.jpg',
];

let usedIndices = [];

function getRandomImageUrl() {
  if (usedIndices.length >= IMAGES.length) usedIndices = [];
  let idx;
  do { idx = Math.floor(Math.random() * IMAGES.length); }
  while (usedIndices.includes(idx));
  usedIndices.push(idx);
  return IMAGES[idx];
}

function loadNewImage() {
  firstSelection = null;
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  const imageUrl = getRandomImageUrl();
  img = new Image();
  img.crossOrigin = 'anonymous';

  img.onload = () => {
    setupCanvasAndPieces();
    drawPieces();
  };

  img.onerror = () => {
    // Пробуем другую
    loadNewImage();
  };

  img.src = imageUrl;
}

function setupCanvasAndPieces() {
  const targetWidth = Math.min(window.innerWidth - 40, 600);
  const ratio = img.naturalHeight / img.naturalWidth;
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
    const sx = (piece.originalCol * img.naturalWidth) / gridSize;
    const sy = (piece.originalRow * img.naturalHeight) / gridSize;
    const sWidth = img.naturalWidth / gridSize;
    const sHeight = img.naturalHeight / gridSize;
    const dx = piece.currentCol * pieceWidth;
    const dy = piece.currentRow * pieceHeight;
    ctx.drawImage(img, sx, sy, sWidth, sHeight, dx, dy, pieceWidth, pieceHeight);
  });

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

function handleTap(clientX, clientY) {
  if (!img) return;
  const rect = canvas.getBoundingClientRect();
  const x = (clientX - rect.left) * (canvas.width / rect.width);
  const y = (clientY - rect.top) * (canvas.height / rect.height);
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

loadNewImage();
