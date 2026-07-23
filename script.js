document.addEventListener('DOMContentLoaded', function() {

  // ============================
  // 热区交互部分
  // ============================
  const canvas = document.getElementById("floorplan");
  const ctx = canvas.getContext("2d");
  const image = new Image();

  const hitAreas = [
    { id: 1, x: 835, y: 510, radius: 80 },
    { id: 2, x: 835, y: 320, radius: 80 },
    { id: 3, x: 560, y: 320, radius: 80 },
    { id: 4, x: 690, y: 90,  radius: 90 },
    { id: 5, x: 250, y: 90,  radius: 90 },
    { id: 6, x: 390, y: 320, radius: 80 },
    { id: 7, x: 100, y: 320, radius: 80 },
    { id: 8, x: 100, y: 510, radius: 80 },
  ];

  image.onload = () => {
    ctx.drawImage(image, 0, 0, canvas.width, canvas.height);
  };
  image.src = "img/平面绘制图.jpg";

  function getCanvasPoint(clientX, clientY) {
    const rect = canvas.getBoundingClientRect();
    return {
      x: (clientX - rect.left) * (canvas.width / rect.width),
      y: (clientY - rect.top) * (canvas.height / rect.height),
    };
  }

  function getHitArea(x, y) {
    return hitAreas.find((item) => {
      const dx = x - item.x;
      const dy = y - item.y;
      return dx * dx + dy * dy <= item.radius * item.radius;
    });
  }

  function handleTap(clientX, clientY) {
    const { x, y } = getCanvasPoint(clientX, clientY);
    const hit = getHitArea(x, y);

    if (hit) {
      drawClickEffect(hit.x, hit.y);
      setTimeout(() => {
        window.location.href = `page${hit.id}.html`;
      }, 150);
    }
  }

  function drawClickEffect(x, y) {
    ctx.save();
    ctx.beginPath();
    ctx.arc(x, y, 20, 0, Math.PI * 2);
    ctx.fillStyle = "rgba(255, 0, 0, 0.3)";
    ctx.fill();
    ctx.restore();

    setTimeout(() => {
      ctx.drawImage(image, 0, 0, canvas.width, canvas.height);
    }, 150);
  }

  canvas.addEventListener("click", (e) => {
    handleTap(e.clientX, e.clientY);
  });

  canvas.addEventListener("touchend", (e) => {
    if (!e.changedTouches || e.changedTouches.length === 0) return;
    const touch = e.changedTouches[0];
    handleTap(touch.clientX, touch.clientY);
  }, { passive: true });

  canvas.addEventListener("mousemove", (e) => {
    const { x, y } = getCanvasPoint(e.clientX, e.clientY);
    const over = Boolean(getHitArea(x, y));
    canvas.style.cursor = over ? "pointer" : "default";
  });

  // ============================
  // 分享与二维码部分（修复版）
  // ============================
  const shareBtn = document.getElementById('shareBtn');
  const qrcodeModal = document.getElementById('qrcodeModal');
  const qrcodeClose = document.getElementById('qrcodeClose');
  const qrcodeBox = document.getElementById('qrcode');

  function showQr() {
    // 每次打开都清空，防止叠加
    qrcodeBox.innerHTML = '';

    const url = window.location.href;

    if (typeof QRCode !== 'undefined') {
      new QRCode(qrcodeBox, {
        text: url,
        width: 200,
        height: 200,
        colorDark: "#000000",    // ← 改成红色
        colorLight: "#ffffff",
        correctLevel: QRCode.CorrectLevel.H
      });

      // 用 MutationObserver 监听，只保留 img，移除 canvas
      var observer = new MutationObserver(function() {
        var canvasEl = qrcodeBox.querySelector('canvas');
        var imgEl = qrcodeBox.querySelector('img');
        if (imgEl) {
          // img 已生成，清理多余的 canvas
          if (canvasEl) canvasEl.remove();
          observer.disconnect();
        }
      });
      observer.observe(qrcodeBox, { childList: true, subtree: true });

      // 兜底：500ms 后强制清理
      setTimeout(function() {
        observer.disconnect();
        var canvasList = qrcodeBox.querySelectorAll('canvas');
        canvasList.forEach(function(c) { c.remove(); });
      }, 500);

    } else {
      qrcodeBox.textContent = '二维码组件加载失败，请刷新重试';
    }

    qrcodeModal.classList.remove('hidden');
    qrcodeModal.setAttribute('aria-hidden', 'false');
  }

  function hideQr() {
    qrcodeModal.classList.add('hidden');
    qrcodeModal.setAttribute('aria-hidden', 'true');
    setTimeout(() => { qrcodeBox.innerHTML = ''; }, 300);
  }

  if (shareBtn) {
    shareBtn.addEventListener('click', (e) => {
      e.preventDefault();
      showQr();
    });
  }

  if (qrcodeClose) {
    qrcodeClose.addEventListener('click', hideQr);
  }

  if (qrcodeModal) {
    qrcodeModal.addEventListener('click', (e) => {
      if (e.target === qrcodeModal) hideQr();
    });
  }

});