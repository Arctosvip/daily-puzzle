// ТВОЙ Pexels API ключ
const API_KEY = 'ohBGHkYK98TkNJl1mhiI5UDWtU7C0kcZTs2MxuhC1RN6euoImxALAdPF';

const canvas = document.getElementById('puzzleCanvas');
const ctx = canvas.getContext('2d');

const sizeSelect = document.getElementById('sizeSelect');
const newImageBtn = document.getElementById('newImageBtn');

let img = null;
let gridSize = parseInt(sizeSelect.value, 10); // n x n
let pieces = [];
let pieceWidth = 0;
let pieceHeight = 0;
let firstSelection = null;

// Получаем случайное фото с Pexels (по популярному набору)
async function fetchRandomImageUrl() {
  // используем curated/popular, берём случайную страницу и кадр [web:19][web:21]
  const page = Math.floor(Math.random() * 50) + 1;
  const perPage = 30;

  const url = `https://api.pexels.com/v1/curated?page=${page}&per_page=${perPage}`;

  const res = await fetch(url, {
    headers: {
      Authorization: API_KEY
    }
  });

  if (!res.ok) {
    throw new Error('Pexels API error: ' + res.status);
  }

  const data = await res.json();
  const photos = data.photos || [];

  if (!photos.length) {
    throw new Error('No photos returned from Pexels');
  }

  const randomIndex = Math.floor(Math.random() * photos.length);
  const photo = photos[randomIndex];

  // берём landscape / large для нормального качества [web:20]
  return photo.src.landscape || photo.src.large || photo.src.medium;
}

async function loadNewImage() {
  try {
    firstSelection = null;
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const imageUrl = await fetchRandomImageUrl();
    img = new Image();
    img.crossOrigin = 'anonymous';

    img.onload = () => {
      setupCanvasAndPieces();
      drawPieces();
    };

    img.onerror = () => {
      alert('Ошибка загрузки изображения. Попробуй ещё раз.');
    };

    img.src = imageUrl;
  } catch (e) {
    console.error(e);
    alert('Не удалось загрузить картинку из Pexels.');
  }
}

function setupCanvasAndPieces() {
  // подгоняем под холст с сохранением пропорций
  const targetWidth = 600;
  const ratio = img.height / img.width;
  const targetHeight = Math.round(targetWidth * ratio);

  canvas.width = targetWidth;
  canvas.height = targetHeight;

  gridSize = parseInt(sizeSelect.value, 10);

  pieceWidth = canvas.width / gridSize;
  pieceHeight = canvas.height / gridSize;

  // создаём массив кусочков с исходными координатами
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

  // перемешиваем
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
    const dWidth = pieceWidth;
    const dHeight = pieceHeight;

    ctx.drawImage(img, sx, sy, sWidth, sHeight, dx, dy, dWidth, dHeight);
  });

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

  return pieces.find(
    p => p.currentRow === row && p.currentCol === col
  );
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
  return pieces.every(
    p => p.currentRow === p.originalRow && p.currentCol === p.originalCol
  );
}

// Обработка кликов по canvas
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
      setTimeout(() => {
        alert('Готово! Картинка собрана.');
      }, 100);
      return;
    }
  }

  drawPieces();
});

// Смена размера пазла
sizeSelect.addEventListener('change', () => {
  if (!img) return;
  setupCanvasAndPieces();
  drawPieces();
});

// Кнопка "Новая картинка"
newImageBtn.addEventListener('click', () => {
  loadNewImage();
});

// Стартовая загрузка
loadNewImage();