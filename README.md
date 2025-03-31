# Modern Tetris 2025 🎮

A modern implementation of the classic Tetris game with contemporary UI/UX design, built using HTML5, JavaScript, and Tailwind CSS. Features glass-morphism effects, neon styling, and mobile responsiveness.

![Tetris Screenshot](screenshot.png)

## 🌟 Features

- 🎨 Modern glass-morphism UI design
- 💫 Particle effects and animations
- 🌈 Neon color scheme with glow effects
- 📱 Responsive design for all devices
- 🎯 Touch/swipe controls for mobile
- ⚡ Fast-paced gameplay with combo system
- 💰 Integrated with Google AdSense
- 📊 Modern scoring and level system

## 🚀 Live Demo

Play the game at: [https://your-username.github.io/modern-tetris](https://your-username.github.io/modern-tetris)

## 🎮 How to Play

### Desktop Controls
- ⬅️ Left Arrow: Move piece left
- ➡️ Right Arrow: Move piece right
- ⬇️ Down Arrow: Move piece down
- ⬆️ Up Arrow: Rotate piece
- Space: Hard drop

### Mobile Controls
- Swipe left/right: Move piece
- Swipe down: Move piece down
- Swipe up: Rotate piece
- Tap buttons on screen for movement

## 🛠️ Installation

1. Clone the repository:
```bash
git clone https://github.com/your-username/modern-tetris.git
cd modern-tetris
```

2. Install dependencies:
```bash
npm install
```

3. Run the development server:
```bash
python3 -m http.server 8000
```

4. Open [http://localhost:8000](http://localhost:8000) in your browser

## 📱 Mobile App Conversion

### Using Capacitor

1. Build the project:
```bash
chmod +x build.sh
./build.sh
```

2. Open in native IDEs:
```bash
npx cap open ios     # For iOS (requires Mac)
npx cap open android # For Android
```

## 💰 Monetization

The game is integrated with Google AdSense. To use your own AdSense account:

1. Replace the publisher ID in `index.html`:
```html
<script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=YOUR_PUBLISHER_ID" crossorigin="anonymous"></script>
```

2. Update ad slot IDs in `adsense.config.js`

## 🎨 Customization

### Colors
Modify the color scheme in `index.html`:
```css
:root {
    --neon-blue: #00f2ff;
    --neon-purple: #b300ff;
    --dark-bg: #0a0a0a;
}
```

### Game Settings
Adjust game parameters in `tetris.js`:
```javascript
const BOARD_WIDTH = 10;
const BOARD_HEIGHT = 20;
const BLOCK_SIZE = 30;
```

## 📝 License

MIT License - feel free to use this code for your own projects!

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 🌟 Credits

- Font Awesome for icons
- Google Fonts for typography
- Tailwind CSS for styling

## 📧 Contact

Your Name - [@your_twitter](https://twitter.com/your_twitter)

Project Link: [https://github.com/your-username/modern-tetris](https://github.com/your-username/modern-tetris)