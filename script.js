(function() {
    // =============== ابزارهای کمکی ===============
    function showMessage(msg, isError = false, duration = 3000) {
        const el = document.getElementById('app-message');
        if (!el) return;
        el.textContent = msg;
        el.style.display = 'block';
        el.style.background = isError ? '#e74c3c' : '#27ae60';
        clearTimeout(el._timeout);
        el._timeout = setTimeout(() => el.style.display = 'none', duration);
    }

    // =============== Polyfill برای roundRect (مرورگرهای قدیمی) ===============
    if (!CanvasRenderingContext2D.prototype.roundRect) {
        CanvasRenderingContext2D.prototype.roundRect = function(x, y, w, h, r) {
            if (typeof r === 'number') r = { tl: r, tr: r, br: r, bl: r };
            this.beginPath();
            this.moveTo(x + r.tl, y);
            this.lineTo(x + w - r.tr, y);
            this.quadraticCurveTo(x + w, y, x + w, y + r.tr);
            this.lineTo(x + w, y + h - r.br);
            this.quadraticCurveTo(x + w, y + h, x + w - r.br, y + h);
            this.lineTo(x + r.bl, y + h);
            this.quadraticCurveTo(x, y + h, x, y + h - r.bl);
            this.lineTo(x, y + r.tl);
            this.quadraticCurveTo(x, y, x + r.tl, y);
            this.closePath();
            return this;
        };
    }

    // =============== موتور صدا ===============
    class SoundEngine {
        constructor() {
            this.ctx = null;
            this.initialized = false;
            this.muted = false;
        }
        init() {
            if (this.initialized) return;
            try {
                this.ctx = new (window.AudioContext || window.webkitAudioContext)();
                this.initialized = true;
            } catch(e) { console.warn('Web Audio API در دسترس نیست'); }
        }
        play(freq, type, duration, vol = 0.15, glideTo = null) {
            if (!this.initialized || this.muted) return;
            try {
                const t = this.ctx.currentTime;
                const osc = this.ctx.createOscillator();
                const gain = this.ctx.createGain();
                osc.type = type;
                osc.frequency.setValueAtTime(freq, t);
                if (glideTo) osc.frequency.linearRampToValueAtTime(glideTo, t + duration);
                gain.gain.setValueAtTime(vol, t);
                gain.gain.exponentialRampToValueAtTime(0.001, t + duration);
                osc.connect(gain);
                gain.connect(this.ctx.destination);
                osc.start(t);
                osc.stop(t + duration + 0.05);
            } catch(e) { /* بی‌صدا */ }
        }
        eatSound() { this.play(300, 'square', 0.08, 0.12, 650); }
        gameOverSound() { this.play(200, 'sawtooth', 0.35, 0.18, 60); }
        toggleMute() {
            this.muted = !this.muted;
            const btn = document.getElementById('mute-btn');
            if (btn) btn.textContent = this.muted ? '🔇' : '🔊';
        }
    }
    const sound = new SoundEngine();

    // =============== ذره برای افکت‌ها ===============
    class Particle {
        constructor(x, y, color, size, life) {
            this.x = x;
            this.y = y;
            this.vx = (Math.random() - 0.5) * 3;
            this.vy = (Math.random() - 0.5) * 3 - 1.5;
            this.color = color;
            this.size = size;
            this.life = life;
            this.maxLife = life;
            this.gravity = 0.05;
        }
        update() {
            this.x += this.vx;
            this.y += this.vy;
            this.vy += this.gravity;
            this.life--;
            return this.life > 0;
        }
        draw(ctx) {
            const alpha = this.life / this.maxLife;
            const s = this.size * alpha;
            ctx.save();
            ctx.globalAlpha = alpha;
            ctx.fillStyle = this.color;
            ctx.shadowColor = this.color;
            ctx.shadowBlur = s * 2;
            ctx.beginPath();
            ctx.arc(this.x, this.y, s, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();
        }
    }

    // =============== دریافت شناسه کاربری (بدون وابستگی به بله) ===============
    function getUserId() {
        // استفاده از شناسه یکتا در localStorage (همان dev_user_id قبلی)
        let userId = localStorage.getItem('snake_user_id');
        if (!userId) {
            userId = 'web_' + Math.random().toString(36).substr(2, 10) + Date.now().toString(36);
            localStorage.setItem('snake_user_id', userId);
        }
        return userId;
    }

    // =============== کلاس بازی مار (بدون تغییر نسبت به قبل) ===============
    class SnakeGame {
        constructor() {
            this.gridSize = 20;
            this.cellSize = 25;
            this.canvas = document.getElementById('game-canvas');
            this.ctx = this.canvas.getContext('2d');
            this.snake = [{x:10, y:10}];
            this.direction = 'right';
            this.nextDirection = 'right';
            this.food = null;
            this.score = 0;
            this.bestScore = parseInt(localStorage.getItem('snake_best') || '0');
            this.gameOver = false;
            this.gameLoopId = null;
            this.speed = 150;
            this.moveTimer = 0;
            this.lastTime = 0;
            this.particles = [];
            this.shakeAmount = 0;
            this.scoreEl = document.getElementById('score');
            this.bestEl = document.getElementById('best-score');
            this.gameOverMsg = document.getElementById('game-over-message');
            this.boardWrapper = document.querySelector('.board-wrapper');
            this.resizeCanvas();
            window.addEventListener('resize', () => this.resizeCanvas());
        }

        resizeCanvas() {
            const wrapperWidth = this.boardWrapper.clientWidth;
            const maxSize = Math.min(wrapperWidth - 10, window.innerHeight - 250, 550);
            const minSize = 260;
            const targetSize = Math.max(minSize, Math.floor(maxSize));
            const canvasSize = Math.floor(targetSize / this.gridSize) * this.gridSize;
            this.cellSize = canvasSize / this.gridSize;
            this.canvas.width = canvasSize;
            this.canvas.height = canvasSize;
            this.canvas.style.width = canvasSize + 'px';
            this.canvas.style.height = canvasSize + 'px';
        }

        init(speedLevel = 'medium') {
            this.stopGameLoop();
            this.snake = [{x:10, y:10}];
            this.direction = 'right';
            this.nextDirection = 'right';
            this.score = 0;
            this.gameOver = false;
            this.speed = speedLevel === 'slow' ? 260 : speedLevel === 'fast' ? 130 : 195;
            this.particles = [];
            this.shakeAmount = 0;
            this.placeFood();
            this.updateUI();
            this.gameOverMsg.style.display = 'none';
            this.startGameLoop();
        }

        placeFood() {
            const emptyCells = [];
            for (let x=0; x<this.gridSize; x++) {
                for (let y=0; y<this.gridSize; y++) {
                    if (!this.snake.some(seg => seg.x === x && seg.y === y)) {
                        emptyCells.push({x,y});
                    }
                }
            }
            if (emptyCells.length === 0) {
                this.endGame(true);
                return;
            }
            this.food = emptyCells[Math.floor(Math.random() * emptyCells.length)];
        }

        changeDirection(newDir) {
            const opposites = { up: 'down', down: 'up', left: 'right', right: 'left' };
            if (this.nextDirection !== opposites[newDir]) {
                this.nextDirection = newDir;
            }
        }

        move() {
            if (this.gameOver) return;
            this.direction = this.nextDirection;
            const head = this.snake[0];
            const newHead = {x: head.x, y: head.y};
            switch(this.direction) {
                case 'up': newHead.y--; break;
                case 'down': newHead.y++; break;
                case 'left': newHead.x--; break;
                case 'right': newHead.x++; break;
            }
            if (newHead.x < 0 || newHead.x >= this.gridSize || newHead.y < 0 || newHead.y >= this.gridSize) {
                this.endGame(false);
                return;
            }
            if (this.snake.some(seg => seg.x === newHead.x && seg.y === newHead.y)) {
                this.endGame(false);
                return;
            }
            this.snake.unshift(newHead);
            if (newHead.x === this.food.x && newHead.y === this.food.y) {
                this.score += 10;
                if (this.score > this.bestScore) {
                    this.bestScore = this.score;
                    localStorage.setItem('snake_best', this.bestScore);
                }
                sound.eatSound();
                const fx = this.food.x * this.cellSize + this.cellSize/2;
                const fy = this.food.y * this.cellSize + this.cellSize/2;
                for (let i=0; i<14; i++) {
                    this.particles.push(new Particle(
                        fx, fy,
                        `hsl(${40 + Math.random()*30}, 80%, ${50+Math.random()*30}%)`,
                        2 + Math.random()*4,
                        15 + Math.random()*20
                    ));
                }
                this.placeFood();
            } else {
                this.snake.pop();
            }
            this.updateUI();
            this.saveToLocalStorage();
        }

        endGame(win = false) {
            this.gameOver = true;
            this.stopGameLoop();
            this.shakeAmount = 12;
            if (!win) sound.gameOverSound();
            showMessage(win ? '🎉 شما برنده شدید!' : '💥 بازی تمام شد!', !win);
            this.gameOverMsg.style.display = 'block';
            localStorage.removeItem('snake_state');
        }

        startGameLoop() {
            this.lastTime = performance.now();
            this.moveTimer = 0;
            this.gameLoopId = requestAnimationFrame((t) => this.loop(t));
        }

        stopGameLoop() {
            if (this.gameLoopId) cancelAnimationFrame(this.gameLoopId);
            this.gameLoopId = null;
        }

        loop(timestamp) {
            if (this.gameOver) {
                this.draw(timestamp);
                this.gameLoopId = requestAnimationFrame((t) => this.loop(t));
                return;
            }
            const dt = timestamp - this.lastTime;
            this.lastTime = timestamp;
            if (this.shakeAmount > 0) this.shakeAmount *= 0.85;
            if (this.shakeAmount < 0.1) this.shakeAmount = 0;
            this.particles = this.particles.filter(p => p.update());
            this.moveTimer += dt;
            if (this.moveTimer >= this.speed) {
                this.moveTimer -= this.speed;
                if (this.moveTimer > this.speed * 2) this.moveTimer = 0;
                this.move();
            }
            this.draw(timestamp);
            this.gameLoopId = requestAnimationFrame((t) => this.loop(t));
        }

        draw(timestamp) {
            const ctx = this.ctx;
            const cs = this.cellSize;
            const size = this.gridSize * cs;
            ctx.clearRect(0, 0, size, size);
            let shakeX = 0, shakeY = 0;
            if (this.shakeAmount > 0.1) {
                shakeX = (Math.random() - 0.5) * this.shakeAmount;
                shakeY = (Math.random() - 0.5) * this.shakeAmount;
            }
            ctx.save();
            ctx.translate(shakeX, shakeY);
            for (let y=0; y<this.gridSize; y++) {
                for (let x=0; x<this.gridSize; x++) {
                    ctx.fillStyle = ((x+y)%2 === 0) ? '#1e2a1e' : '#1a251a';
                    ctx.fillRect(x*cs, y*cs, cs, cs);
                    ctx.strokeStyle = 'rgba(255,255,255,0.03)';
                    ctx.strokeRect(x*cs, y*cs, cs, cs);
                }
            }
            if (this.food) this.drawFood(ctx, cs);
            this.drawSnake(ctx, cs);
            this.particles.forEach(p => p.draw(ctx));
            ctx.restore();
            if (this.gameOver) {
                ctx.fillStyle = 'rgba(200,30,30,0.08)';
                ctx.fillRect(0, 0, size, size);
            }
        }

        drawSnake(ctx, cs) {
            const pad = cs * 0.08;
            for (let i = this.snake.length - 1; i >= 0; i--) {
                const seg = this.snake[i];
                const px = seg.x * cs + pad;
                const py = seg.y * cs + pad;
                const s = cs - pad*2;
                const r = cs * 0.22;
                if (i === 0) {
                    ctx.save();
                    ctx.shadowColor = '#66d96a';
                    ctx.shadowBlur = cs * 0.5;
                    ctx.fillStyle = '#66d96a';
                    ctx.beginPath();
                    ctx.roundRect(px, py, s, s, r+2);
                    ctx.fill();
                    ctx.shadowBlur = 0;
                    const eyeR = cs * 0.12;
                    let ex1, ey1, ex2, ey2;
                    const ecx = px + s/2;
                    const ecy = py + s*0.3;
                    switch(this.direction) {
                        case 'right': ex1=ecx+cs*0.18; ex2=ecx+cs*0.18; ey1=ecy-cs*0.14; ey2=ecy+cs*0.14; break;
                        case 'left': ex1=ecx-cs*0.18; ex2=ecx-cs*0.18; ey1=ecy-cs*0.14; ey2=ecy+cs*0.14; break;
                        case 'up': ex1=ecx-cs*0.14; ex2=ecx+cs*0.14; ey1=ecy-cs*0.18; ey2=ecy-cs*0.18; break;
                        case 'down': ex1=ecx-cs*0.14; ex2=ecx+cs*0.14; ey1=ecy+cs*0.18; ey2=ecy+cs*0.18; break;
                    }
                    ctx.fillStyle = '#fff';
                    ctx.beginPath(); ctx.arc(ex1, ey1, eyeR, 0, Math.PI*2); ctx.fill();
                    ctx.beginPath(); ctx.arc(ex2, ey2, eyeR, 0, Math.PI*2); ctx.fill();
                    ctx.fillStyle = '#111';
                    ctx.beginPath(); ctx.arc(ex1, ey1, eyeR*0.5, 0, Math.PI*2); ctx.fill();
                    ctx.beginPath(); ctx.arc(ex2, ey2, eyeR*0.5, 0, Math.PI*2); ctx.fill();
                    ctx.restore();
                } else {
                    const gradient = ctx.createLinearGradient(px, py, px+s, py+s);
                    gradient.addColorStop(0, i%2===0 ? '#4caf50' : '#3e8e41');
                    gradient.addColorStop(1, i%2===0 ? '#3e8e41' : '#4caf50');
                    ctx.fillStyle = gradient;
                    ctx.beginPath();
                    ctx.roundRect(px, py, s, s, r);
                    ctx.fill();
                }
            }
        }

        drawFood(ctx, cs) {
            const fx = this.food.x * cs + cs/2;
            const fy = this.food.y * cs + cs/2;
            const mr = cs * 0.38;
            const bob = Math.sin(Date.now()/500) * cs * 0.1;
            ctx.save();
            ctx.fillStyle = '#f5e6d3';
            ctx.fillRect(fx - cs*0.1, fy - mr*0.1 + bob, cs*0.2, mr*0.7);
            ctx.shadowColor = '#ff9800';
            ctx.shadowBlur = cs * 0.5;
            ctx.fillStyle = '#ff9800';
            ctx.beginPath();
            ctx.arc(fx, fy - mr*0.2 + bob, mr, Math.PI, 0);
            ctx.fill();
            ctx.fillStyle = '#fff';
            ctx.shadowBlur = 0;
            const spots = [[0.25,0.45], [-0.2,0.35], [0.1,0.15], [-0.3,0.25], [0.35,0.3]];
            spots.forEach(([sx, sy]) => {
                ctx.beginPath();
                ctx.arc(fx + sx*mr, fy - mr*0.2 - sy*mr + bob, mr*0.12, 0, Math.PI*2);
                ctx.fill();
            });
            ctx.restore();
        }

        updateUI() {
            this.scoreEl.textContent = this.score;
            this.bestEl.textContent = this.bestScore;
        }

        toJSON() {
            return {
                snake: this.snake,
                direction: this.direction,
                nextDirection: this.nextDirection,
                food: this.food,
                score: this.score,
                gameOver: this.gameOver,
                speed: this.speed
            };
        }

        fromJSON(data) {
            this.snake = data.snake;
            this.direction = data.direction;
            this.nextDirection = data.nextDirection || data.direction;
            this.food = data.food;
            this.score = data.score || 0;
            this.gameOver = data.gameOver || false;
            this.speed = data.speed || 150;
            this.bestScore = parseInt(localStorage.getItem('snake_best') || '0');
            if (!this.gameOver) {
                this.startGameLoop();
            }
            this.updateUI();
        }

        saveToLocalStorage() {
            try {
                if (!this.gameOver) {
                    localStorage.setItem('snake_state', JSON.stringify(this.toJSON()));
                }
            } catch(e){}
        }
    }

    // =============== ذخیره / بازیابی سرور (اختیاری) ===============
    // اگر می‌خواهید همچنان از API استفاده کنید، می‌توانید تابع‌های زیر را فعال کنید
    // اما فعلاً غیرفعال هستند، چون بازی کاملاً روی مرورگر اجرا می‌شود.
    /*
    async function saveToServer(gameState) { ... }
    async function loadFromServer() { ... }
    */

    // =============== نمونه بازی و مدیریت رویدادها ===============
    let game = new SnakeGame();

    async function initializeGame() {
        const localState = localStorage.getItem('snake_state');
        if (localState) {
            try {
                game.fromJSON(JSON.parse(localState));
                document.getElementById('game-over-message').style.display = 'none';
            } catch(e) {
                startNewGame();
            }
            return;
        }
        startNewGame();
    }

    function startNewGame() {
        const speed = document.getElementById('speed-select').value;
        game.init(speed);
        localStorage.removeItem('snake_state');
    }

    function setupEvents() {
        // کیبورد
        document.addEventListener('keydown', (e) => {
            const keyMap = {
                'ArrowUp': 'up', 'ArrowDown': 'down', 'ArrowLeft': 'left', 'ArrowRight': 'right',
                'w': 'up', 's': 'down', 'a': 'left', 'd': 'right',
                'W': 'up', 'S': 'down', 'A': 'left', 'D': 'right'
            };
            const dir = keyMap[e.key];
            if (dir) {
                e.preventDefault();
                game.changeDirection(dir);
            }
        });

        // دکمه‌های لمسی
        document.querySelectorAll('.dir-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                game.changeDirection(btn.dataset.dir);
            });
            btn.addEventListener('touchstart', (e) => {
                e.preventDefault();
                game.changeDirection(btn.dataset.dir);
            });
        });

        // سوایپ روی canvas
        let swipeStart = null;
        const canvas = document.getElementById('game-canvas');
        canvas.addEventListener('touchstart', (e) => {
            e.preventDefault();
            const t = e.touches[0];
            swipeStart = { x: t.clientX, y: t.clientY };
        }, { passive: false });
        canvas.addEventListener('touchend', (e) => {
            if (!swipeStart) return;
            const t = e.changedTouches[0];
            const dx = t.clientX - swipeStart.x;
            const dy = t.clientY - swipeStart.y;
            const minSwipe = 25;
            if (Math.abs(dx) > Math.abs(dy) && Math.abs(dx) > minSwipe) {
                game.changeDirection(dx > 0 ? 'right' : 'left');
            } else if (Math.abs(dy) > Math.abs(dx) && Math.abs(dy) > minSwipe) {
                game.changeDirection(dy > 0 ? 'down' : 'up');
            }
            swipeStart = null;
        });
        canvas.addEventListener('touchmove', (e) => e.preventDefault(), { passive: false });

        // دکمه‌های بازی جدید و شروع دوباره
        document.getElementById('new-game-btn').addEventListener('click', startNewGame);
        document.getElementById('restart-btn').addEventListener('click', startNewGame);
        document.getElementById('speed-select').addEventListener('change', () => {
            if (confirm('با تغییر سرعت، بازی فعلی از دست می‌رود. ادامه می‌دهید؟')) {
                startNewGame();
            }
        });

        // دکمه قطع صدا
        document.getElementById('mute-btn').addEventListener('click', () => {
            sound.init();
            sound.toggleMute();
        });

        window.addEventListener('beforeunload', () => {
            game.saveToLocalStorage();
        });
    }

    // =============== راه‌اندازی اپ ===============
    function startApp() {
        const userId = getUserId();
        console.log('🐍 Snake Web | userId:', userId);
        sound.init();
        setupEvents();
        initializeGame();
    }

    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', startApp);
    else startApp();
})();