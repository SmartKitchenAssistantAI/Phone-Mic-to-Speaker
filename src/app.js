import React, { useState, useRef, useEffect } from 'react';
import './App.css';

function App() {
  const [isActive, setIsActive] = useState(false);
  const [volume, setVolume] = useState(1);
  const [level, setLevel] = useState(0);
  const [status, setStatus] = useState('Ready to connect');
  const [error, setError] = useState(false);

  // Refs for audio processing
  const audioContextRef = useRef(null);
  const micStreamRef = useRef(null);
  const micSourceRef = useRef(null);
  const gainNodeRef = useRef(null);
  const analyserRef = useRef(null);
  const animationFrameRef = useRef(null);

  // Start audio processing
  const startAudio = async () => {
    try {
      // Create audio context
      audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)();
      
      // Get mic access
      micStreamRef.current = await navigator.mediaDevices.getUserMedia({ 
        audio: { 
          echoCancellation: false,
          noiseSuppression: false,
          autoGainControl: false
        } 
      });
      
      // Create audio source from mic
      micSourceRef.current = audioContextRef.current.createMediaStreamSource(micStreamRef.current);
      
      // Create gain node for volume control
      gainNodeRef.current = audioContextRef.current.createGain();
      gainNodeRef.current.gain.value = volume;
      
      // Create analyzer for level meter
      analyserRef.current = audioContextRef.current.createAnalyser();
      analyserRef.current.fftSize = 256;
      
      // Connect nodes: mic -> gain -> analyzer -> output
      micSourceRef.current.connect(gainNodeRef.current);
      gainNodeRef.current.connect(analyserRef.current);
      gainNodeRef.current.connect(audioContextRef.current.destination);
      
      // Start level meter visualization
      updateLevelMeter();
      
      // Update UI
      setIsActive(true);
      setStatus('Microphone active - sending to speaker');
      setError(false);
    } catch (err) {
      console.error('Error accessing microphone:', err);
      setStatus(`Error: ${err.message}`);
      setError(true);
      setIsActive(false);
    }
  };

  // Stop audio processing
  const stopAudio = () => {
    if (micStreamRef.current) {
      micStreamRef.current.getTracks().forEach(track => track.stop());
    }
    
    if (audioContextRef.current) {
      audioContextRef.current.close();
    }
    
    // Cancel animation frame
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
    
    // Reset variables
    audioContextRef.current = null;
    micStreamRef.current = null;
    micSourceRef.current = null;
    gainNodeRef.current = null;
    analyserRef.current = null;
    
    // Update UI
    setIsActive(false);
    setStatus('Ready to connect');
    setError(false);
    setLevel(0);
  };

  // Update level meter based on mic input
  const updateLevelMeter = () => {
    if (!analyserRef.current || !isActive) return;
    
    const bufferLength = analyserRef.current.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);
    
    const draw = () => {
      animationFrameRef.current = requestAnimationFrame(draw);
      
      analyserRef.current.getByteFrequencyData(dataArray);
      
      // Calculate volume level (average of all frequencies)
      let sum = 0;
      for (let i = 0; i < bufferLength; i++) {
        sum += dataArray[i];
      }
      const average = sum / bufferLength;
      
      // Update level meter (0-100%)
      const newLevel = Math.min(100, Math.max(0, average * 100 / 256));
      setLevel(newLevel);
    };
    
    draw();
  };

  // Toggle mic on/off
  const toggleMicrophone = () => {
    if (isActive) {
      stopAudio();
    } else {
      startAudio();
    }
  };

  // Update volume when slider changes
  useEffect(() => {
    if (gainNodeRef.current) {
      gainNodeRef.current.gain.value = volume;
    }
  }, [volume]);

  // Handle page visibility changes
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden && isActive) {
        stopAudio();
        setStatus('Paused - return to this page to resume');
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [isActive]);

  // Clean up on unmount
  useEffect(() => {
    return () => {
      if (isActive) {
        stopAudio();
      }
    };
  }, [isActive]);

  return (
    <div className="container">
      <h1>Phone Mic to Speaker</h1>
      
      <div className={`status ${isActive ? 'connected' : ''} ${error ? 'error' : ''}`}>
        {status}
      </div>
      
      <button 
        className={`mic-button ${isActive ? 'recording' : ''}`} 
        onClick={toggleMicrophone}
      >
        <svg className="mic-icon" viewBox="0 0 24 24">
          <path d="M12,2A3,3 0 0,1 15,5V11A3,3 0 0,1 12,14A3,3 0 0,1 9,11V5A3,3 0 0,1 12,2M19,11C19,14.53 16.39,17.44 13,17.93V21H11V17.93C7.61,17.44 5,14.53 5,11H7A5,5 0 0,0 12,16A5,5 0 0,0 17,11H19Z" />
        </svg>
      </button>
      
      <div className="level-meter">
        <div className="level-fill" style={{ width: `${level}%` }}></div>
      </div>
      
      <div className="volume-control">
        <label htmlFor="volumeSlider">Microphone Volume</label>
        <input 
          type="range" 
          min="0" 
          max="2" 
          step="0.1" 
          value={volume} 
          className="volume-slider" 
          id="volumeSlider" 
          onChange={(e) => setVolume(parseFloat(e.target.value))}
        />
      </div>
      
      <div className="instructions">
        <h3>How to use:</h3>
        <ul>
          <li>Connect your Bluetooth/USB/aux speaker to your device</li>
          <li>Tap the microphone button to start/stop</li>
          <li>Adjust the volume slider as needed</li>
          <li>Your microphone input will play through the connected speaker</li>
        </ul>
      </div>
      
      <footer>
        Note: On mobile devices, this will only work while this page is open and active.
      </footer>
    </div>
  );
}

export default App;