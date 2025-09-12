import { useState, useCallback, useEffect } from 'react';

const defaultSettings = {
  videoEnabled: true,
  audioEnabled: true,
  resolution: '720p',
  frameRate: 30,
  brightness: 50,
  contrast: 50,
  saturation: 50,
};

export const useCameraSettings = (initialSettings = defaultSettings) => {
  const [settings, setSettings] = useState(initialSettings);
  const [isApplying, setIsApplying] = useState(false);

  const updateSettings = useCallback((newSettings) => {
    setSettings(prev => ({ ...prev, ...newSettings }));
  }, []);

  const resetSettings = useCallback(() => {
    setSettings(defaultSettings);
  }, []);

  const applySettings = useCallback(async (newSettings) => {
    setIsApplying(true);
    try {
      // Simulate applying settings (in real app, this would update the video stream)
      await new Promise(resolve => setTimeout(resolve, 100));
      updateSettings(newSettings);
    } catch (error) {
      console.error('Failed to apply camera settings:', error);
    } finally {
      setIsApplying(false);
    }
  }, [updateSettings]);

  // Save settings to localStorage
  useEffect(() => {
    localStorage.setItem('cameraSettings', JSON.stringify(settings));
  }, [settings]);

  // Load settings from localStorage on mount
  useEffect(() => {
    const savedSettings = localStorage.getItem('cameraSettings');
    if (savedSettings) {
      try {
        const parsed = JSON.parse(savedSettings);
        setSettings(prev => ({ ...prev, ...parsed }));
      } catch (error) {
        console.error('Failed to load saved camera settings:', error);
      }
    }
  }, []);

  return {
    settings,
    updateSettings,
    resetSettings,
    applySettings,
    isApplying,
  };
};
