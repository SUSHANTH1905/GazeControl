"use client";

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { Eye, MousePointer, ArrowUp, ArrowDown, Clock, Mouse, MousePointer2, Trash2 } from 'lucide-react';

interface GestureEvent {
  id: string;
  type: 'blink' | 'gaze' | 'scroll' | 'dwell' | 'click' | 'dwell-click';
  timestamp: number;
  action?: 'left' | 'right' | 'up' | 'down';
  position?: { x: number; y: number };
  direction?: 'up' | 'down';
}

interface GestureHistoryProps {
  events?: GestureEvent[];
  maxEvents?: number;
}

export default function GestureHistory({ events = [], maxEvents = 50 }: GestureHistoryProps) {
  const [history, setHistory] = useState<GestureEvent[]>([]);

  useEffect(() => {
    if (events.length > 0) {
      setHistory(prev => {
        const newHistory = [...prev, ...events];
        return newHistory.slice(-maxEvents);
      });
    }
  }, [events, maxEvents]);

  const clearHistory = () => {
    setHistory([]);
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'blink':
        return <Eye className="w-4 h-4" />;
      case 'gaze':
        return <MousePointer className="w-4 h-4" />;
      case 'scroll':
        return <ArrowDown className="w-4 h-4" />;
      case 'dwell':
        return <Clock className="w-4 h-4" />;
      case 'click':
        return <Mouse className="w-4 h-4" />;
      case 'dwell-click':
        return <MousePointer2 className="w-4 h-4" />;
      default:
        return null;
    }
  };

  const getEventColor = (type: string) => {
    switch (type) {
      case 'blink':
        return 'bg-blue-500/10 border-blue-500/20';
      case 'click':
        return 'bg-green-500/10 border-green-500/20';
      case 'dwell-click':
        return 'bg-purple-500/10 border-purple-500/20';
      case 'scroll':
        return 'bg-orange-500/10 border-orange-500/20';
      default:
        return 'bg-muted';
    }
  };

  const getTimeAgo = (timestamp: number) => {
    const seconds = Math.floor((Date.now() - timestamp) / 1000);
    if (seconds < 1) return 'just now';
    if (seconds < 60) return `${seconds}s ago`;
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    return `${hours}h ago`;
  };

  const getEventDescription = (event: GestureEvent) => {
    switch (event.type) {
      case 'blink':
        return 'Eye blink detected';
      case 'click':
        return `${event.action === 'right' ? 'Right' : 'Left'} click`;
      case 'dwell-click':
        return 'Dwell click activated';
      case 'scroll':
        return `Scroll ${event.direction}`;
      case 'gaze':
        return `Gaze at (${Math.round(event.position?.x || 0)}, ${Math.round(event.position?.y || 0)})`;
      default:
        return event.type;
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Gesture History</CardTitle>
            <CardDescription>
              Real-time log of eye tracking events and gestures
            </CardDescription>
          </div>
          {history.length > 0 && (
            <Button onClick={clearHistory} variant="outline" size="sm" className="gap-2">
              <Trash2 className="w-3 h-3" />
              Clear
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className="mb-3 flex items-center justify-between text-sm">
          <span className="text-muted-foreground">Total Events: {history.length}</span>
          {history.length > 0 && (
            <Badge variant="secondary">Last: {getTimeAgo(history[history.length - 1].timestamp)}</Badge>
          )}
        </div>
        <ScrollArea className="h-[300px] pr-4">
          <div className="space-y-2">
            {history.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No gestures recorded yet. Start tracking to see events.
              </div>
            ) : (
              [...history].reverse().map((event, index) => (
                <div
                  key={`${event.id}-${index}`}
                  className={`flex items-center justify-between p-3 rounded-lg border transition-colors ${getEventColor(event.type)}`}
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-full bg-primary/10">
                      {getIcon(event.type)}
                    </div>
                    <div>
                      <div className="font-medium capitalize">{event.type}</div>
                      <div className="text-xs text-muted-foreground">
                        {getEventDescription(event)}
                      </div>
                    </div>
                  </div>
                  <Badge variant="secondary" className="text-xs">
                    {getTimeAgo(event.timestamp)}
                  </Badge>
                </div>
              ))
            )}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}