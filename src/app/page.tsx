"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Eye, Target, Activity, Zap, ArrowRight, MousePointer, Clock, Settings } from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted">
      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20">
        <div className="max-w-4xl mx-auto text-center space-y-8">
          <Badge variant="secondary" className="text-sm px-4 py-2">
            <Activity className="w-4 h-4 mr-2 inline" />
            Powered by MediaPipe & AI
          </Badge>
          
          <h1 className="text-5xl md:text-7xl font-bold tracking-tight">
            Eye-Controlled
            <span className="block text-primary mt-2">Mouse Tracking</span>
          </h1>
          
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Control your cursor with eye movements. Advanced eye tracking technology 
            using MediaPipe Face Mesh for precise gaze detection and gesture control.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
            <Link href="/eye-tracking">
              <Button size="lg" className="gap-2 text-lg px-8 py-6">
                <Eye className="w-5 h-5" />
                Launch Tracker
                <ArrowRight className="w-5 h-5" />
              </Button>
            </Link>
            <Button size="lg" variant="outline" className="gap-2 text-lg px-8 py-6" asChild>
              <a href="#features">
                Learn More
              </a>
            </Button>
          </div>
        </div>
      </section>

      {/* Demo Video Section */}
      <section className="container mx-auto px-4 py-12">
        <div className="max-w-5xl mx-auto">
          <Card className="overflow-hidden border-2">
            <div className="aspect-video bg-gradient-to-br from-primary/10 to-primary/5 flex items-center justify-center relative">
              <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=1200&h=675&fit=crop')] bg-cover bg-center opacity-50" />
              <div className="relative z-10 text-center space-y-4">
                <Eye className="w-20 h-20 mx-auto text-primary animate-pulse" />
                <p className="text-2xl font-semibold">Real-time Eye Tracking Demo</p>
                <Badge variant="secondary" className="text-sm">
                  Click "Launch Tracker" to try it live
                </Badge>
              </div>
            </div>
          </Card>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="container mx-auto px-4 py-20">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold mb-4">Advanced Features</h2>
            <p className="text-xl text-muted-foreground">
              Everything you need for precise eye-controlled interaction
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <Target className="w-12 h-12 text-primary mb-4" />
                <CardTitle>Real-time Gaze Tracking</CardTitle>
                <CardDescription>
                  Precise eye position tracking using MediaPipe Face Mesh with 468 facial landmarks
                </CardDescription>
              </CardHeader>
            </Card>

            <Card>
              <CardHeader>
                <Eye className="w-12 h-12 text-primary mb-4" />
                <CardTitle>Blink Detection</CardTitle>
                <CardDescription>
                  Advanced Eye Aspect Ratio algorithm for reliable blink recognition and counting
                </CardDescription>
              </CardHeader>
            </Card>

            <Card>
              <CardHeader>
                <MousePointer className="w-12 h-12 text-primary mb-4" />
                <CardTitle>Gesture Control</CardTitle>
                <CardDescription>
                  Control scrolling, clicking, and navigation using only eye movements and blinks
                </CardDescription>
              </CardHeader>
            </Card>

            <Card>
              <CardHeader>
                <Zap className="w-12 h-12 text-primary mb-4" />
                <CardTitle>Smooth Tracking</CardTitle>
                <CardDescription>
                  Configurable smoothing algorithms reduce jitter for natural cursor movement
                </CardDescription>
              </CardHeader>
            </Card>

            <Card>
              <CardHeader>
                <Clock className="w-12 h-12 text-primary mb-4" />
                <CardTitle>Dwell-to-Click</CardTitle>
                <CardDescription>
                  Hold your gaze on a target for specified duration to trigger click actions
                </CardDescription>
              </CardHeader>
            </Card>

            <Card>
              <CardHeader>
                <Settings className="w-12 h-12 text-primary mb-4" />
                <CardTitle>Customizable Settings</CardTitle>
                <CardDescription>
                  Fine-tune sensitivity, thresholds, and behavior to match your preferences
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>

      {/* Tech Stack Section */}
      <section className="container mx-auto px-4 py-20">
        <div className="max-w-4xl mx-auto">
          <Card>
            <CardHeader>
              <CardTitle className="text-3xl text-center">Built with Modern Technology</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
                <div className="space-y-2">
                  <div className="text-2xl font-bold">MediaPipe</div>
                  <p className="text-sm text-muted-foreground">Face Mesh ML</p>
                </div>
                <div className="space-y-2">
                  <div className="text-2xl font-bold">WebGL</div>
                  <p className="text-sm text-muted-foreground">GPU Acceleration</p>
                </div>
                <div className="space-y-2">
                  <div className="text-2xl font-bold">Next.js 15</div>
                  <p className="text-sm text-muted-foreground">React Framework</p>
                </div>
                <div className="space-y-2">
                  <div className="text-2xl font-bold">TypeScript</div>
                  <p className="text-sm text-muted-foreground">Type Safety</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-4 py-20">
        <div className="max-w-3xl mx-auto text-center space-y-8">
          <h2 className="text-4xl font-bold">Ready to Try?</h2>
          <p className="text-xl text-muted-foreground">
            Experience the future of hands-free computer control with eye tracking technology
          </p>
          <Link href="/eye-tracking">
            <Button size="lg" className="gap-2 text-lg px-8 py-6">
              <Eye className="w-5 h-5" />
              Get Started Now
              <ArrowRight className="w-5 h-5" />
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-8">
        <div className="container mx-auto px-4 text-center text-muted-foreground">
          <p>Built with Next.js, MediaPipe, and TensorFlow.js</p>
        </div>
      </footer>
    </div>
  );
}