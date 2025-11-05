import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    
    // Handle different types of eye tracking events
    const { type, payload } = data;
    
    switch (type) {
      case 'calibration':
        // Store calibration data
        return NextResponse.json({ 
          success: true, 
          message: 'Calibration data saved',
          calibrationId: Date.now() 
        });
      
      case 'gesture':
        // Log gesture events (blink, scroll, etc.)
        return NextResponse.json({ 
          success: true, 
          message: 'Gesture recorded',
          timestamp: Date.now() 
        });
      
      case 'session':
        // Store session metrics
        return NextResponse.json({ 
          success: true, 
          message: 'Session data saved',
          sessionId: Date.now() 
        });
      
      default:
        return NextResponse.json({ 
          success: false, 
          message: 'Unknown event type' 
        }, { status: 400 });
    }
  } catch (error) {
    console.error('Eye tracking API error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type');
    
    // Return mock data for now
    if (type === 'calibration') {
      return NextResponse.json({
        success: true,
        data: {
          smoothingFactor: 0.3,
          blinkThreshold: 0.2,
          scrollSensitivity: 1.5,
          dwellTime: 1000
        }
      });
    }
    
    if (type === 'history') {
      return NextResponse.json({
        success: true,
        data: []
      });
    }
    
    return NextResponse.json({ 
      success: false, 
      message: 'Invalid query parameter' 
    }, { status: 400 });
  } catch (error) {
    console.error('Eye tracking API error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}
