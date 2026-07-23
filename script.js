const canvas = document.getElementById("floorplan");
const ctx = canvas.getContext("2d");
const image = new Image();

const hitAreas = [
  {id: 1, x: 835, y: 510, radius: 80},
  {id: 2, x: 835, y: 320, radius: 80},
  {id: 3, x: 560, y: 320, radius: 80},
  {id: 4, x: 690, y: 90, radius: 90},
  {id: 5, x: 250, y: 90, radius: 90},
  {id: 6, x: 390, y: 320, radius: 80},
  {id: 7, x: 100, y: 320, radius: 80},
  {id: 8, x: 100, y: 510, radius: 80},
];

image.onload = () => {
  ctx.drawImage(image, 0, 0, canvas.width, canvas.height);
};

image.src = "img/平面绘制图.jpg";

function getHitArea(x, y) {
  return hitAreas.find((item) => {
    const dx = x - item.x;
    const dy = y - item.y;
    return dx * dx + dy * dy <= item.radius * item.radius;
  });
}

function getCanvasPoint(clientX, clientY) {
  const rect = canvas.getBoundingClientRect();
  return {
    x: (clientX - rect.left) * (canvas.width / rect.width),
    y: (clientY - rect.top) * (canvas.height / rect.height),
  };
}

function handleCanvasTap(clientX, clientY) {
  const { x, y } = getCanvasPoint(clientX, clientY);
  const hit = getHitArea(x, y);

  if (hit) {
    window.location.href = `page${hit.id}.html`;
  }
}

canvas.addEventListener("click", (event) => {
  handleCanvasTap(event.clientX, event.clientY);
});

canvas.addEventListener("touchstart", (event) => {
  if (event.touches.length > 0) {
    const touch = event.touches[0];
    handleCanvasTap(touch.clientX, touch.clientY);
  }
}, { passive: true });

canvas.addEventListener("mousemove", (event) => {
  const { x, y } = getCanvasPoint(event.clientX, event.clientY);
  const over = Boolean(getHitArea(x, y));
  canvas.style.cursor = over ? "pointer" : "default";
});

canvas.addEventListener("touchmove", (event) => {
  if (event.touches.length > 0) {
    const touch = event.touches[0];
    const { x, y } = getCanvasPoint(touch.clientX, touch.clientY);
    const over = Boolean(getHitArea(x, y));
    canvas.style.cursor = over ? "pointer" : "default";
  }
}, { passive: true });

// 分享与二维码生成
const shareBtn = document.getElementById('shareBtn');
const qrcodeModal = document.getElementById('qrcodeModal');
const qrcodeClose = document.getElementById('qrcodeClose');
const qrcodeBox = document.getElementById('qrcode');
let qrcodeInstance = null;

function showQr() {
  // 清空已有二维码
  qrcodeBox.innerHTML = '';
  const url = window.location.href;
  // 生成二维码
  try {
    qrcodeInstance = new QRCode(qrcodeBox, { text: url, width: 220, height: 220 });
  } catch (e) {
    qrcodeBox.textContent = '无法生成二维码';
  }
  qrcodeModal.classList.remove('hidden');
  qrcodeModal.setAttribute('aria-hidden', 'false');
}

function hideQr() {
  qrcodeModal.classList.add('hidden');
  qrcodeModal.setAttribute('aria-hidden', 'true');
  if (qrcodeInstance && qrcodeBox) {
    qrcodeBox.innerHTML = '';
    qrcodeInstance = null;
  }
}

shareBtn && shareBtn.addEventListener('click', (e) => {
  e.preventDefault();
  showQr();
});

qrcodeClose && qrcodeClose.addEventListener('click', (e) => {
  e.preventDefault();
  hideQr();
});

// 点击遮罩区关闭
qrcodeModal && qrcodeModal.addEventListener('click', (e) => {
  if (e.target === qrcodeModal) hideQr();
});
