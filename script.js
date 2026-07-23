document.addEventListener('DOMContentLoaded', function() {
    
    // ============================
    // 1. 初始化 Canvas 与图片
    // ============================
    const canvas = document.getElementById("floorplan");
    const ctx = canvas.getContext("2d");
    const image = new Image();

    // 这里的坐标是基于 Canvas 原始尺寸 (width="900" height="640") 的
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

    image.onload = () => {
        // 保持图片比例填充 Canvas
        ctx.drawImage(image, 0, 0, canvas.width, canvas.height);
    };
    // 确保路径正确
    image.src = "img/平面绘制图.jpg";

    // ============================
    // 2. 核心交互逻辑 (已优化适配)
    // ============================

    /**
     * 将屏幕上的点击坐标转换为 Canvas 内部的实际坐标
     * 增加了对 canvas 尺寸的实时获取，防止缩放后失效
     */
    function getCanvasPoint(clientX, clientY) {
        const rect = canvas.getBoundingClientRect();
        
        // 获取 Canvas 的原始绘图尺寸 (HTML属性)
        const scaleX = canvas.width / rect.width;
        const scaleY = canvas.height / rect.height;

        return {
            x: (clientX - rect.left) * scaleX,
            y: (clientY - rect.top) * scaleY,
        };
    }

    /**
     * 检测点击位置是否在某个热区内
     */
    function getHitArea(x, y) {
        return hitAreas.find((item) => {
            const dx = x - item.x;
            const dy = y - item.y;
            return dx * dx + dy * dy <= item.radius * item.radius;
        });
    }

    /**
     * 处理点击跳转
     */
    function handleTap(clientX, clientY) {
        const { x, y } = getCanvasPoint(clientX, clientY);
        const hit = getHitArea(x, y);

        if (hit) {
            drawClickEffect(hit.x, hit.y);
            
            // 延迟跳转，让用户看到点击效果
            setTimeout(() => {
                window.location.href = `page${hit.id}.html`;
            }, 150);
        }
    }

    // 简单的点击波纹效果
    function drawClickEffect(x, y) {
        ctx.save();
        ctx.beginPath();
        ctx.arc(x, y, 20, 0, Math.PI * 2);
        ctx.fillStyle = "rgba(255, 0, 0, 0.5)"; // 加深一点颜色以便在手机上看见
        ctx.fill();
        ctx.restore();
        
        setTimeout(() => {
             ctx.drawImage(image, 0, 0, canvas.width, canvas.height);
        }, 150);
    }

    // --- 事件监听 ---

    // PC端点击
    canvas.addEventListener("click", (e) => {
        handleTap(e.clientX, e.clientY);
    });

    // 移动端触摸 (使用 touchend 避免滚动误触)
    canvas.addEventListener("touchend", (e) => {
        if (!e.changedTouches || e.changedTouches.length === 0) return;
        const touch = e.changedTouches[0];
        handleTap(touch.clientX, touch.clientY);
    }, { passive: true });

    // 鼠标悬停 (仅PC)
    canvas.addEventListener("mousemove", (e) => {
        const { x, y } = getCanvasPoint(e.clientX, e.clientY);
        const over = Boolean(getHitArea(x, y));
        canvas.style.cursor = over ? "pointer" : "default";
    });


    // ============================
    // 3. 分享与二维码逻辑 (已修复双码和颜色问题)
    // ============================
    const shareBtn = document.getElementById('shareBtn');
    const qrcodeModal = document.getElementById('qrcodeModal');
    const qrcodeClose = document.getElementById('qrcodeClose');
    const qrcodeBox = document.getElementById('qrcode');
    let qrcodeInstance = null;

    function showQr() {
        qrcodeModal.classList.remove('hidden');
        qrcodeModal.setAttribute('aria-hidden', 'false');

        // 首次打开时生成
        if (!qrcodeInstance && typeof QRCode !== 'undefined') {
            // 先清空，防止重复生成
            qrcodeBox.innerHTML = ''; 
            
            qrcodeInstance = new QRCode(qrcodeBox, { 
                text: window.location.href, 
                width: 200, 
                height: 200,
                colorDark : "#000000", // 改为红色
                colorLight : "#ffffff",
                correctLevel : QRCode.CorrectLevel.H
            });

            // 【关键修复】监听 DOM 变化，一旦生成完立即移除多余的 canvas
            // 这解决了 qrcodejs 库生成两个重叠二维码的问题
            const observer = new MutationObserver(() => {
                const canvasEl = qrcodeBox.querySelector('canvas');
                const imgEl = qrcodeBox.querySelector('img');
                if (canvasEl && imgEl) {
                    canvasEl.remove(); // 删掉 canvas，只留 img
                    observer.disconnect(); // 任务完成，停止监听
                }
            });
            observer.observe(qrcodeBox, { childList: true });
        }
    }

    function hideQr() {
        qrcodeModal.classList.add('hidden');
        qrcodeModal.setAttribute('aria-hidden', 'true');
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