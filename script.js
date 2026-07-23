document.addEventListener('DOMContentLoaded', function() {
    
    // ============================
    // 1. Canvas 地图逻辑 (已优化)
    // ============================
    const canvas = document.getElementById("floorplan");
    
    // 只有当页面上有 canvas 时才执行绘图，防止报错阻断后续代码
    if (canvas) {
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

        // 增加错误处理，如果图片加载失败会在控制台提示
        image.onerror = () => console.error("图片加载失败，请检查路径 img/平面绘制图.jpg");
        
        image.onload = () => {
            ctx.drawImage(image, 0, 0, canvas.width, canvas.height);
        };
        image.src = "img/平面绘制图.jpg";

        // --- 核心交互逻辑 ---

        function getCanvasPoint(clientX, clientY) {
            const rect = canvas.getBoundingClientRect();
            // 动态计算缩放比例，适配手机屏幕
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

        // PC端点击
        canvas.addEventListener("click", (e) => handleTap(e.clientX, e.clientY));
        
        // 移动端触摸
        canvas.addEventListener("touchend", (e) => {
            if (!e.changedTouches || e.changedTouches.length === 0) return;
            const touch = e.changedTouches[0];
            handleTap(touch.clientX, touch.clientY);
        }, { passive: true });
    }


    // ============================
    // 2. 分享与二维码逻辑 (终极修复版)
    // ============================
    const shareBtn = document.getElementById('shareBtn');
    const qrcodeModal = document.getElementById('qrcodeModal');
    const qrcodeClose = document.getElementById('qrcodeClose');
    const qrcodeBox = document.getElementById('qrcode');
    
    // 标记是否已经生成过，避免重复生成
    let isQrGenerated = false;
    // 【新增】防抖锁，防止重复点击导致闪烁
    let isGenerating = false;

    function showQr() {
        // 【新增】如果正在生成或已经生成过，直接返回
        if (isGenerating || isQrGenerated) return;

        isGenerating = true; // 上锁

        // 1. 先显示弹窗
        qrcodeModal.classList.remove('hidden');
        qrcodeModal.setAttribute('aria-hidden', 'false');

        // 2. 只有在第一次打开且未生成时，才执行生成逻辑
        if (!isQrGenerated && typeof QRCode !== 'undefined') {
            
            // 使用 requestAnimationFrame 确保浏览器完成重绘后再执行
            requestAnimationFrame(() => {
                setTimeout(() => {
                    // 彻底清空容器，防止残留
                    qrcodeBox.innerHTML = ''; 
                    
                    try {
                        // 生成二维码
                        new QRCode(qrcodeBox, { 
                            text: window.location.href, 
                            width: 200, 
                            height: 200,
                            colorDark : "#000000",   
                            colorLight : "#ffffff",
                            correctLevel : QRCode.CorrectLevel.H
                        });

                        // 【修复】不再用 JS 隐藏 canvas！
                        // canvas 的隐藏已交给 CSS 处理：
                        // .qrcode-box canvas { display: none !important; }
                        // 这样 canvas 从插入 DOM 的那一刻起就不会被渲染，彻底消除闪烁

                        isQrGenerated = true;
                        isGenerating = false; // 解锁
                    } catch (e) {
                        console.error("二维码生成失败:", e);
                        isGenerating = false; // 出错也要解锁
                    }

                }, 150); // 给浏览器时间完成弹窗布局
            });
        } else {
            // 如果 QRCode 库未加载，允许下次重试
            isGenerating = false;
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