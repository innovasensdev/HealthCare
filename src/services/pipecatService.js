import axios from 'axios';

class PipecatService {
  constructor() {
    // Use relative URLs in dev so CRA proxy forwards to backend (avoids CORS)
    // Set REACT_APP_API_URL in production to call the deployed backend directly
    this.baseURL = process.env.REACT_APP_API_URL || '';
    this.isConnected = false;
    this.sessionData = null;
  }

  async connect() {
    try {
      const response = await axios.post(`${this.baseURL}/client/connect`);
      this.sessionData = response.data;
      this.isConnected = true;
      
      // Here you would typically establish WebRTC connection
      // For now, we'll just simulate the connection
      console.log('Connected to Pipecat:', this.sessionData);
      
      return this.sessionData;
    } catch (error) {
      console.error('Failed to connect to Pipecat:', error);
      throw new Error(`Connection failed: ${error.response?.data?.detail || error.message}`);
    }
  }

  disconnect() {
    this.isConnected = false;
    this.sessionData = null;
    console.log('Disconnected from Pipecat');
  }

  async getStatus() {
    try {
      const response = await axios.get(`${this.baseURL}/client/status`);
      return response.data;
    } catch (error) {
      console.error('Failed to get status:', error);
      throw error;
    }
  }

  updateCameraSettings(settings) {
    // This method would be used to send camera settings to the backend
    // For now, we'll just log the settings
    console.log('Updating camera settings:', settings);
    
    // In a real implementation, you would:
    // 1. Send settings to the backend
    // 2. Apply constraints to the media stream
    // 3. Update the video element properties
    
    return settings;
  }

  // Method to send custom commands to the bot
  async sendCommand(command, data = {}) {
    if (!this.isConnected) {
      throw new Error('Not connected to Pipecat');
    }
    
    try {
      // This would be a custom endpoint for sending commands
      const response = await axios.post(`${this.baseURL}/client/command`, {
        command,
        data,
      });
      return response.data;
    } catch (error) {
      console.error('Failed to send command:', error);
      throw error;
    }
  }

  // Method to get current video stream constraints
  getVideoConstraints(settings) {
    const resolutionMap = {
      '480p': { width: 640, height: 480 },
      '720p': { width: 1280, height: 720 },
      '1080p': { width: 1920, height: 1080 },
    };

    return {
      video: {
        enabled: settings.videoEnabled,
        ...resolutionMap[settings.resolution],
        frameRate: settings.frameRate,
        // Additional constraints for video quality
        facingMode: 'user',
        aspectRatio: 16/9,
      },
      audio: {
        enabled: settings.audioEnabled,
        echoCancellation: true,
        noiseSuppression: true,
        autoGainControl: true,
      },
    };
  }
}

export { PipecatService };
