# 🐍 بازی مار | Snake Game

**بازی کلاسیک و نوستالژیک مار – همین حالا در مرورگر بازی کنید!**  
**Classic & nostalgic Snake game – play it right in your browser!**

<p align="center">
  <a href="https://intellsoft.ir" target="_blank"><strong>🌐 intellsoft.ir</strong></a> – 
  ساختهٔ <strong>محمدعلی عباسپور</strong>
</p>

---

## 🇮🇷 فارسی

### 🎮 دربارهٔ بازی
بازی مار یکی از خاطره‌انگیزترین بازی‌های تاریخ است که برای اولین بار در دههٔ ۱۹۷۰ با نام Blockade متولد شد، اما شهرت جهانی آن با تلفن‌های همراه نوکیا در سال ۱۹۹۸ رقم خورد.  
این نسخه، همان حس نوستالژی را با کنترل لمسی، افکت‌های صوتی و ذرات چشمنواز به مرورگر شما آورده است.

### ✨ ویژگی‌ها
- کنترل با کیبورد (کلیدهای جهت‌نما و WASD) و دکمه‌های لمسی
- پشتیبانی از سوایپ روی صفحهٔ بازی در موبایل
- سه سطح سرعت: آسان، متوسط، سخت
- افکت‌های صوتی (خورده شدن غذا، پایان بازی) با قابلیت قطع/وصل صدا
- ذرات و لرزش صفحه هنگام خوردن غذا و پایان بازی
- ذخیرهٔ خودکار وضعیت بازی و بهترین امتیاز در مرورگر
- طراحی واکنش‌گرا و کاملاً مستقل (بدون نیاز به سرور)

### 🛠 تکنولوژی‌ها و روش ساخت
- **HTML5 Canvas** برای رسم گرافیک بازی
- **JavaScript خالص (Vanilla JS)** بدون هیچ کتابخانهٔ خارجی
- **CSS3** برای طراحی رابط کاربری تاریک و نوستالژیک
- **Web Audio API** برای تولید صداهای ۸-بیتی
- کل بازی در یک فایل `index.html` به همراه `script.js` و `style.css` پیاده‌سازی شده است
- منطق بازی کاملاً شیء‌گرا (کلاس‌های `SnakeGame`، `Particle`، `SoundEngine`) نوشته شده و حلقهٔ بازی با `requestAnimationFrame` مدیریت می‌شود

### 🚀 نحوهٔ اجرا
کافیست فایل `index.html` را در مرورگر باز کنید.  
برای انتشار روی سایت، هر سه فایل (`index.html`، `script.js`، `style.css`) را در یک پوشه روی هاست خود قرار دهید.

### 👨‍💻 سازنده و لینک
این بازی با ❤️ توسط **[محمدعلی عباسپور](https://intellsoft.ir)** ساخته شده است.  
🌐 وب‌سایت: **[intellsoft.ir](https://intellsoft.ir)**  
برای مشاهدهٔ سایر پروژه‌ها و ارتباط با سازنده به سایت فوق مراجعه کنید.

---

## 🇬🇧 English

### 🎮 About the Game
Snake is one of the most nostalgic games ever, originally born as *Blockade* in the 1970s, but made globally famous by Nokia mobile phones in 1998.  
This version brings that same retro feeling to your browser with touch controls, sound effects, and eye-catching particles.

### ✨ Features
- Keyboard (arrow keys & WASD) and on-screen touch buttons
- Swipe support on mobile for changing direction
- Three speed levels: Easy, Medium, Hard
- 8-bit style sound effects (eating food, game over) with mute toggle
- Particles and screen shake on eating food & game over
- Auto-save game state and high score in browser's localStorage
- Fully responsive and server‑independent

### 🛠 Technologies & Architecture
- **HTML5 Canvas** for all game rendering
- **Vanilla JavaScript** – no external libraries
- **CSS3** for the dark nostalgic UI
- **Web Audio API** for generating retro sounds
- Entire game code is structured with classes (`SnakeGame`, `Particle`, `SoundEngine`) and the game loop runs via `requestAnimationFrame`
- Just three files: `index.html`, `script.js`, `style.css`

### 🚀 How to Run
Simply open `index.html` in any modern browser.  
To deploy online, upload all three files to your web host.

### 👨‍💻 Creator & Link
Made with ❤️ by **[Mohammad Ali Abbaspour](https://intellsoft.ir)**  
🌐 Website: **[intellsoft.ir](https://intellsoft.ir)**  
Visit the website for more projects and contact.

---

## 📜 تاریخچهٔ کوتاه بازی مار | A Brief History of Snake

**🇮🇷**  
بازی مار برای نخستین بار در سال ۱۹۷۶ با نام *Blockade* توسط شرکت Gremlin Industries عرضه شد. دو بازیکن کنترل مارهایی را در دست داشتند که با حرکت مداوم، ردّی از خود به جا می‌گذاشتند و هدف، گیر انداختن حریف بود.  
اما نقطهٔ عطف این بازی در سال ۱۹۹۸ بود که شرکت نوکیا آن را به‌عنوان بازی پیش‌فرض روی گوشی نوکیا ۶۱۱۰ قرار داد. میلیون‌ها نفر در سراسر جهان ساعت‌ها با همان نمایشگر تک‌رنگ و کنترل سادهٔ کلیدهای ۲-۴-۶-۸ مار را بزرگ‌تر می‌کردند. این بازی به نمادی از دوران طلایی تلفن‌های همراه تبدیل شد و هنوز هم یکی از شناخته‌شده‌ترین بازی‌های تاریخ است.

**🇬🇧**  
Snake first appeared in 1976 as an arcade game called *Blockade* by Gremlin Industries. Two players controlled snakes that left a trail, trying to force the opponent to crash.  
The real breakthrough came in 1998 when Nokia preloaded Snake on the Nokia 6110. Millions worldwide spent hours growing their snake on that monochrome screen using the 2-4-6-8 keys. It became an icon of the golden age of mobile phones and remains one of the most recognized games of all time.

---

⭐ اگر از این بازی لذت بردید، با ستاره دادن به ریپازیتوری از آن حمایت کنید!  
⭐ If you enjoyed this game, give the repo a star to support it!
