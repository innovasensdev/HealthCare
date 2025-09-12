# Pipecat React Frontend with Advanced Camera Controls

A comprehensive React frontend for your Pipecat application featuring advanced camera controls, real-time video effects, and customizable UI components.

## 🚀 Features

### 🎥 Camera Controls
- **Basic Controls**: Toggle video/audio, adjust resolution, frame rate
- **Advanced Effects**: Brightness, contrast, saturation, blur, exposure, hue, sepia
- **Visual Effects**: Invert colors, grayscale, horizontal flip, grid overlay
- **Background Images**: Upload and apply custom background images
- **Presets**: Quick-apply common effect combinations

### 🎨 User Interface
- **Modern Design**: Material-UI components with dark theme
- **Responsive Layout**: Works on desktop, tablet, and mobile
- **Tabbed Interface**: Organized controls in collapsible sections
- **Real-time Preview**: Instant visual feedback for all settings
- **Status Indicators**: Visual chips showing current settings

### 🔧 Technical Features
- **Real-time Updates**: Camera settings applied instantly
- **Persistent Storage**: Settings saved to localStorage
- **Error Handling**: Comprehensive error management
- **Fullscreen Support**: Toggle fullscreen video mode
- **Grid Overlay**: Rule of thirds grid for better composition

## 📦 Installation & Setup

### 1. Install Dependencies

```bash
npm install
```

### 2. Start the Backend

Make sure your Pipecat backend is running:

```bash
# Terminal 1 - Start the backend
python server.py
```

### 3. Start the React Frontend

```bash
# Terminal 2 - Start the frontend
npm start
```

Or use the convenient startup script:

```bash
# Start both backend and frontend
./start_dev.sh
```

The React app will be available at `http://localhost:3000` and will automatically proxy API calls to your backend at `http://localhost:7860`.

## 🎯 Component Overview

### Main Components

#### `App.js`
- Main application component with state management
- Tabbed interface for different control panels
- Connection management and error handling

#### `VideoCall.js`
- Live video preview with camera feed
- Real-time effect application
- Fullscreen and mute controls
- Grid overlay and background image support

#### `CameraControls.js`
- Basic camera settings (video/audio toggle, resolution, frame rate)
- Real-time sliders for brightness, contrast, saturation
- Visual status indicators

#### `AdvancedCameraControls.js`
- Advanced video effects (blur, exposure, hue, sepia)
- Visual toggles (invert, grayscale, flip, grid)
- Background image upload
- Collapsible sections for organized UI

#### `CameraPresets.js`
- Pre-configured effect combinations
- Quick-apply buttons for common settings
- Visual preset cards with descriptions

#### `ConnectionStatus.js`
- Connect/disconnect to Pipecat backend
- Connection status indicators
- Error display and handling

### Services

#### `pipecatService.js`
- Backend API communication
- Camera settings management
- WebRTC connection handling (placeholder)

#### `useCameraSettings.js` (Hook)
- Camera settings state management
- LocalStorage persistence
- Settings validation and application

## �� Customization Guide

### Adding New Camera Settings

1. **Update the default settings** in `src/hooks/useCameraSettings.js`:

```javascript
const defaultSettings = {
  // ... existing settings
  newEffect: defaultValue,
};
```

2. **Add UI controls** in `src/components/AdvancedCameraControls.js`:

```javascript
<Grid item xs={12} md={4}>
  <Typography gutterBottom>New Effect</Typography>
  <Slider
    value={settings.newEffect}
    onChange={handleSliderChange('newEffect')}
    min={0}
    max={100}
    step={1}
    valueLabelDisplay="auto"
  />
</Grid>
```

3. **Apply the effect** in `src/components/VideoCall.js`:

```javascript
const applyVideoEffects = (stream, settings) => {
  const videoElement = videoRef.current;
  if (videoElement) {
    // Apply your new effect
    videoElement.style.yourNewProperty = settings.newEffect;
  }
};
```

### Adding New Presets

Update `src/components/CameraPresets.js`:

```javascript
const presets = [
  // ... existing presets
  {
    name: 'Your Preset',
    icon: <YourIcon />,
    description: 'Description of your preset',
    settings: {
      brightness: 60,
      contrast: 70,
      // ... other settings
    },
    color: 'primary',
  },
];
```

### Styling Customization

The app uses Material-UI with a custom dark theme. Modify the theme in `src/App.js`:

```javascript
const theme = createTheme({
  palette: {
    mode: 'dark',
    primary: { main: '#667eea' },
    secondary: { main: '#764ba2' },
    // ... customize colors, typography, etc.
  },
});
```

## 🔌 API Integration

The frontend communicates with your Pipecat backend through these endpoints:

- `POST /client/connect` - Connect to the bot
- `GET /client/status` - Get connection status  
- `POST /client/command` - Send custom commands (if implemented)

### Adding New API Endpoints

Extend `src/services/pipecatService.js`:

```javascript
async yourNewMethod(data) {
  try {
    const response = await axios.post(`${this.baseURL}/your-endpoint`, data);
    return response.data;
  } catch (error) {
    console.error('API Error:', error);
    throw error;
  }
}
```

## 🎥 Camera Features Deep Dive

### Resolution Options
- **480p**: 640x480 (low bandwidth)
- **720p**: 1280x720 (balanced)
- **1080p**: 1920x1080 (high quality)
- **4K**: 3840x2160 (ultra high quality)

### Frame Rate Options
- **15 FPS**: Low bandwidth, basic motion
- **24 FPS**: Cinematic look
- **30 FPS**: Standard video quality
- **60 FPS**: Smooth motion, high bandwidth

### Video Effects
- **Brightness**: 0-100% (default: 50%)
- **Contrast**: 0-100% (default: 50%)
- **Saturation**: 0-100% (default: 50%)
- **Blur**: 0-10px (default: 0px)
- **Exposure**: -100% to +100% (default: 0%)
- **Hue**: -180° to +180° (default: 0°)
- **Sepia**: 0-100% (default: 0%)

### Visual Toggles
- **Invert Colors**: Color inversion effect
- **Grayscale**: Black and white conversion
- **Flip Horizontal**: Mirror the video
- **Show Grid**: Rule of thirds overlay
- **Background Image**: Custom background

## 🛠️ Development

### Project Structure

```
src/
├── components/
│   ├── VideoCall.js              # Main video display
│   ├── CameraControls.js         # Basic camera controls
│   ├── AdvancedCameraControls.js # Advanced effects
│   ├── CameraPresets.js          # Effect presets
│   └── ConnectionStatus.js       # Connection management
├── hooks/
│   └── useCameraSettings.js      # Settings state management
├── services/
│   └── pipecatService.js         # Backend communication
├── App.js                        # Main application
├── index.js                      # React entry point
└── index.css                     # Global styles
```

### Available Scripts

- `npm start` - Start development server
- `npm run build` - Create production build
- `npm test` - Run tests
- `npm run eject` - Eject from Create React App

### Browser Compatibility

- Chrome 60+
- Firefox 55+
- Safari 11+
- Edge 79+

## 🐛 Troubleshooting

### Common Issues

#### Camera Not Working
- Ensure you're using HTTPS or localhost (required for camera access)
- Check browser permissions for camera/microphone
- Verify camera isn't being used by another application
- Try refreshing the page

#### Connection Issues
- Ensure backend is running on port 7860
- Check CORS settings in `server.py`
- Verify API endpoints are accessible
- Check browser console for errors

#### Video Quality Issues
- Try different resolution settings
- Check if your camera supports the selected resolution
- Adjust frame rate based on hardware capabilities
- Ensure good lighting conditions

#### Performance Issues
- Lower resolution or frame rate
- Disable unnecessary effects
- Close other applications using the camera
- Check system resources

### Debug Mode

Enable debug logging by adding to `src/services/pipecatService.js`:

```javascript
console.log('Debug: Camera settings updated', settings);
```

## 🚀 Production Deployment

### Build for Production

```bash
npm run build
```

This creates an optimized production build in the `build/` folder.

### Environment Variables

Create `.env` file for production:

```env
REACT_APP_API_URL=https://your-backend-url.com
```

### Docker Deployment

The included `Dockerfile` can be used to containerize the application.

## 📝 License

This project is part of your Pipecat application. Please refer to your main project license.

## 🤝 Contributing

To add new features or fix bugs:

1. Create a new branch
2. Make your changes
3. Test thoroughly
4. Submit a pull request

## �� Support

For issues or questions:
1. Check the troubleshooting section
2. Review browser console for errors
3. Ensure all dependencies are installed
4. Verify backend connectivity

---

**Happy coding with your Pipecat React frontend! 🎉**
