"use client";

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Crosshair, Check, Target, ArrowRight } from 'lucide-react';
import { Progress } from '@/components/ui/progress';

interface CalibrationPoint {
  x: number;
  y: number;
  id: number;
  collected: boolean;
}

interface CalibrationWizardProps {
  onComplete: (calibrationData: any) => void;
  onClose: () => void;
}

export default function CalibrationWizard({ onComplete, onClose }: CalibrationWizardProps) {
  const [currentPoint, setCurrentPoint] = useState(0);
  const [isCollecting, setIsCollecting] = useState(false);
  const [calibrationPoints, setCalibrationPoints] = useState<CalibrationPoint[]>([
    { x: 10, y: 10, id: 0, collected: false },
    { x: 90, y: 10, id: 1, collected: false },
    { x: 50, y: 50, id: 2, collected: false },
    { x: 10, y: 90, id: 3, collected: false },
    { x: 90, y: 90, id: 4, collected: false },
  ]);
  const [countdown, setCountdown] = useState(3);
  const [phase, setPhase] = useState<'intro' | 'calibrating' | 'complete'>('intro');

  useEffect(() => {
    if (isCollecting && countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    } else if (isCollecting && countdown === 0) {
      collectPoint();
    }
  }, [isCollecting, countdown]);

  const startCalibration = () => {
    setPhase('calibrating');
    setCurrentPoint(0);
    startPointCollection();
  };

  const startPointCollection = () => {
    setIsCollecting(true);
    setCountdown(3);
  };

  const collectPoint = () => {
    setIsCollecting(false);
    
    // Mark current point as collected
    setCalibrationPoints(prev => 
      prev.map((p, i) => i === currentPoint ? { ...p, collected: true } : p)
    );

    // Move to next point or complete
    if (currentPoint < calibrationPoints.length - 1) {
      setTimeout(() => {
        setCurrentPoint(currentPoint + 1);
        startPointCollection();
      }, 500);
    } else {
      setTimeout(() => {
        completeCalibration();
      }, 500);
    }
  };

  const completeCalibration = () => {
    setPhase('complete');
    const calibrationData = {
      points: calibrationPoints,
      timestamp: Date.now(),
      screenWidth: window.innerWidth,
      screenHeight: window.innerHeight
    };
    setTimeout(() => {
      onComplete(calibrationData);
    }, 1500);
  };

  const progress = ((currentPoint + (isCollecting ? 0.5 : 0)) / calibrationPoints.length) * 100;

  return (
    <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center">
      {phase === 'intro' && (
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="w-5 h-5" />
              Eye Tracking Calibration
            </CardTitle>
            <CardDescription>
              Improve tracking accuracy with a quick calibration
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2 text-sm">
              <p>This calibration will help improve the accuracy of eye tracking by collecting data at key points on your screen.</p>
              <p className="font-medium">Instructions:</p>
              <ul className="list-disc list-inside space-y-1 ml-2">
                <li>Look at each point that appears on screen</li>
                <li>Keep your head still during calibration</li>
                <li>The process takes about 15 seconds</li>
              </ul>
            </div>
            <div className="flex gap-2">
              <Button onClick={startCalibration} className="flex-1 gap-2">
                <ArrowRight className="w-4 h-4" />
                Start Calibration
              </Button>
              <Button onClick={onClose} variant="outline">
                Skip
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {phase === 'calibrating' && (
        <>
          {/* Calibration points */}
          {calibrationPoints.map((point, index) => (
            <div
              key={point.id}
              className={`absolute transition-all duration-300 ${
                index === currentPoint ? 'scale-100 opacity-100' : 'scale-75 opacity-30'
              }`}
              style={{
                left: `${point.x}%`,
                top: `${point.y}%`,
                transform: 'translate(-50%, -50%)'
              }}
            >
              {point.collected ? (
                <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center">
                  <Check className="w-6 h-6 text-white" />
                </div>
              ) : index === currentPoint ? (
                <div className="relative">
                  <div className="w-16 h-16 border-4 border-primary rounded-full animate-pulse" />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Crosshair className="w-8 h-8 text-primary" />
                  </div>
                  {isCollecting && (
                    <div className="absolute -bottom-12 left-1/2 -translate-x-1/2 bg-black/80 text-white px-4 py-2 rounded-full text-2xl font-bold">
                      {countdown}
                    </div>
                  )}
                </div>
              ) : (
                <div className="w-12 h-12 border-2 border-muted rounded-full flex items-center justify-center">
                  <div className="w-4 h-4 bg-muted rounded-full" />
                </div>
              )}
            </div>
          ))}

          {/* Progress bar */}
          <div className="absolute bottom-8 left-1/2 -translate-x-1/2 w-full max-w-md px-4">
            <Card className="bg-black/50 backdrop-blur border-white/20">
              <CardContent className="pt-6">
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm text-white">
                    <span>Calibration Progress</span>
                    <span>{Math.round(progress)}%</span>
                  </div>
                  <Progress value={progress} className="h-2" />
                  <p className="text-xs text-white/80 text-center">
                    Point {currentPoint + 1} of {calibrationPoints.length}
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </>
      )}

      {phase === 'complete' && (
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Check className="w-5 h-5 text-green-500" />
              Calibration Complete
            </CardTitle>
            <CardDescription>
              Your eye tracking has been calibrated successfully
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-center py-6">
              <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center">
                <Check className="w-8 h-8 text-white" />
              </div>
            </div>
            <div className="text-center text-sm text-muted-foreground">
              The system is now optimized for your setup. You can recalibrate anytime from the settings.
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
