// =============================================
// ۱. انیمیشن شبکه (کانواس)
// =============================================

(function() {
    function getNodeCountByWidth() {
        const width = window.innerWidth;
        if (width < 768) return 35;
        if (width < 1024) return 55;
        return 80;
    }

    const canvas = document.getElementById('networkCanvas');
    if (!canvas) return;

    let ctx = canvas.getContext('2d');
    let width, height;
    let nodes = [];
    let mouseX = -500, mouseY = -500;
    let animationId = null;

    let MAX_DIST = 200;
    let REPULSION_RADIUS = 150;
    let REPULSION_FORCE = 1.2;

    function adjustParamsForDevice() {
        const isMobile = window.innerWidth < 768;
        if (isMobile) {
            MAX_DIST = 150;
            REPULSION_RADIUS = 120;
            REPULSION_FORCE = 0.8;
        } else {
            MAX_DIST = 200;
            REPULSION_RADIUS = 150;
            REPULSION_FORCE = 1.2;
        }
    }

    function resizeCanvas() {
        width = window.innerWidth;
        height = window.innerHeight;
        canvas.width = width;
        canvas.height = height;
        adjustParamsForDevice();
    }

    function initNodes() {
        const nodeCount = getNodeCountByWidth();
        nodes = [];
        const isMobile = window.innerWidth < 768;
        const speedFactor = isMobile ? 0.5 : 0.8;

        for (let i = 0; i < nodeCount; i++) {
            nodes.push({
                x: Math.random() * width,
                y: Math.random() * height,
                vx: (Math.random() - 0.5) * speedFactor,
                vy: (Math.random() - 0.5) * speedFactor,
                radius: 2 + Math.random() * 3,
                baseRadius: 2 + Math.random() * 3
            });
        }
    }

    function initMouseTracking() {
        window.addEventListener('mousemove', (e) => {
            const rect = canvas.getBoundingClientRect();
            mouseX = e.clientX - rect.left;
            mouseY = e.clientY - rect.top;
        });

        window.addEventListener('mouseleave', () => {
            mouseX = -500;
            mouseY = -500;
        });

        canvas.addEventListener('mouseleave', () => {
            mouseX = -500;
            mouseY = -500;
        });

        canvas.addEventListener('touchmove', (e) => {
            if (e.touches.length) {
                const rect = canvas.getBoundingClientRect();
                mouseX = e.touches[0].clientX - rect.left;
                mouseY = e.touches[0].clientY - rect.top;
            }
        });
        canvas.addEventListener('touchend', () => {
            mouseX = -500;
            mouseY = -500;
        });
    }

    function updateNodes() {
        const isMobile = window.innerWidth < 768;

        for (let i = 0; i < nodes.length; i++) {
            const node = nodes[i];

            const dx = node.x - mouseX;
            const dy = node.y - mouseY;
            const distToMouse = Math.sqrt(dx * dx + dy * dy);

            if (distToMouse < REPULSION_RADIUS && distToMouse > 0.1 && mouseX > 0 && mouseX < width && mouseY > 0 && mouseY < height) {
                const angle = Math.atan2(dy, dx);
                const strength = (REPULSION_RADIUS - distToMouse) / REPULSION_RADIUS;
                const force = REPULSION_FORCE * strength;

                node.vx += Math.cos(angle) * force * 0.5;
                node.vy += Math.sin(angle) * force * 0.5;

                node.radius = node.baseRadius + strength * (isMobile ? 2 : 4);
            } else {
                node.radius = node.baseRadius + (node.radius - node.baseRadius) * 0.95;
            }

            const MAX_SPEED = isMobile ? 2 : 3;
            if (Math.abs(node.vx) > MAX_SPEED) node.vx = node.vx > 0 ? MAX_SPEED : -MAX_SPEED;
            if (Math.abs(node.vy) > MAX_SPEED) node.vy = node.vy > 0 ? MAX_SPEED : -MAX_SPEED;

            node.x += node.vx;
            node.y += node.vy;

            node.vx *= 0.99;
            node.vy *= 0.99;

            const margin = 10;
            if (node.x < margin) { node.x = margin; node.vx *= -0.8; }
            if (node.x > width - margin) { node.x = width - margin; node.vx *= -0.8; }
            if (node.y < margin) { node.y = margin; node.vy *= -0.8; }
            if (node.y > height - margin) { node.y = height - margin; node.vy *= -0.8; }
        }
    }

    function closestPointOnLine(px, py, x1, y1, x2, y2) {
        const ax = px - x1;
        const ay = py - y1;
        const bx = x2 - x1;
        const by = y2 - y1;
        const dot = ax * bx + ay * by;
        const len2 = bx * bx + by * by;
        if (len2 === 0) return { x: x1, y: y1 };
        let t = dot / len2;
        t = Math.max(0, Math.min(1, t));
        return { x: x1 + t * bx, y: y1 + t * by };
    }

    function draw() {
        if (!ctx) return;

        const bodyStyles = getComputedStyle(document.body);
        const bgColor = bodyStyles.getPropertyValue('--bg-color').trim() || '#0A0E17';
        ctx.fillStyle = bgColor;
        ctx.fillRect(0, 0, width, height);

        const isMobile = window.innerWidth < 768;
        const maxDist = isMobile ? MAX_DIST * 0.8 : MAX_DIST;

        for (let i = 0; i < nodes.length; i++) {
            for (let j = i + 1; j < nodes.length; j++) {
                const dx = nodes[i].x - nodes[j].x;
                const dy = nodes[i].y - nodes[j].y;
                const dist = Math.sqrt(dx * dx + dy * dy);

                if (dist < maxDist) {
                    let opacity = (1 - dist / maxDist) * (isMobile ? 0.12 : 0.2);

                    if (mouseX > 0 && mouseX < width && mouseY > 0 && mouseY < height) {
                        const closest = closestPointOnLine(mouseX, mouseY, nodes[i].x, nodes[i].y, nodes[j].x, nodes[j].y);
                        const distToMouse = Math.hypot(mouseX - closest.x, mouseY - closest.y);
                        if (distToMouse < 60) {
                            opacity += (1 - distToMouse / 60) * 0.25;
                        }
                    }

                    ctx.beginPath();
                    ctx.moveTo(nodes[i].x, nodes[i].y);
                    ctx.lineTo(nodes[j].x, nodes[j].y);
                    ctx.strokeStyle = `rgba(59, 130, 246, ${Math.min(opacity, 0.4)})`;
                    ctx.lineWidth = isMobile ? 0.8 : 1.2;
                    ctx.stroke();
                }
            }
        }

        for (const node of nodes) {
            let glowOpacity = isMobile ? 0.15 : 0.25;
            if (mouseX > 0 && mouseX < width && mouseY > 0 && mouseY < height) {
                const distToMouse = Math.hypot(node.x - mouseX, node.y - mouseY);
                if (distToMouse < 40) {
                    glowOpacity = isMobile ? 0.5 : 0.7;
                }
            }

            if (glowOpacity > 0.4) {
                ctx.beginPath();
                ctx.arc(node.x, node.y, node.radius + (isMobile ? 2 : 4), 0, Math.PI * 2);
                ctx.fillStyle = `rgba(59, 130, 246, 0.08)`;
                ctx.fill();
            }

            ctx.beginPath();
            ctx.arc(node.x, node.y, node.radius, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(59, 130, 246, ${glowOpacity})`;
            ctx.fill();
        }
    }

    function animate() {
        updateNodes();
        draw();
        animationId = requestAnimationFrame(animate);
    }

    function setup() {
        resizeCanvas();
        initNodes();
        initMouseTracking();
        if (animationId) cancelAnimationFrame(animationId);
        animate();
    }

    window.addEventListener('resize', () => {
        resizeCanvas();
        initNodes();
    });

    setup();
})();


// =============================================
// ۲. شمارنده آمار (با Intersection Observer)
// =============================================

const counters = document.querySelectorAll('.stat-number');
const animateCounter = (counter) => {
    const target = parseInt(counter.getAttribute('data-target'));
    let current = 0;
    const increment = target / 40;
    const update = () => {
        current += increment;
        if (current < target) {
            counter.innerText = Math.ceil(current);
            requestAnimationFrame(update);
        } else {
            counter.innerText = target;
        }
    };
    update();
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            animateCounter(entry.target);
            observer.unobserve(entry.target);
        }
    });
});
counters.forEach(c => observer.observe(c));


// =============================================
// ۳. تم لایت/دارک
// =============================================

const toggleBtn = document.getElementById('themeToggle');
const html = document.documentElement;
const savedTheme = localStorage.getItem('theme');
if (savedTheme === 'light') {
    html.setAttribute('data-theme', 'light');
    toggleBtn.innerHTML = '<i class="fas fa-sun"></i>';
} else {
    html.setAttribute('data-theme', 'dark');
    toggleBtn.innerHTML = '<i class="fas fa-moon"></i>';
}

toggleBtn.addEventListener('click', () => {
    const current = html.getAttribute('data-theme');
    if (current === 'light') {
        html.setAttribute('data-theme', 'dark');
        localStorage.setItem('theme', 'dark');
        toggleBtn.innerHTML = '<i class="fas fa-moon"></i>';
    } else {
        html.setAttribute('data-theme', 'light');
        localStorage.setItem('theme', 'light');
        toggleBtn.innerHTML = '<i class="fas fa-sun"></i>';
    }
});


// =============================================
// ۴. اسکرول نرم
// =============================================

document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) target.scrollIntoView({ behavior: 'smooth' });
    });
});


// =============================================
// ۵. حذف خودکار پیام‌های فرم
// =============================================

document.querySelectorAll('.msg-box').forEach(function(msg) {
    setTimeout(function() {
        msg.style.display = 'none';
    }, 5000);
});