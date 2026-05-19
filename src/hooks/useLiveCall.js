import { useState, useEffect, useRef } from 'react';

export default function useLiveCall(webhookUrl = 'https://n8n.srv1196219.hstgr.cloud/webhook/Live-Call-Agent') {
  const [isCalling, setIsCalling] = useState(false);
  const [callStatus, setCallStatus] = useState('idle'); // 'idle' | 'connecting' | 'connected' | 'error'
  const [isMuted, setIsMuted] = useState(false);
  const [isCameraOn, setIsCameraOn] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  
  // Audio stream and analysis states
  const [audioVolume, setAudioVolume] = useState(0);
  const [isSimulationMode, setIsSimulationMode] = useState(false);
  const [isAgentSpeaking, setIsAgentSpeaking] = useState(false);

  // References to WebRTC, streams, and audio context
  const peerConnectionRef = useRef(null);
  const localStreamRef = useRef(null);
  const cameraStreamRef = useRef(null);
  const audioContextRef = useRef(null);
  const analyserRef = useRef(null);
  const animationFrameRef = useRef(null);

  // Speech Fallback references
  const recognitionRef = useRef(null);
  const fallbackTimeoutRef = useRef(null);

  // Auto-clean up call resources on unmount
  useEffect(() => {
    return () => {
      cleanupResources();
    };
  }, []);

  // Cleanup helper
  const cleanupResources = () => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }
    
    // Stop local mic stream
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach(track => track.stop());
      localStreamRef.current = null;
    }

    // Stop local camera stream
    if (cameraStreamRef.current) {
      cameraStreamRef.current.getTracks().forEach(track => track.stop());
      cameraStreamRef.current = null;
    }

    // Close WebRTC
    if (peerConnectionRef.current) {
      peerConnectionRef.current.close();
      peerConnectionRef.current = null;
    }

    // Close Audio Context
    if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
      audioContextRef.current.close();
      audioContextRef.current = null;
    }

    // Close Speech Synthesis
    if (window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }

    // Close Speech Recognition
    if (recognitionRef.current) {
      try {
        recognitionRef.current.abort();
      } catch (e) {}
      recognitionRef.current = null;
    }

    if (fallbackTimeoutRef.current) {
      clearTimeout(fallbackTimeoutRef.current);
    }
  };

  // Real-time audio analyzer loop
  const startAudioAnalysis = (stream) => {
    try {
      const AudioContextClass = window.AudioContext || window.webkitAudioContext;
      if (!AudioContextClass) return;

      const audioContext = new AudioContextClass();
      audioContextRef.current = audioContext;

      const source = audioContext.createMediaStreamSource(stream);
      const analyser = audioContext.createAnalyser();
      analyser.fftSize = 256;
      source.connect(analyser);
      analyserRef.current = analyser;

      const bufferLength = analyser.frequencyBinCount;
      const dataArray = new Uint8Array(bufferLength);

      const updateVolume = () => {
        if (!analyserRef.current) return;
        analyserRef.current.getByteFrequencyData(dataArray);

        // Calculate average volume amplitude
        let total = 0;
        for (let i = 0; i < bufferLength; i++) {
          total += dataArray[i];
        }
        const average = total / bufferLength;
        
        // Normalize volume (0 - 100 scale)
        const normalizedVol = Math.min(100, Math.round((average / 128) * 100));
        setAudioVolume(normalizedVol);

        animationFrameRef.current = requestAnimationFrame(updateVolume);
      };

      updateVolume();
    } catch (err) {
      console.warn("Failed to initialize audio analysis:", err);
    }
  };

  // Open call screen in an idle state before starting live call connections
  const openCallScreen = () => {
    cleanupResources();
    setIsCalling(true);
    setCallStatus('idle');
    setErrorMessage('');
    setIsSimulationMode(false);
    setIsAgentSpeaking(false);
    setAudioVolume(0);
  };

  // Start the live call (WebRTC and speech recognition fallback)
  const startCall = async (agentName = 'Capra AI Agent') => {
    // Clean up active streams but keep isCalling overlay open
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach(track => track.stop());
      localStreamRef.current = null;
    }
    if (peerConnectionRef.current) {
      peerConnectionRef.current.close();
      peerConnectionRef.current = null;
    }
    if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
      audioContextRef.current.close();
      audioContextRef.current = null;
    }
    if (window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
    if (recognitionRef.current) {
      try {
        recognitionRef.current.abort();
      } catch (e) {}
      recognitionRef.current = null;
    }
    if (fallbackTimeoutRef.current) {
      clearTimeout(fallbackTimeoutRef.current);
    }

    setCallStatus('connecting');
    setErrorMessage('');
    setIsSimulationMode(false);
    setIsAgentSpeaking(false);
    setAudioVolume(0);

    let micStream;
    try {
      // Request mic permission
      micStream = await navigator.mediaDevices.getUserMedia({ audio: true });
      localStreamRef.current = micStream;
      startAudioAnalysis(micStream);
    } catch (err) {
      console.error("Microphone access denied:", err);
      setErrorMessage("Microphone access denied. Please allow microphone permissions.");
      setCallStatus('error');
      return;
    }

    // Set a safety timeout to fall back to speech synthesis/recognition if WebRTC signaling takes too long or fails
    fallbackTimeoutRef.current = setTimeout(() => {
      console.warn("WebRTC signaling timed out. Switching to high-fidelity voice simulation...");
      startSimulationMode(agentName);
    }, 6000);

    try {
      // 1. Initialize Peer Connection
      const pc = new RTCPeerConnection({
        iceServers: [{ urls: 'stun:stun.l.google.com:19302' }]
      });
      peerConnectionRef.current = pc;

      // 2. Add local stream audio track to connection
      micStream.getTracks().forEach(track => {
        pc.addTrack(track, micStream);
      });

      // 3. Set up remote stream listener
      pc.ontrack = (event) => {
        console.log("Remote track received:", event.streams[0]);
        // Cancel fallback timeout since WebRTC connected successfully
        if (fallbackTimeoutRef.current) {
          clearTimeout(fallbackTimeoutRef.current);
          fallbackTimeoutRef.current = null;
        }
        setCallStatus('connected');
        
        // Play remote audio
        const remoteStream = event.streams[0];
        const audio = new Audio();
        audio.srcObject = remoteStream;
        audio.play().catch(e => console.warn("Failed to auto-play remote audio:", e));
      };

      // 4. Generate local SDP Offer
      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);

      // 5. Wait for ICE gathering to complete (Vanilla ICE)
      await new Promise((resolve) => {
        if (pc.iceGatheringState === 'complete') {
          resolve();
        } else {
          const checkState = () => {
            if (pc.iceGatheringState === 'complete') {
              pc.removeEventListener('icegatheringstatechange', checkState);
              resolve();
            }
          };
          pc.addEventListener('icegatheringstatechange', checkState);
          // Safety timeout for ICE gathering
          setTimeout(resolve, 1500);
        }
      });

      // 6. POST the SDP offer to the n8n Webhook
      const response = await fetch(webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sdp: pc.localDescription?.sdp,
          type: pc.localDescription?.type,
          agent: agentName,
          timestamp: new Date().toISOString()
        })
      });

      if (!response.ok) {
        throw new Error("Webhook returned a non-OK response code.");
      }

      const data = await response.json();

      // Check if response contains SDP answer for WebRTC
      if (data && (data.sdp || (data.body && JSON.parse(data.body).sdp))) {
        const sdpAnswer = data.sdp || JSON.parse(data.body).sdp;
        const sdpType = data.type || JSON.parse(data.body).type || 'answer';

        await pc.setRemoteDescription(new RTCSessionDescription({
          sdp: sdpAnswer,
          type: sdpType
        }));
        
        // Clear timeout and complete connection
        if (fallbackTimeoutRef.current) {
          clearTimeout(fallbackTimeoutRef.current);
          fallbackTimeoutRef.current = null;
        }
        setCallStatus('connected');
      } else {
        // Response succeeded but no SDP answer found (common when backend is a mock webhook recording POSTs)
        throw new Error("No WebRTC SDP offer negotiation returned from n8n backend.");
      }

    } catch (err) {
      console.warn("WebRTC connection failed. Proceeding with voice simulation fallback:", err.message);
      if (fallbackTimeoutRef.current) {
        clearTimeout(fallbackTimeoutRef.current);
        fallbackTimeoutRef.current = null;
      }
      startSimulationMode(agentName);
    }
  };

  // End the live call
  const endCall = () => {
    cleanupResources();
    setIsCalling(false);
    setCallStatus('idle');
    setIsCameraOn(false);
  };

  // Toggle local mic mute
  const toggleMute = () => {
    if (localStreamRef.current) {
      const audioTrack = localStreamRef.current.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
        setIsMuted(!audioTrack.enabled);
      }
    } else {
      setIsMuted(!isMuted);
    }
  };

  // Toggle local camera stream for the premium overlay video preview
  const toggleCamera = async () => {
    if (isCameraOn) {
      // Turn camera off
      if (cameraStreamRef.current) {
        cameraStreamRef.current.getTracks().forEach(track => track.stop());
        cameraStreamRef.current = null;
      }
      setIsCameraOn(false);
    } else {
      // Turn camera on
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        cameraStreamRef.current = stream;
        setIsCameraOn(true);
      } catch (err) {
        console.error("Camera access denied:", err);
        alert("Camera access denied. Please enable camera permissions.");
      }
    }
  };

  // Simulation Fallback: Speech Recognition + Voice Synthesis
  const startSimulationMode = (agentName) => {
    setIsSimulationMode(true);
    setCallStatus('connected');
    
    // 1. Greet the user via Speech Synthesis
    const greetingText = `Hello! I am your ${agentName}. I've established a secure voice line. How can I help you today?`;
    speakAgentText(greetingText);
  };

  // Speech synthesis speaker
  const speakAgentText = (text) => {
    if (!window.speechSynthesis) return;

    // Terminate any ongoing speech
    window.speechSynthesis.cancel();
    setIsAgentSpeaking(true);

    const utterance = new SpeechSynthesisUtterance(text);
    
    // Choose premium or standard voice
    const voices = window.speechSynthesis.getVoices();
    // Prefer higher quality sounding English voices
    const selectedVoice = voices.find(v => 
      v.lang.startsWith('en') && 
      (v.name.includes('Google') || v.name.includes('Natural') || v.name.includes('Samantha') || v.name.includes('Microsoft Zira'))
    ) || voices[0];
    
    if (selectedVoice) {
      utterance.voice = selectedVoice;
    }

    // Set voice characteristics
    utterance.rate = 1.0;
    utterance.pitch = 1.0;

    // Dynamic amplitude generation to bounce the visualizer rings while speaking!
    let speakAnimInterval;
    utterance.onstart = () => {
      speakAnimInterval = setInterval(() => {
        // Random bouncing values simulating spoken audio spectrum
        setAudioVolume(Math.floor(Math.random() * 60) + 30);
      }, 80);
    };

    utterance.onend = () => {
      clearInterval(speakAnimInterval);
      setAudioVolume(0);
      setIsAgentSpeaking(false);
      // Start listening to the user speaking
      startSpeechRecognition();
    };

    utterance.onerror = () => {
      clearInterval(speakAnimInterval);
      setAudioVolume(0);
      setIsAgentSpeaking(false);
      startSpeechRecognition();
    };

    window.speechSynthesis.speak(utterance);
  };

  // Speech Recognition listener
  const startSpeechRecognition = () => {
    if (isAgentSpeaking || !isCalling) return;

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      console.warn("Speech Recognition not supported in this browser.");
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognitionRef.current = recognition;
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = 'en-US';

      recognition.onstart = () => {
        console.log("Listening to user voice...");
      };

      recognition.onresult = async (event) => {
        const transcript = event.results[0][0].transcript;
        console.log("User Spoke:", transcript);

        if (transcript.trim()) {
          // Pause recognition and fetch answer from webhook
          recognition.stop();
          
          try {
            setCallStatus('connecting'); // show connecting while fetching response
            
            const response = await fetch(webhookUrl, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                input: transcript,
                type: 'voice_simulation',
                timestamp: new Date().toISOString()
              })
            });

            let replyText = "I processed your request, how else can I assist you?";
            if (response.ok) {
              const resData = await response.json();
              // Parse potential n8n chatbot outputs
              replyText = resData.output || resData.text || resData.message || (Array.isArray(resData) ? (resData[0]?.output || resData[0]?.text) : '') || JSON.stringify(resData);
              if (typeof replyText !== 'string' || replyText.startsWith('{')) {
                replyText = "I received your message. Let's work together to resolve it.";
              }
            }

            setCallStatus('connected');
            speakAgentText(replyText);
          } catch (e) {
            console.error("Failed to query webhook in simulation:", e);
            setCallStatus('connected');
            speakAgentText("I'm sorry, I had trouble connecting to my cognitive system. Please repeat that.");
          }
        }
      };

      recognition.onerror = (e) => {
        if (e.error !== 'no-speech') {
          console.warn("Speech recognition error:", e.error);
        }
      };

      recognition.onend = () => {
        // Restart listening if the call is still active and agent is not speaking
        if (isCalling && !isAgentSpeaking && callStatus === 'connected') {
          setTimeout(() => {
            if (isCalling && !isAgentSpeaking) {
              try {
                recognition.start();
              } catch (err) {}
            }
          }, 300);
        }
      };

      recognition.start();
    } catch (err) {
      console.warn("Failed to start speech recognition:", err);
    }
  };

  return {
    isCalling,
    callStatus,
    isMuted,
    isCameraOn,
    errorMessage,
    audioVolume,
    isSimulationMode,
    isAgentSpeaking,
    cameraStream: cameraStreamRef.current,
    analyser: analyserRef.current,
    openCallScreen,
    startCall,
    endCall,
    toggleMute,
    toggleCamera
  };
}
