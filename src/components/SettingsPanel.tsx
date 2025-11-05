"use client";

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Settings, RotateCcw, Save } from 'lucide-react';

interface SettingsPanelProps {
  settings: {
    smoothingFactor: number;
    blinkThreshold: number;
    scrollSensitivity: number;
    dwellTime: number;
    enableDwellClick?: boolean;
    enableScrollGesture?: boolean;
    enableBlinkClick?: boolean;
  };
  onSettingsChange: (settings: any) => void;
}

export default function SettingsPanel({ settings, onSettingsChange }: SettingsPanelProps) {
  const [localSettings, setLocalSettings] = useState(settings);

  const defaultSettings = {
    smoothingFactor: 0.3,
    blinkThreshold: 0.2,
    scrollSensitivity: 1.5,
    dwellTime: 1000,
    enableDwellClick: false,
    enableScrollGesture: true,
    enableBlinkClick: false
  };

  const handleSliderChange = (key: string, value: number[]) => {
    const newSettings = { ...localSettings, [key]: value[0] };
    setLocalSettings(newSettings);
  };

  const handleToggle = (key: string, value: boolean) => {
    const newSettings = { ...localSettings, [key]: value };
    setLocalSettings(newSettings);
    onSettingsChange(newSettings);
  };

  const handleSave = async () => {
    onSettingsChange(localSettings);
  };

  const handleReset = () => {
    setLocalSettings(defaultSettings);
    onSettingsChange(defaultSettings);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Settings className="w-5 h-5" />
          Tracking Settings
        </CardTitle>
        <CardDescription>
          Configure eye tracking parameters for optimal performance
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Smoothing Factor */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="smoothing">Smoothing Factor</Label>
            <Badge variant="secondary">{localSettings.smoothingFactor.toFixed(2)}</Badge>
          </div>
          <Slider
            id="smoothing"
            min={0.1}
            max={1}
            step={0.05}
            value={[localSettings.smoothingFactor]}
            onValueChange={(value) => handleSliderChange('smoothingFactor', value)}
          />
          <p className="text-xs text-muted-foreground">
            Higher values = smoother cursor movement (less jitter, more lag)
          </p>
        </div>

        {/* Blink Threshold */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="blink">Blink Threshold</Label>
            <Badge variant="secondary">{localSettings.blinkThreshold.toFixed(2)}</Badge>
          </div>
          <Slider
            id="blink"
            min={0.1}
            max={0.3}
            step={0.01}
            value={[localSettings.blinkThreshold]}
            onValueChange={(value) => handleSliderChange('blinkThreshold', value)}
          />
          <p className="text-xs text-muted-foreground">
            Lower values = more sensitive blink detection
          </p>
        </div>

        {/* Scroll Sensitivity */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="scroll">Scroll Sensitivity</Label>
            <Badge variant="secondary">{localSettings.scrollSensitivity.toFixed(1)}</Badge>
          </div>
          <Slider
            id="scroll"
            min={0.5}
            max={3}
            step={0.1}
            value={[localSettings.scrollSensitivity]}
            onValueChange={(value) => handleSliderChange('scrollSensitivity', value)}
          />
          <p className="text-xs text-muted-foreground">
            Adjust scrolling speed based on gaze movement
          </p>
        </div>

        {/* Dwell Time */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="dwell">Dwell Time (ms)</Label>
            <Badge variant="secondary">{localSettings.dwellTime}</Badge>
          </div>
          <Slider
            id="dwell"
            min={500}
            max={2000}
            step={100}
            value={[localSettings.dwellTime]}
            onValueChange={(value) => handleSliderChange('dwellTime', value)}
          />
          <p className="text-xs text-muted-foreground">
            Time to hold gaze for dwell-to-click activation
          </p>
        </div>

        <div className="border-t pt-4 space-y-4">
          <h4 className="font-medium text-sm">Interaction Features</h4>
          
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="dwell-click">Dwell Click</Label>
              <p className="text-xs text-muted-foreground">
                Click by holding gaze on target
              </p>
            </div>
            <Switch
              id="dwell-click"
              checked={localSettings.enableDwellClick}
              onCheckedChange={(value) => handleToggle('enableDwellClick', value)}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="scroll-gesture">Scroll Gesture</Label>
              <p className="text-xs text-muted-foreground">
                Scroll by looking up/down
              </p>
            </div>
            <Switch
              id="scroll-gesture"
              checked={localSettings.enableScrollGesture ?? true}
              onCheckedChange={(value) => handleToggle('enableScrollGesture', value)}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="blink-click">Blink to Click</Label>
              <p className="text-xs text-muted-foreground">
                Double blink to click, triple for right-click
              </p>
            </div>
            <Switch
              id="blink-click"
              checked={localSettings.enableBlinkClick}
              onCheckedChange={(value) => handleToggle('enableBlinkClick', value)}
            />
          </div>
        </div>

        <div className="flex gap-2 pt-4">
          <Button onClick={handleSave} className="flex-1 gap-2">
            <Save className="w-4 h-4" />
            Apply Settings
          </Button>
          <Button onClick={handleReset} variant="outline" className="gap-2">
            <RotateCcw className="w-4 h-4" />
            Reset
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}