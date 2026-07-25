document.addEventListener('DOMContentLoaded', function() {
    
    // ============================
    // 1. Canvas 地图逻辑
    // ============================
    const canvas = document.getElementById("floorplan");
    
    if (canvas) {
        const ctx = canvas.getContext("2d");
        const image = new Image();
        const container = canvas.parentElement; // .canvas-container

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

        // ★ 新增：页面初始化时，给容器加上 loading 类，显示骨架屏
        container.classList.add('loading');

        image.onerror = () => {
            console.error("图片加载失败，请检查路径 img/平面绘制图.jpg");
            // ★ 新增：加载失败也要关掉骨架屏，避免一直卡住
            container.classList.remove('loading');
            canvas.classList.add('loaded');
        };
        
        image.onload = () => {
            ctx.drawImage(image, 0, 0, canvas.width, canvas.height);
            // ★ 新增：图片绘制完成后，关掉骨架屏 + 淡入 canvas
            container.classList.remove('loading');
            canvas.classList.add('loaded');
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
// 2. 分享与二维码逻辑 (调试增强版)
// ============================
const shareBtn = document.getElementById('shareBtn');
const qrcodeModal = document.getElementById('qrcodeModal');
const qrcodeClose = document.getElementById('qrcodeClose');
const qrcodeBox = document.getElementById('qrcode');

console.log('🔍 调试信息:', {
    '弹窗元素': qrcodeModal,
    '二维码容器': qrcodeBox,
    'QRCode库': typeof QRCode
});

function showQr() {
    console.log('👉 点击了分享按钮');

    // 【关键修改】如果找不到元素，打印具体是哪个没找到，而不是直接 return
    if (!qrcodeModal) {
        console.error('❌ 错误：找不到 id="qrcodeModal" 的弹窗！请检查 HTML 中是否有该 ID。');
        alert('系统错误：弹窗元素丢失');
        return;
    }
    if (!qrcodeBox) {
        console.error('❌ 错误：找不到 id="qrcode" 的容器！');
        return;
    }

    // 1. 显示弹窗
    qrcodeModal.classList.remove('hidden');
    qrcodeModal.setAttribute('aria-hidden', 'false');
    console.log('✅ 弹窗已显示');

    // 2. 清空旧内容
    qrcodeBox.innerHTML = ''; 

    // 3. 放入"加载中"文字
    const loadingText = document.createElement('div');
    loadingText.className = 'qrcode-loading-text';
    loadingText.innerText = '二维码加载中...';
    loadingText.style.color = '#666'; // 确保文字颜色可见
    qrcodeBox.appendChild(loadingText);
    console.log('✅ "加载中"文字已插入');

    // 4. 生成二维码
    if (typeof QRCode !== 'undefined') {
        try {
            new QRCode(qrcodeBox, { 
                text: window.location.href, 
                width: 200, 
                height: 200,
                colorDark : "#000000",   
                colorLight : "#ffffff",
                correctLevel : QRCode.CorrectLevel.H
            });
            console.log('✅ QRCode 实例已创建');

            // 5. 延迟移除加载文字
            setTimeout(() => {
                if (qrcodeBox.querySelector('img')) {
                    loadingText.remove();
                    console.log('✅ 二维码图片已显示，加载文字已移除');
                } else {
                    console.warn('⚠️ 超时：未检测到 img 标签，可能是 CSS 隐藏了图片');
                }
            }, 500); // 稍微延长一点时间
            
        } catch (e) {
            console.error('❌ QRCode 生成报错:', e);
            loadingText.innerText = '生成出错';
        }
        
    } else {
        console.error("❌ QRCode库未加载");
        loadingText.innerText = '加载失败，请刷新';
        loadingText.style.color = '#ff4d4f';
    }
}

function hideQr() {
    if (qrcodeModal) {
        qrcodeModal.classList.add('hidden');
        qrcodeModal.setAttribute('aria-hidden', 'true');
    }
}

// 绑定事件
if (shareBtn) {
    shareBtn.addEventListener('click', (e) => { 
        e.preventDefault(); 
        showQr(); 
    });
} else {
    console.error('❌ 找不到 id="shareBtn" 的按钮');
}

if (qrcodeClose) qrcodeClose.addEventListener('click', hideQr);
if (qrcodeModal) {
    qrcodeModal.addEventListener('click', (e) => {
        if (e.target === qrcodeModal) hideQr();
    });
}});