document.addEventListener('DOMContentLoaded', function() {
    
    // ============================
    // 1. Canvas 地图逻辑 (保持不变)
    // ============================
    const canvas = document.getElementById("floorplan");
    
    if (canvas) {
        const ctx = canvas.getContext("2d");
        const image = new Image();

        const hitAreas = [
            { id: 1, x: 835, y: 510, radius: 80 },
            { id: 2, x: 835, y: 320, radius: 80 },
            { id: 3, x: 560, y: 320, radius: 80 },
            { id: 4, x: 690, y: 90, radius: 90 },
            { id: 5, x: 250, y: 90, radius: 90 },
            { id: 6, x: 390, y: 320, radius: 80 },
            { id: 7, x: 100, y: 320, radius: 80 },
            { id: 8, x: 100, y: 510, radius: 80 },
        ];

        image.onerror = () => console.error("图片加载失败，请检查路径 img/平面绘制图.jpg");
        
        image.onload = () => {
            ctx.drawImage(image, 0, 0, canvas.width, canvas.height);
        };
        image.src = "img/平面绘制图.jpg";

        function getCanvasPoint(clientX, clientY) {
            const rect = canvas.getBoundingClientRect();
            const scaleX = canvas.width / rect.width;
            const scaleY = canvas.height / rect.height;
            return {
                x: (clientX - rect.left) * scaleX,
                y: (clientY - rect.top) * scaleY,
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
            ctx.fillStyle = "rgba(255, 0, 0, 0.5)";
            ctx.fill();
            ctx.restore();
            setTimeout(() => {
                 ctx.drawImage(image, 0, 0, canvas.width, canvas.height);
            }, 150);
        }

        canvas.addEventListener("click", (e) => handleTap(e.clientX, e.clientY));
        
        canvas.addEventListener("touchend", (e) => {
            if (!e.changedTouches || e.changedTouches.length === 0) return;
            const touch = e.changedTouches[0];
            handleTap(touch.clientX, touch.clientY);
        }, { passive: true });
    }


    // ============================
    // 2. 分享与二维码逻辑 (最终修复版)
    // ============================
    const shareBtn = document.getElementById('shareBtn');
    const qrcodeModal = document.getElementById('qrcodeModal');
    const qrcodeClose = document.getElementById('qrcodeClose');
    const qrcodeBox = document.getElementById('qrcode');
    
    let isQrGenerated = false; 
    let isGenerating = false; // 防抖锁

    function showQr() {
        // 防止重复点击
        if (isGenerating || isQrGenerated) return;
        
        isGenerating = true;

        // 1. 显示弹窗
        qrcodeModal.classList.remove('hidden');
        qrcodeModal.setAttribute('aria-hidden', 'false');

        // 2. 生成二维码
        if (!isQrGenerated && typeof QRCode !== 'undefined') {
            requestAnimationFrame(() => {
                // 关键修复：在生成前彻底清空容器
                // 这能防止 HTML 中残留的旧代码干扰
                qrcodeBox.innerHTML = ''; 
                
                try {
                    new QRCode(qrcodeBox, { 
                        text: window.location.href, 
                        width: 200, 
                        height: 200,
                        colorDark : "#000000",   
                        colorLight : "#ffffff",
                        correctLevel : QRCode.CorrectLevel.H
                    });

                    // 关键修复：不再使用 JS 删除 Canvas
                    // 依赖 CSS 的 display: none 来隐藏 Canvas
                    // 这样浏览器渲染时根本不会去绘制它，彻底消除闪烁
                    isQrGenerated = true;
                    isGenerating = false;
                } catch (e) {
                    console.error("二维码生成失败:", e);
                    isGenerating = false;
                }
            });
        } else {
            isGenerating = false;
        }
    }

    function hideQr() {
        qrcodeModal.classList.add('hidden');
        qrcodeModal.setAttribute('aria-hidden', 'true');
    }

    if (shareBtn) shareBtn.addEventListener('click', (e) => { e.preventDefault(); showQr(); });
    if (qrcodeClose) qrcodeClose.addEventListener('click', hideQr);
    if (qrcodeModal) {
        qrcodeModal.addEventListener('click', (e) => {
            if (e.target === qrcodeModal) hideQr();
        });
    }
});