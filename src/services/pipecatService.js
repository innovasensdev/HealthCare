import axios from 'axios';

class PipecatService {
  constructor() {
    // Connect directly to bot.py WebRTC endpoint
    this.baseURL = 'http://localhost:7860';  // bot.py runs on port 7860
    this.isConnected = false;
    this.webrtcConnection = null;
    this.localStream = null;
    this.remoteStream = null;
    this.isCallActive = false;
    this.onRemoteStream = null;
    this.onConversationUpdate = null;
    this.audioTrack = null;
    this.videoTrack = null;
    this.dataChannel = null;
  }

  async startCall() {
    try {
      if (this.isCallActive) {
        console.log('Call already active');
        return;
      }

      console.log('🚀 Starting WebRTC call with bot.py...');

      // Get user media
      this.localStream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 1280 },
          height: { ideal: 720 },
          frameRate: { ideal: 30 }
        },
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
          sampleRate: { ideal: 16000 },
          channelCount: { ideal: 1 }
        }
      });

      console.log('✅ Got local media stream');

      // Store tracks
      this.audioTrack = this.localStream.getAudioTracks()[0];
      this.videoTrack = this.localStream.getVideoTracks()[0];

      // Create WebRTC connection
      this.webrtcConnection = new RTCPeerConnection({
        iceServers: [
          { urls: 'stun:stun.l.google.com:19302' },
          { urls: 'stun:stun1.l.google.com:19302' }
        ]
      });

      // Add local tracks
      this.localStream.getTracks().forEach(track => {
        console.log(`📡 Adding ${track.kind} track to WebRTC connection`);
        this.webrtcConnection.addTrack(track, this.localStream);
      });

      // Create data channel for conversation messages
      this.dataChannel = this.webrtcConnection.createDataChannel('conversation', {
        ordered: true
      });

      this.dataChannel.onopen = () => {
        console.log('📡 Data channel opened');
      };

      this.dataChannel.onmessage = (event) => {
        try {
          const message = JSON.parse(event.data);
          console.log('📨 Received message from bot:', message);
          
          // Notify components about conversation updates
          if (this.onConversationUpdate) {
            this.onConversationUpdate(message);
          }
        } catch (error) {
          console.warn('Failed to parse message from bot:', error);
        }
      };

      this.dataChannel.onclose = () => {
        console.log('📡 Data channel closed');
      };

      this.dataChannel.onerror = (error) => {
        console.error('📡 Data channel error:', error);
      };

      // Handle remote stream (receives audio/video from bot.py)
      this.webrtcConnection.ontrack = (event) => {
        console.log('🎥 Received remote stream from bot.py:', event.streams[0]);
        this.remoteStream = event.streams[0];
        
        // Notify components about the remote stream
        if (this.onRemoteStream) {
          this.onRemoteStream(this.remoteStream);
        }

        // Log track info
        const audioTracks = this.remoteStream.getAudioTracks();
        const videoTracks = this.remoteStream.getVideoTracks();
        console.log(`📊 Remote stream: ${audioTracks.length} audio, ${videoTracks.length} video tracks`);
      };

      // Handle incoming data channels
      this.webrtcConnection.ondatachannel = (event) => {
        console.log('📡 Received data channel:', event.channel.label);
        const channel = event.channel;
        
        channel.onmessage = (event) => {
          try {
            const message = JSON.parse(event.data);
            console.log('📨 Received message via incoming channel:', message);
            
            if (this.onConversationUpdate) {
              this.onConversationUpdate(message);
            }
          } catch (error) {
            console.warn('Failed to parse incoming message:', error);
          }
        };
      };

      // Handle connection state changes
      this.webrtcConnection.onconnectionstatechange = () => {
        const state = this.webrtcConnection.connectionState;
        console.log('🔗 WebRTC connection state:', state);
        
        if (state === 'connected') {
          console.log('✅ WebRTC connection established!');
        } else if (state === 'failed') {
          console.error('❌ WebRTC connection failed');
        }
      };

      // Create and send offer
      const offer = await this.webrtcConnection.createOffer({
        offerToReceiveAudio: true,
        offerToReceiveVideo: true
      });
      
      await this.webrtcConnection.setLocalDescription(offer);

      console.log('📤 Sending WebRTC offer to bot.py...');

      // Send offer to bot.py
      const response = await axios.post(`${this.baseURL}/api/offer`, {
        sdp: offer.sdp,
        type: offer.type
      });

      console.log('📥 Received answer from bot.py');

      // Set remote description
      await this.webrtcConnection.setRemoteDescription({
        type: response.data.type || 'answer',
        sdp: response.data.sdp
      });

      this.isCallActive = true;
      this.isConnected = true;
      console.log('✅ WebRTC call started successfully!');
      
    } catch (error) {
      console.error('❌ Failed to start call:', error);
      throw error;
    }
  }

  async endCall() {
    try {
      console.log('🛑 Ending WebRTC call...');
      
      if (this.dataChannel) {
        this.dataChannel.close();
        this.dataChannel = null;
      }
      
      if (this.webrtcConnection) {
        this.webrtcConnection.close();
        this.webrtcConnection = null;
      }
      
      if (this.localStream) {
        this.localStream.getTracks().forEach(track => {
          track.stop();
        });
        this.localStream = null;
      }
      
      this.remoteStream = null;
      this.audioTrack = null;
      this.videoTrack = null;
      this.isCallActive = false;
      this.isConnected = false;
      console.log('✅ Call ended successfully');
    } catch (error) {
      console.error('❌ Failed to end call:', error);
    }
  }

  // Method to set callback for remote stream
  setOnRemoteStream(callback) {
    this.onRemoteStream = callback;
  }

  // Method to set callback for conversation updates
  setOnConversationUpdate(callback) {
    this.onConversationUpdate = callback;
  }

  // Getter methods
  getLocalStream() {
    return this.localStream;
  }

  getRemoteStream() {
    return this.remoteStream;
  }

  isConnectedToBot() {
    return this.isConnected;
  }

  isCallInProgress() {
    return this.isCallActive;
  }

  getConnectionState() {
    return this.webrtcConnection ? this.webrtcConnection.connectionState : 'disconnected';
  }

  // Audio stats for debugging
  async getAudioStats() {
    if (!this.webrtcConnection || this.webrtcConnection.connectionState !== 'connected') {
      return {
        bytesSent: 0,
        packetsSent: 0,
        trackEnabled: this.audioTrack ? this.audioTrack.enabled : false,
        trackReadyState: this.audioTrack ? this.audioTrack.readyState : 'disconnected'
      };
    }

    if (!this.audioTrack) {
      return {
        bytesSent: 0,
        packetsSent: 0,
        trackEnabled: false,
        trackReadyState: 'no-track'
      };
    }

    try {
      const stats = await this.webrtcConnection.getStats();
      const audioStats = {
        bytesSent: 0,
        packetsSent: 0,
        trackEnabled: this.audioTrack.enabled,
        trackReadyState: this.audioTrack.readyState
      };

      stats.forEach(report => {
        if (report.type === 'outbound-rtp' && report.mediaType === 'audio') {
          audioStats.bytesSent = report.bytesSent || 0;
          audioStats.packetsSent = report.packetsSent || 0;
        }
      });

      return audioStats;
    } catch (error) {
      console.warn('Failed to get audio stats:', error);
      return {
        bytesSent: 0,
        packetsSent: 0,
        trackEnabled: this.audioTrack ? this.audioTrack.enabled : false,
        trackReadyState: this.audioTrack ? this.audioTrack.readyState : 'error'
      };
    }
  }
}

export { PipecatService };
