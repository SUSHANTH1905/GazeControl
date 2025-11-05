# 🎯 GazeControl - Eye-Controlled Mouse Tracking

A cutting-edge web application that enables hands-free computer control through advanced eye tracking technology. Built with Next.js 15, MediaPipe Face Mesh, and modern web technologies.

## ✨ Features

### 🧠 Advanced Eye Tracking
- **Real-time gaze detection** using MediaPipe Face Mesh with 468 facial landmarks
- **Precise cursor control** with configurable smoothing algorithms
- **WebGL acceleration** for optimal performance

### 👁️ Intelligent Gesture Recognition
- **Blink detection** with Eye Aspect Ratio (EAR) algorithm
- **Dwell-to-click** functionality with customizable timing
- **Scroll control** through eye movements
- **Multi-blink patterns** for different click actions

### 🎨 Modern UI/UX
- **Responsive design** with Tailwind CSS
- **Real-time visualizations** and heatmaps
- **Calibration wizard** for personalized accuracy
- **Gesture history** and performance metrics

### ⚙️ Customizable Settings
- Adjustable sensitivity and thresholds
- Configurable smoothing factors
- Personalized gesture controls
- Session data export capabilities

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ and npm/yarn/bun
- Modern web browser with WebGL support
- Webcam for eye tracking functionality

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/SUSHANTH1905/GazeControl.git
   cd GazeControl
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   yarn install
   # or
   bun install
   ```

3. **Start the development server**
   ```bash
   npm run dev
   # or
   yarn dev
   # or
   bun dev
   ```

4. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 📖 Usage Guide

### 1. Launch the Tracker
- Click **"Launch Tracker"** on the homepage
- Grant camera permissions when prompted
- Wait for the face detection to initialize

### 2. Calibration (Recommended)
- Click **"Calibrate"** for optimal accuracy
- Follow the on-screen calibration points
- This improves tracking precision significantly

### 3. Eye Control Features
- **Move cursor**: Look at different screen areas
- **Left click**: Double-blink quickly
- **Right click**: Triple-blink
- **Scroll**: Look up/down while holding gaze
- **Dwell click**: Stare at a target for 1 second

### 4. Settings Customization
- Adjust **smoothing factor** for cursor stability
- Configure **blink threshold** for your eye type
- Set **scroll sensitivity** for comfortable navigation
- Enable/disable different gesture types

## 🛠️ Technology Stack

### Frontend Framework
- **Next.js 15** - React framework with App Router
- **React 19** - Latest React with concurrent features
- **TypeScript** - Type-safe development

### UI/UX Libraries
- **Tailwind CSS** - Utility-first styling
- **Radix UI** - Accessible component primitives
- **Framer Motion** - Smooth animations
- **Lucide React** - Beautiful icons

### Eye Tracking Core
- **MediaPipe Tasks Vision** - Face landmark detection
- **TensorFlow.js** - Machine learning backend
- **WebGL** - GPU-accelerated processing

### Additional Tools
- **Zod** - Schema validation
- **React Hook Form** - Form management
- **Recharts** - Data visualization

## 📊 Performance Metrics

The application tracks and displays:
- **Total blinks** and **click count**
- **Scroll gestures** performed
- **Session duration** and **accuracy**
- **Average response time**
- **Real-time FPS** monitoring

## 🔧 Configuration Options

### Eye Tracking Settings
```typescript
{
  smoothingFactor: 0.3,      // Cursor smoothness (0-1)
  blinkThreshold: 0.2,       // Blink sensitivity (0-1)
  scrollSensitivity: 1.5,    // Scroll speed multiplier
  dwellTime: 1000,           // Dwell click duration (ms)
  enableDwellClick: false,   // Toggle dwell clicking
  enableBlinkClick: false,   // Toggle blink clicking
  enableScrollGesture: true  // Toggle scroll gestures
}
```

## 🌐 Browser Compatibility

- **Chrome/Edge** (Recommended) - Full feature support
- **Firefox** - Good support with WebGL
- **Safari** - Basic functionality
- **Mobile browsers** - Limited support (desktop recommended)

## 📱 Deployment

### Vercel (Recommended)
1. Connect your GitHub repository to Vercel
2. Deploy with zero configuration
3. Automatic HTTPS and CDN

### Other Platforms
- **Netlify** - Drag & drop deployment
- **Railway** - Container-based hosting
- **Self-hosted** - Docker support available

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for details.

### Development Setup
```bash
# Fork and clone the repository
git clone https://github.com/YOUR_USERNAME/GazeControl.git

# Install dependencies
npm install

# Start development server
npm run dev

# Run tests
npm test

# Build for production
npm run build
```

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **MediaPipe Team** for the amazing face detection API
- **Next.js Team** for the excellent framework
- **Open source community** for all the incredible libraries

## 📞 Support

- **Issues**: [GitHub Issues](https://github.com/SUSHANTH1905/GazeControl/issues)
- **Discussions**: [GitHub Discussions](https://github.com/SUSHANTH1905/GazeControl/discussions)
- **Email**: Your support email here

---

**⭐ Star this repository if you find it helpful!**
