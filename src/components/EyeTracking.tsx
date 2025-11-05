"use client";

import { useEffect, useRef, useState } from 'react';
import { FaceLandmarker, FilesetResolver, FaceLandmarkerResult } from '@mediapipe/tasks-vision';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Eye, EyeOff, Circle, Video, VideoOff, Target, Crosshair } from 'lucide-react';

interface EyeTrackingProps {
  onGazeUpdate?: (x: number, y: number) => void;
  onBlink?: () => void;
  onScroll?: (direction: 'up' | 'down') => void;
  onGesture?: (gesture: any) => void;
  settings: {
    smoothingFactor: number;
    blinkThreshold: number;
    scrollSensitivity: number;
    dwellTime: number;
    enableDwellClick?: boolean;
    enableBlinkClick?: boolean;
  };
}

interface HeatPoint {
  x: number;
  y: number;
  intensity: number;
  timestamp: number;
}

export default function EyeTracking({ onGazeUpdate, onBlink, onScroll, onGesture, settings }: EyeTrackingProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const heatmapCanvasRef = useRef<HTMLCanvasElement>(null);
  const [faceLandmarker, setFaceLandmarker] = useState<FaceLandmarker | null>(null);
  const [isTracking, setIsTracking] = useState(false);
  const [isVideoReady, setIsVideoReady] = useState(false);
  const [gazePosition, setGazePosition] = useState({ x: 0, y: 0 });
  const [blinkCount, setBlinkCount] = useState(0);
  const [clickCount, setClickCount] = useState(0);
  const [status, setStatus] = useState<'idle' | 'loading' | 'ready' | 'tracking' | 'error'>('idle');
  const [fps, setFps] = useState(0);
  const [dwellProgress, setDwellProgress] = useState(0);
  const [showHeatmap, setShowHeatmap] = useState(false);
  
  const previousEyeState = useRef({ left: true, right: true });
  const smoothedGaze = useRef({ x: 0, y: 0 });
  const animationFrameId = useRef<number>();
  const lastBlinkTime = useRef(0);
  const blinkSequence = useRef<number[]>([]);
  const dwellStartTime = useRef<number | null>(null);
  const dwellPosition = useRef<{ x: number; y: number } | null>(null);
  const heatPoints = useRef<HeatPoint[]>([]);
  const fpsCounter = useRef({ frames: 0, lastTime: Date.now() });
  const scrollBaseline = useRef<number | null>(null);
  const performanceMetrics = useRef({ latency: 0, accuracy: 0, sessionStart: Date.now() });

  // Initialize MediaPipe Face Landmarker
  useEffect(() => {
    const initializeFaceLandmarker = async () => {
      try {
        setStatus('loading');
        const filesetResolver = await FilesetResolver.forVisionTasks(
          "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.3/wasm"
        );
        
        const landmarker = await FaceLandmarker.createFromOptions(filesetResolver, {
          baseOptions: {
            modelAssetPath: `https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task`,
            delegate: "GPU"
          },
          outputFaceBlendshapes: true,
          runningMode: "VIDEO",
          numFaces: 1
        });
        
        setFaceLandmarker(landmarker);
        setStatus('ready');
      } catch (error) {
        console.error('Error initializing Face Landmarker:', error);
        setStatus('error');
      }
    };

    initializeFaceLandmarker();

    return () => {
      if (faceLandmarker) {
        faceLandmarker.close();
      }
    };
  }, []);

  // Start webcam
  const startWebcam = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: 1280, height: 720 }
      });
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.addEventListener('loadeddata', () => {
          setIsVideoReady(true);
        });
      }
    } catch (error) {
      console.error('Error accessing webcam:', error);
      setStatus('error');
    }
  };

  // Stop webcam
  const stopWebcam = () => {
    if (videoRef.current?.srcObject) {
      const tracks = (videoRef.current.srcObject as MediaStream).getTracks();
      tracks.forEach(track => track.stop());
      videoRef.current.srcObject = null;
    }
    setIsVideoReady(false);
  };

  // Calculate eye aspect ratio for blink detection
  const calculateEAR = (landmarks: any[], indices: number[]) => {
    const p1 = landmarks[indices[0]];
    const p2 = landmarks[indices[1]];
    const p3 = landmarks[indices[2]];
    const p4 = landmarks[indices[3]];
    const p5 = landmarks[indices[4]];
    const p6 = landmarks[indices[5]];

    const vertical1 = Math.sqrt(Math.pow(p2.x - p6.x, 2) + Math.pow(p2.y - p6.y, 2));
    const vertical2 = Math.sqrt(Math.pow(p3.x - p5.x, 2) + Math.pow(p3.y - p5.y, 2));
    const horizontal = Math.sqrt(Math.pow(p1.x - p4.x, 2) + Math.pow(p1.y - p4.y, 2));

    return (vertical1 + vertical2) / (2.0 * horizontal);
  };

  // Handle click gestures based on blink patterns
  const handleBlinkGesture = () => {
    const now = Date.now();
    blinkSequence.current.push(now);
    
    // Keep only recent blinks (within 1 second)
    blinkSequence.current = blinkSequence.current.filter(time => now - time < 1000);
    
    if (settings.enableBlinkClick) {
      if (blinkSequence.current.length === 2 && now - blinkSequence.current[0] < 350) {
        // Double blink = left click
        setClickCount(prev => prev + 1);
        onGesture?.({
          type: 'click',
          action: 'left',
          position: gazePosition,
          timestamp: now
        });
        blinkSequence.current = [];
      } else if (blinkSequence.current.length === 3 && now - blinkSequence.current[0] < 600) {
        // Triple blink = right click
        onGesture?.({
          type: 'click',
          action: 'right',
          position: gazePosition,
          timestamp: now
        });
        blinkSequence.current = [];
      }
    }
  };

  // Handle dwell-to-click
  const handleDwellClick = (currentX: number, currentY: number) => {
    if (!settings.enableDwellClick) {
      dwellStartTime.current = null;
      dwellPosition.current = null;
      setDwellProgress(0);
      return;
    }

    const now = Date.now();
    
    if (!dwellPosition.current) {
      dwellPosition.current = { x: currentX, y: currentY };
      dwellStartTime.current = now;
      return;
    }

    // Check if gaze has moved significantly
    const distance = Math.sqrt(
      Math.pow(currentX - dwellPosition.current.x, 2) + 
      Math.pow(currentY - dwellPosition.current.y, 2)
    );

    if (distance > 50) {
      // Reset dwell if moved too far
      dwellPosition.current = { x: currentX, y: currentY };
      dwellStartTime.current = now;
      setDwellProgress(0);
      return;
    }

    // Calculate progress
    const elapsed = now - (dwellStartTime.current || now);
    const progress = Math.min((elapsed / settings.dwellTime) * 100, 100);
    setDwellProgress(progress);

    // Trigger click when dwell time reached
    if (progress >= 100 && dwellStartTime.current) {
      setClickCount(prev => prev + 1);
      onGesture?.({
        type: 'dwell-click',
        action: 'left',
        position: { x: currentX, y: currentY },
        timestamp: now
      });
      dwellStartTime.current = null;
      dwellPosition.current = null;
      setDwellProgress(0);
    }
  };

  // Add point to heatmap
  const addHeatPoint = (x: number, y: number) => {
    heatPoints.current.push({
      x,
      y,
      intensity: 1,
      timestamp: Date.now()
    });

    // Keep only recent points (last 30 seconds)
    const cutoff = Date.now() - 30000;
    heatPoints.current = heatPoints.current.filter(p => p.timestamp > cutoff);
  };

  // Draw heatmap
  const drawHeatmap = () => {
    const canvas = heatmapCanvasRef.current;
    if (!canvas || !showHeatmap) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw heat points with gradient
    heatPoints.current.forEach(point => {
      const age = Date.now() - point.timestamp;
      const alpha = Math.max(0, 1 - age / 30000);
      
      const gradient = ctx.createRadialGradient(point.x, point.y, 0, point.x, point.y, 40);
      gradient.addColorStop(0, `rgba(255, 0, 0, ${alpha * 0.8})`);
      gradient.addColorStop(0.5, `rgba(255, 255, 0, ${alpha * 0.4})`);
      gradient.addColorStop(1, `rgba(255, 255, 0, 0)`);
      
      ctx.fillStyle = gradient;
      ctx.fillRect(point.x - 40, point.y - 40, 80, 80);
    });
  };

  // Process face landmarks
  const processLandmarks = (result: FaceLandmarkerResult) => {
    if (!result.faceLandmarks || result.faceLandmarks.length === 0) return;

    const landmarks = result.faceLandmarks[0];
    
    // Eye landmarks indices (MediaPipe Face Mesh)
    const LEFT_EYE = [362, 385, 387, 263, 373, 380];
    const RIGHT_EYE = [33, 160, 158, 133, 153, 144];

    // Calculate Eye Aspect Ratio for blink detection
    const leftEAR = calculateEAR(landmarks, LEFT_EYE);
    const rightEAR = calculateEAR(landmarks, RIGHT_EYE);
    const avgEAR = (leftEAR + rightEAR) / 2;

    // Detect blinks
    const isBlinking = avgEAR < settings.blinkThreshold;
    if (isBlinking && (previousEyeState.current.left && previousEyeState.current.right)) {
      setBlinkCount(prev => prev + 1);
      onBlink?.();
      handleBlinkGesture();
      onGesture?.({
        type: 'blink',
        timestamp: Date.now()
      });
    }
    previousEyeState.current = { left: !isBlinking, right: !isBlinking };

    // Calculate gaze position (using nose tip as reference)
    const noseTip = landmarks[1];
    const leftEyeCenter = landmarks[468];
    const rightEyeCenter = landmarks[473];

    // Estimate gaze direction
    const eyeCenterX = (leftEyeCenter.x + rightEyeCenter.x) / 2;
    const eyeCenterY = (leftEyeCenter.y + rightEyeCenter.y) / 2;
    
    // Map to screen coordinates
    const screenX = eyeCenterX * window.innerWidth;
    const screenY = eyeCenterY * window.innerHeight;

    // Apply smoothing
    smoothedGaze.current.x = smoothedGaze.current.x * (1 - settings.smoothingFactor) + screenX * settings.smoothingFactor;
    smoothedGaze.current.y = smoothedGaze.current.y * (1 - settings.smoothingFactor) + screenY * settings.smoothingFactor;

    setGazePosition({ x: smoothedGaze.current.x, y: smoothedGaze.current.y });
    onGazeUpdate?.(smoothedGaze.current.x, smoothedGaze.current.y);

    // Add to heatmap
    addHeatPoint(smoothedGaze.current.x, smoothedGaze.current.y);

    // Handle dwell click
    handleDwellClick(smoothedGaze.current.x, smoothedGaze.current.y);

    // Scroll detection based on vertical eye movement
    if (scrollBaseline.current === null) {
      scrollBaseline.current = eyeCenterY;
    } else {
      const scrollDiff = scrollBaseline.current - eyeCenterY;
      if (Math.abs(scrollDiff) > 0.02) {
        const direction = scrollDiff > 0 ? 'up' : 'down';
        onScroll?.(direction);
        onGesture?.({
          type: 'scroll',
          direction,
          timestamp: Date.now()
        });
        scrollBaseline.current = eyeCenterY;
      }
    }

    // Draw landmarks on canvas
    drawLandmarks(landmarks);
  };

  // Draw face landmarks on canvas
  const drawLandmarks = (landmarks: any[]) => {
    const canvas = canvasRef.current;
    const video = videoRef.current;
    if (!canvas || !video) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Draw face mesh points
    ctx.fillStyle = 'rgba(0, 255, 0, 0.5)';
    landmarks.forEach(landmark => {
      ctx.beginPath();
      ctx.arc(landmark.x * canvas.width, landmark.y * canvas.height, 1, 0, 2 * Math.PI);
      ctx.fill();
    });

    // Draw eye regions
    const LEFT_EYE = [362, 385, 387, 263, 373, 380];
    const RIGHT_EYE = [33, 160, 158, 133, 153, 144];
    
    ctx.strokeStyle = 'rgba(0, 255, 255, 0.8)';
    ctx.lineWidth = 2;
    
    [LEFT_EYE, RIGHT_EYE].forEach(eye => {
      ctx.beginPath();
      eye.forEach((idx, i) => {
        const point = landmarks[idx];
        const x = point.x * canvas.width;
        const y = point.y * canvas.height;
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      });
      ctx.closePath();
      ctx.stroke();
    });
  };

  // Main tracking loop
  const trackFace = async () => {
    if (!faceLandmarker || !videoRef.current || !isTracking) return;

    const video = videoRef.current;
    
    if (video.readyState === video.HAVE_ENOUGH_DATA) {
      const startTimeMs = performance.now();
      const result = faceLandmarker.detectForVideo(video, startTimeMs);
      processLandmarks(result);
      
      // Calculate latency
      performanceMetrics.current.latency = performance.now() - startTimeMs;
      
      // Update FPS
      fpsCounter.current.frames++;
      const now = Date.now();
      if (now - fpsCounter.current.lastTime >= 1000) {
        setFps(fpsCounter.current.frames);
        fpsCounter.current.frames = 0;
        fpsCounter.current.lastTime = now;
      }
    }

    drawHeatmap();
    animationFrameId.current = requestAnimationFrame(trackFace);
  };

  // Start/Stop tracking
  const toggleTracking = async () => {
    if (!isTracking) {
      if (!isVideoReady) {
        await startWebcam();
      }
      setIsTracking(true);
      setStatus('tracking');
      performanceMetrics.current.sessionStart = Date.now();
    } else {
      setIsTracking(false);
      setStatus('ready');
      if (animationFrameId.current) {
        cancelAnimationFrame(animationFrameId.current);
      }
    }
  };

  useEffect(() => {
    if (isTracking && faceLandmarker && isVideoReady) {
      trackFace();
    }
    return () => {
      if (animationFrameId.current) {
        cancelAnimationFrame(animationFrameId.current);
      }
    };
  }, [isTracking, faceLandmarker, isVideoReady, settings]);

  // Setup heatmap canvas
  useEffect(() => {
    if (heatmapCanvasRef.current) {
      heatmapCanvasRef.current.width = window.innerWidth;
      heatmapCanvasRef.current.height = window.innerHeight;
    }
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopWebcam();
      if (animationFrameId.current) {
        cancelAnimationFrame(animationFrameId.current);
      }
    };
  }, []);

  const sessionTime = Math.floor((Date.now() - performanceMetrics.current.sessionStart) / 1000);

  return (
    <Card className="relative overflow-hidden">
      <div className="relative aspect-video bg-black">
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className="absolute inset-0 w-full h-full object-cover mirror"
          style={{ transform: 'scaleX(-1)' }}
        />
        <canvas
          ref={canvasRef}
          className="absolute inset-0 w-full h-full object-cover mirror"
          style={{ transform: 'scaleX(-1)' }}
        />
        
        {/* Heatmap overlay */}
        {showHeatmap && (
          <canvas
            ref={heatmapCanvasRef}
            className="absolute inset-0 w-full h-full pointer-events-none mix-blend-screen"
            style={{ opacity: 0.6 }}
          />
        )}
        
        {/* Gaze cursor overlay */}
        {isTracking && (
          <>
            <div
              className="absolute w-4 h-4 bg-red-500 rounded-full border-2 border-white shadow-lg pointer-events-none transition-all duration-75"
              style={{
                left: `${(gazePosition.x / window.innerWidth) * 100}%`,
                top: `${(gazePosition.y / window.innerHeight) * 100}%`,
                transform: 'translate(-50%, -50%)'
              }}
            />
            
            {/* Dwell progress indicator */}
            {settings.enableDwellClick && dwellProgress > 0 && (
              <div
                className="absolute pointer-events-none"
                style={{
                  left: `${(gazePosition.x / window.innerWidth) * 100}%`,
                  top: `${(gazePosition.y / window.innerHeight) * 100}%`,
                  transform: 'translate(-50%, -50%)'
                }}
              >
                <svg className="w-16 h-16 -rotate-90">
                  <circle
                    cx="32"
                    cy="32"
                    r="28"
                    fill="none"
                    stroke="rgba(255,255,255,0.3)"
                    strokeWidth="4"
                  />
                  <circle
                    cx="32"
                    cy="32"
                    r="28"
                    fill="none"
                    stroke="#22c55e"
                    strokeWidth="4"
                    strokeDasharray={`${2 * Math.PI * 28}`}
                    strokeDashoffset={`${2 * Math.PI * 28 * (1 - dwellProgress / 100)}`}
                    className="transition-all duration-100"
                  />
                </svg>
              </div>
            )}
          </>
        )}

        {/* Status overlay */}
        <div className="absolute top-4 left-4 flex flex-col gap-2">
          <Badge variant={status === 'tracking' ? 'default' : 'secondary'}>
            {status === 'loading' && 'Loading...'}
            {status === 'ready' && 'Ready'}
            {status === 'tracking' && 'Tracking'}
            {status === 'error' && 'Error'}
            {status === 'idle' && 'Idle'}
          </Badge>
          
          {isTracking && (
            <div className="flex flex-col gap-2">
              <Badge variant="outline" className="bg-black/50 text-white">
                <Eye className="w-3 h-3 mr-1" />
                Blinks: {blinkCount}
              </Badge>
              <Badge variant="outline" className="bg-black/50 text-white">
                <Target className="w-3 h-3 mr-1" />
                Clicks: {clickCount}
              </Badge>
              <Badge variant="outline" className="bg-black/50 text-white">
                FPS: {fps}
              </Badge>
            </div>
          )}
        </div>

        {/* Control overlay */}
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
          <Button
            onClick={toggleTracking}
            disabled={status === 'loading' || status === 'error'}
            size="lg"
            className="gap-2"
          >
            {isTracking ? (
              <>
                <VideoOff className="w-4 h-4" />
                Stop Tracking
              </>
            ) : (
              <>
                <Video className="w-4 h-4" />
                Start Tracking
              </>
            )}
          </Button>
          
          {isTracking && (
            <Button
              onClick={() => setShowHeatmap(!showHeatmap)}
              variant="outline"
              size="lg"
              className="gap-2 bg-black/50 text-white hover:bg-black/70"
            >
              <Crosshair className="w-4 h-4" />
              {showHeatmap ? 'Hide' : 'Show'} Heatmap
            </Button>
          )}
        </div>
      </div>

      {/* Info panel */}
      <div className="p-4 bg-muted/50">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div>
            <span className="text-muted-foreground">Gaze Position:</span>
            <div className="font-mono">
              X: {Math.round(gazePosition.x)}px, Y: {Math.round(gazePosition.y)}px
            </div>
          </div>
          <div>
            <span className="text-muted-foreground">Latency:</span>
            <div className="font-medium">{performanceMetrics.current.latency.toFixed(1)}ms</div>
          </div>
          <div>
            <span className="text-muted-foreground">Session:</span>
            <div className="font-medium">{sessionTime}s</div>
          </div>
          <div>
            <span className="text-muted-foreground">Status:</span>
            <div className="font-medium capitalize">{status}</div>
          </div>
        </div>
      </div>
    </Card>
  );
}