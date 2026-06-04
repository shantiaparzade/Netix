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
        
        // پروژه‌ها
        const projects = [
            { name: "پیکربندی شبکه لابراتوآر آموزشی", desc: " تجهیز و پیکربندی 100 گره ویندوزی و شبکه سازی", tags: [ "راه اندازی"] },
            { name: "عیب یابی سیستم های شرکتی", desc: "بررسی عیوب نرم افزاری و سخت افزاری واحد های فنی، حسابداری و مدیریتی", tags: ["پشتیبانی فنی", "HelpDesk"] },
            { name: "برون سپاری پلتفرم هوشمند طراحی صنایع کارخانجات گرانول", desc: "مشاوره، طراحی سناریو و مذاکره به جهت برون سپاری سامانه مدیریتی", tags: ["DevOps", "برون سپاری" , "خدمات ابری" ,"مشاوره"] },
            // { name: "فایروال نسل جدید", desc: "استقرار NGFW و سیستم امنیتی", tags: ["Fortinet", "NGFW"] },
            // { name: "شبکه بیسیم هوشمند", desc: "Wi-Fi 6 با پوشش کامل", tags: ["Wi-Fi 6", "رومینگ"] },
            // { name: "مشاوره مهاجرت به ابر", desc: "نقشه راه AWS و Azure", tags: ["Cloud", "DevOps"] }
        ];
        
        const grid = document.getElementById('projectsGrid');
        if (grid) {
            projects.forEach(p => {
                const card = document.createElement('div');
                card.className = 'project-card';
                card.innerHTML = `
                    <div class="project-img"><i><div style="width:80px; height:80px;"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 512" width="80" height="80"><defs></defs><g transform="translate(320, 256) rotate(0) scale(1, 1) scale(1) translate(-320, -256)"  ><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 512" width="100%" height="100%" style="opacity: 1;"><defs></defs><path d="M640 143.9v191.8a16 16 0 0 1-16 16h-97.6a63.36 63.36 0 0 0-22.2-37.9L358.6 195.6l26.1-23.9a16 16 0 0 0-21.6-23.6l-27 24.7-53 48.5c-.1.1-.3.1-.4.2-21.1 18.9-46.5 7.8-56.1-2.7a39.69 39.69 0 0 1 2.1-56c.1-.1.2-.3.3-.4l98.3-90a32 32 0 0 1 21.6-8.4h85.9a31.94 31.94 0 0 1 22.6 9.4L512 128h112a16 16 0 0 1 16 15.9z"></path><path d="M0 335.9V144a16 16 0 0 1 16-16h112l54.7-54.6a31.94 31.94 0 0 1 22.6-9.4h83.8l-81.8 74.9a72 72 0 0 0-4.4 101.7c14.9 16.3 61.1 41.5 101.7 4.4l30-27.5 149.3 121.2a32.06 32.06 0 0 1 4.6 45.1l-9.5 11.7a32 32 0 0 1-45 4.7l-5.4-4.4-31.4 38.6a37.16 37.16 0 0 1-52.3 5.4L327 424.3l-.2.2a64 64 0 0 1-90 9.3l-90.5-81.9H16a16 16 0 0 1-16-16z"></path></svg></g></svg></div></i></div>
                    <div class="project-info">
                        <h3>${p.name}</h3>
                        <p>${p.desc}</p>
                        <div style="display:flex; gap:0.5rem; margin-top:1rem; flex-wrap:wrap;">${p.tags.map(t => `<span style="background:rgba(59,130,246,0.15); padding:0.2rem 0.8rem; border-radius:50px; font-size:0.7rem;">${t}</span>`).join('')}</div>
                    </div>
                `;
                grid.appendChild(card);
            });
        }
        
        // شمارنده آمار
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
        
        // تم لایت/دارک
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

        // اسکرول نرم
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', function(e) {
                e.preventDefault();
                const target = document.querySelector(this.getAttribute('href'));
                if (target) target.scrollIntoView({ behavior: 'smooth' });
            });
        });