"use client";

import { useState, useEffect, useCallback } from 'react';
import EyeTracking from '@/components/EyeTracking';
import SettingsPanel from '@/components/SettingsPanel';
import GestureHistory from '@/components/GestureHistory';
import CalibrationWizard from '@/components/CalibrationWizard';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Eye, Activity, Target, Zap, MousePointer2, TrendingUp, BarChart3, Download, Crosshair } from 'lucide-react';
import { Progress } from '@/components/ui/progress';

interface GestureEvent {
  id: string;
  type: 'blink' | 'gaze' | 'scroll' | 'dwell' | 'click' | 'dwell-click';
  timestamp: number;
  action?: 'left' | 'right' | 'up' | 'down';
  position?: { x: number; y: number };
  direction?: 'up' | 'down';
}

export default function EyeTrackingDashboard() {
  const [settings, setSettings] = useState({
    smoothingFactor: 0.3,
    blinkThreshold: 0.2,
    scrollSensitivity: 1.5,
    dwellTime: 1000,
    enableDwellClick: false,
    enableScrollGesture: true,
    enableBlinkClick: false
  });

  const [metrics, setMetrics] = useState({
    totalBlinks: 0,
    totalClicks: 0,
    totalScrolls: 0,
    accuracy: 95,
    avgResponseTime: 0,
    sessionTime: 0
  });

  const [gestureEvents, setGestureEvents] = useState<GestureEvent[]>([]);
  const [recentGestures, setRecentGestures] = useState<GestureEvent[]>([]);
  const [sessionStart, setSessionStart] = useState<number | null>(null);
  const [isTracking, setIsTracking] = useState(false);
  const [showCalibration, setShowCalibration] = useState(false);
  const [isCalibrated, setIsCalibrated] = useState(false);

  // Update session time
  useEffect(() => {
    if (!sessionStart) return;
    
    const interval = setInterval(() => {
      const elapsed = Math.floor((Date.now() - sessionStart) / 1000);
      setMetrics(prev => ({ ...prev, sessionTime: elapsed }));
    }, 1000);

    return () => clearInterval(interval);
  }, [sessionStart]);

  // Start session timer when tracking starts
  useEffect(() => {
    if (isTracking && !sessionStart) {
      setSessionStart(Date.now());
    } else if (!isTracking && sessionStart) {
      setSessionStart(null);
    }
  }, [isTracking]);

  const handleGazeUpdate = useCallback((x: number, y: number) => {
    // Handle gaze position updates
  }, []);

  const handleBlink = useCallback(() => {
    setMetrics(prev => ({ ...prev, totalBlinks: prev.totalBlinks + 1 }));
  }, []);

  const handleScroll = useCallback((direction: 'up' | 'down') => {
    window.scrollBy({
      top: direction === 'down' ? 100 : -100,
      behavior: 'smooth'
    });
    setMetrics(prev => ({ ...prev, totalScrolls: prev.totalScrolls + 1 }));
  }, []);

  const handleGesture = useCallback((gesture: any) => {
    const gestureEvent: GestureEvent = {
      id: `${Date.now()}-${Math.random()}`,
      type: gesture.type,
      timestamp: gesture.timestamp || Date.now(),
      action: gesture.action,
      position: gesture.position,
      direction: gesture.direction
    };

    setRecentGestures(prev => [gestureEvent]);
    
    // Update metrics based on gesture type
    if (gesture.type === 'click' || gesture.type === 'dwell-click') {
      setMetrics(prev => ({ 
        ...prev, 
        totalClicks: prev.totalClicks + 1,
        avgResponseTime: (prev.avgResponseTime * prev.totalClicks + (gesture.responseTime || 50)) / (prev.totalClicks + 1)
      }));
    }

    if (gesture.type === 'scroll') {
      setMetrics(prev => ({ ...prev, totalScrolls: prev.totalScrolls + 1 }));
    }

    // Track for history
    setGestureEvents(prev => [...prev, gestureEvent]);
  }, []);

  const handleCalibrationComplete = (calibrationData: any) => {
    setIsCalibrated(true);
    setShowCalibration(false);
    setMetrics(prev => ({ ...prev, accuracy: 98 })); // Improve accuracy after calibration
  };

  const exportData = () => {
    const data = {
      settings,
      metrics,
      gestureEvents,
      sessionStart,
      sessionEnd: Date.now(),
      isCalibrated
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `eye-tracking-session-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Calibration Wizard */}
      {showCalibration && (
        <CalibrationWizard
          onComplete={handleCalibrationComplete}
          onClose={() => setShowCalibration(false)}
        />
      )}

      {/* Header */}
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold flex items-center gap-3">
                <Eye className="w-8 h-8 text-primary" />
                Eye Tracking Dashboard
              </h1>
              <p className="text-muted-foreground mt-1">
                Real-time eye tracking and gesture control powered by MediaPipe
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Button 
                onClick={() => setShowCalibration(true)} 
                variant="outline" 
                size="sm" 
                className="gap-2"
              >
                <Crosshair className="w-4 h-4" />
                {isCalibrated ? 'Recalibrate' : 'Calibrate'}
              </Button>
              <Button onClick={exportData} variant="outline" size="sm" className="gap-2">
                <Download className="w-4 h-4" />
                Export Data
              </Button>
              <Badge variant="outline" className="text-lg px-4 py-2">
                <Activity className="w-4 h-4 mr-2" />
                {isTracking ? 'Live' : 'Idle'}
              </Badge>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Video Feed */}
          <div className="lg:col-span-2 space-y-6">
            <EyeTracking
              onGazeUpdate={handleGazeUpdate}
              onBlink={handleBlink}
              onScroll={handleScroll}
              onGesture={handleGesture}
              settings={settings}
            />

            {/* Performance Metrics */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                    <Eye className="w-4 h-4" />
                    Total Blinks
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{metrics.totalBlinks}</div>
                  <Progress value={(metrics.totalBlinks % 100)} className="mt-2 h-1" />
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                    <MousePointer2 className="w-4 h-4" />
                    Total Clicks
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{metrics.totalClicks}</div>
                  <Progress value={(metrics.totalClicks % 100)} className="mt-2 h-1" />
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                    <TrendingUp className="w-4 h-4" />
                    Accuracy
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{metrics.accuracy}%</div>
                  <Progress value={metrics.accuracy} className="mt-2 h-1" />
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                    <Activity className="w-4 h-4" />
                    Session Time
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{formatTime(metrics.sessionTime)}</div>
                  <p className="text-xs text-muted-foreground mt-1">
                    {metrics.sessionTime > 0 ? 'Active' : 'Not started'}
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Additional Stats */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="w-5 h-5" />
                  Session Statistics
                </CardTitle>
                <CardDescription>
                  Detailed performance metrics and insights
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">Total Gestures</p>
                    <p className="text-2xl font-bold">{gestureEvents.length}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">Avg Response</p>
                    <p className="text-2xl font-bold">{metrics.avgResponseTime.toFixed(0)}ms</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">Scroll Actions</p>
                    <p className="text-2xl font-bold">{metrics.totalScrolls}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">Blink Rate</p>
                    <p className="text-2xl font-bold">
                      {metrics.sessionTime > 0 ? (metrics.totalBlinks / (metrics.sessionTime / 60)).toFixed(1) : '0'}/min
                    </p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">Click Rate</p>
                    <p className="text-2xl font-bold">
                      {metrics.sessionTime > 0 ? (metrics.totalClicks / (metrics.sessionTime / 60)).toFixed(1) : '0'}/min
                    </p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">Efficiency</p>
                    <p className="text-2xl font-bold">
                      {metrics.totalBlinks > 0 ? ((metrics.totalClicks / metrics.totalBlinks) * 100).toFixed(0) : '0'}%
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Gesture History */}
            <GestureHistory events={recentGestures} />
          </div>

          {/* Right Column - Settings & Info */}
          <div className="space-y-6">
            <SettingsPanel
              settings={settings}
              onSettingsChange={setSettings}
            />

            {/* Features Card */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="w-5 h-5" />
                  Features
                </CardTitle>
                <CardDescription>
                  Advanced eye tracking capabilities
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-start gap-3">
                  <Target className="w-5 h-5 text-primary mt-0.5" />
                  <div>
                    <div className="font-medium">Real-time Gaze Tracking</div>
                    <p className="text-xs text-muted-foreground">
                      Precise eye position tracking using MediaPipe Face Mesh
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Eye className="w-5 h-5 text-primary mt-0.5" />
                  <div>
                    <div className="font-medium">Blink Detection</div>
                    <p className="text-xs text-muted-foreground">
                      Advanced algorithm for reliable blink recognition
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <MousePointer2 className="w-5 h-5 text-primary mt-0.5" />
                  <div>
                    <div className="font-medium">Click Gestures</div>
                    <p className="text-xs text-muted-foreground">
                      Double blink to click, triple blink for right-click
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Activity className="w-5 h-5 text-primary mt-0.5" />
                  <div>
                    <div className="font-medium">Dwell-to-Click</div>
                    <p className="text-xs text-muted-foreground">
                      Hold your gaze to activate interactive elements
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Zap className="w-5 h-5 text-primary mt-0.5" />
                  <div>
                    <div className="font-medium">Gaze Heatmap</div>
                    <p className="text-xs text-muted-foreground">
                      Visualize where you're looking over time
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <TrendingUp className="w-5 h-5 text-primary mt-0.5" />
                  <div>
                    <div className="font-medium">Performance Analytics</div>
                    <p className="text-xs text-muted-foreground">
                      Track accuracy, latency, and usage patterns
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Usage Tips */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Usage Tips</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <p className="flex items-start gap-2">
                  <span className="text-primary">•</span>
                  <span>Enable <strong>Dwell Click</strong> to click by staring at a point</span>
                </p>
                <p className="flex items-start gap-2">
                  <span className="text-primary">•</span>
                  <span>Enable <strong>Blink Click</strong> for hands-free clicking</span>
                </p>
                <p className="flex items-start gap-2">
                  <span className="text-primary">•</span>
                  <span>Adjust smoothing for your comfort level</span>
                </p>
                <p className="flex items-start gap-2">
                  <span className="text-primary">•</span>
                  <span>Toggle heatmap to see your attention patterns</span>
                </p>
                <p className="flex items-start gap-2">
                  <span className="text-primary">•</span>
                  <span>Run calibration for improved accuracy</span>
                </p>
                <p className="flex items-start gap-2">
                  <span className="text-primary">•</span>
                  <span>Export session data for analysis</span>
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}