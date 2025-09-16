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
    this.isAudioMuted = false;
    this.isVideoMuted = false;
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
          sampleRate: { ideal: 16000 },
          channelCount: { ideal: 1 },
          echoCancellation: true,
          noiseSuppression: true
        }
      });

      console.log('📹 Got user media:', this.localStream);

      // Create WebRTC connection
      this.webrtcConnection = new RTCPeerConnection({
        iceServers: [{ urls: 'stun:stun.l.google.com:19302' }]
      });

      // Add local tracks to connection
      this.localStream.getTracks().forEach(track => {
        console.log(`📡 Adding ${track.kind} track to WebRTC connection`);
        this.webrtcConnection.addTrack(track, this.localStream);
      });

      // Store audio and video tracks for debugging
      this.audioTrack = this.localStream.getAudioTracks()[0];
      this.videoTrack = this.localStream.getVideoTracks()[0];

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
          this.isConnected = true;
        } else if (state === 'failed') {
          console.error('❌ WebRTC connection failed');
          this.isConnected = false;
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

  // Send text message to bot
  // sendTextMessage(message) {
  //   if (!this.dataChannel || this.dataChannel.readyState !== 'open') {
  //     console.warn('Data channel not ready, queuing message');
  //     // Queue the message for when the channel is ready
  //     setTimeout(() => this.sendTextMessage(message), 100);
  //     return;
  //   }

  //   try {
  //     const messageData = {
  //       type: 'user-text',
  //       text: message,
  //       timestamp: new Date().toISOString()
  //     };
      
  //     console.log('📤 Sending text message to bot:', messageData);
  //     this.dataChannel.send(JSON.stringify(messageData));
  //   } catch (error) {
  //     console.error('❌ Failed to send text message:', error);
  //   }
  // }

  // Send text message to bot - FIXED to prevent infinite loops
sendTextMessage(message) {
  if (!this.dataChannel || this.dataChannel.readyState !== 'open') {
    console.warn('Data channel not ready, dropping message to prevent infinite loops');
    console.error('❌ Cannot send message - data channel not ready:', message);
    return; // ✅ DROP MESSAGE instead of infinite retry
  }

  try {
    const messageData = {
      type: 'user-text',
      text: message,
      timestamp: new Date().toISOString()
    };
    
    console.log('📤 Sending text message to bot:', messageData);
    this.dataChannel.send(JSON.stringify(messageData));
  } catch (error) {
    console.error('❌ Failed to send text message:', error);
  }
}

  // Mute/unmute audio track sent to bot
  toggleAudio() {
    if (this.audioTrack) {
      this.audioTrack.enabled = !this.audioTrack.enabled;
      this.isAudioMuted = !this.audioTrack.enabled;
      console.log(`🔇 Audio ${this.isAudioMuted ? 'muted' : 'unmuted'} - Bot ${this.isAudioMuted ? 'cannot' : 'can'} hear you`);
      return this.isAudioMuted;
    }
    return false;
  }

  // Mute/unmute video track sent to bot
  toggleVideo() {
    if (this.videoTrack) {
      this.videoTrack.enabled = !this.videoTrack.enabled;
      this.isVideoMuted = !this.videoTrack.enabled;
      console.log(`📹 Video ${this.isVideoMuted ? 'muted' : 'unmuted'}`);
      return this.isVideoMuted;
    }
    return false;
  }

  // Set audio mute state
  setAudioMuted(muted) {
    if (this.audioTrack) {
      this.audioTrack.enabled = !muted;
      this.isAudioMuted = muted;
      console.log(`🔇 Audio ${muted ? 'muted' : 'unmuted'} - Bot ${muted ? 'cannot' : 'can'} hear you`);
    }
  }

  // Set video mute state
  setVideoMuted(muted) {
    if (this.videoTrack) {
      this.videoTrack.enabled = !muted;
      this.isVideoMuted = muted;
      console.log(`📹 Video ${muted ? 'muted' : 'unmuted'}`);
    }
  }

  // Get current mute states
  getMuteStates() {
    return {
      audio: this.isAudioMuted,
      video: this.isVideoMuted
    };
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
      this.isAudioMuted = false;
      this.isVideoMuted = false;
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
        trackReadyState: 'disconnected'
      };
    }

    try {
      const stats = await this.webrtcConnection.getStats(this.audioTrack);
      let bytesSent = 0;
      let packetsSent = 0;

      stats.forEach(report => {
        if (report.type === 'outbound-rtp' && report.mediaType === 'audio') {
          bytesSent = report.bytesSent || 0;
          packetsSent = report.packetsSent || 0;
        }
      });

      return {
        bytesSent,
        packetsSent,
        trackEnabled: this.audioTrack.enabled,
        trackReadyState: this.audioTrack.readyState
      };
    } catch (error) {
      console.error('Failed to get audio stats:', error);
      return {
        bytesSent: 0,
        packetsSent: 0,
        trackEnabled: this.audioTrack.enabled,
        trackReadyState: this.audioTrack.readyState
      };
    }
  }
}

export { PipecatService };
