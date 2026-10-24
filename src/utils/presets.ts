export interface DemoPreset {
  id: string;
  name: string;
  category: 'pothole' | 'garbage' | 'streetlight' | 'waterlogging' | 'ambiguous';
  suggestedArea: string;
  title: string;
  description: string;
  dataUrl: string;
  simulatedGps?: {
    latitude: number;
    longitude: number;
    formatted: string;
  };
}

// Generate realistic rasterized data URLs using HTML canvas for reliable multimodal Gemini processing
export function createPresetDataUrl(type: 'pothole' | 'garbage' | 'streetlight' | 'waterlogging' | 'ambiguous'): string {
  if (typeof document === 'undefined') return '';
  const canvas = document.createElement('canvas');
  canvas.width = 640;
  canvas.height = 480;
  const ctx = canvas.getContext('2d');
  if (!ctx) return '';

  if (type === 'pothole') {
    // Road surface
    const roadGrad = ctx.createLinearGradient(0, 0, 0, 480);
    roadGrad.addColorStop(0, '#374151');
    roadGrad.addColorStop(1, '#1f2937');
    ctx.fillStyle = roadGrad;
    ctx.fillRect(0, 0, 640, 480);

    // Road texture speckles
    ctx.fillStyle = '#4b5563';
    for (let i = 0; i < 200; i++) {
      ctx.fillRect((i * 37) % 640, (i * 73) % 480, 3, 2);
    }

    // Yellow lane marker
    ctx.fillStyle = '#f59e0b';
    ctx.fillRect(300, 20, 40, 90);
    ctx.fillRect(300, 160, 40, 90);
    ctx.fillRect(300, 300, 40, 90);
    ctx.fillRect(300, 440, 40, 40);

    // Deep jagged pothole
    ctx.fillStyle = '#111827';
    ctx.beginPath();
    ctx.ellipse(340, 260, 140, 80, 0.2, 0, Math.PI * 2);
    ctx.fill();

    // Inner crater depth & cracks
    ctx.fillStyle = '#030712';
    ctx.beginPath();
    ctx.ellipse(335, 265, 110, 60, 0.15, 0, Math.PI * 2);
    ctx.fill();

    // Loose gravel and asphalt rubble
    ctx.fillStyle = '#6b7280';
    ctx.beginPath();
    ctx.arc(260, 280, 12, 0, Math.PI * 2);
    ctx.arc(410, 250, 16, 0, Math.PI * 2);
    ctx.arc(380, 310, 14, 0, Math.PI * 2);
    ctx.arc(310, 230, 9, 0, Math.PI * 2);
    ctx.fill();

    // Text banner in image for clarity
    ctx.fillStyle = 'rgba(0,0,0,0.6)';
    ctx.fillRect(10, 440, 280, 30);
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 14px sans-serif';
    ctx.fillText('CIVIC EVIDENCE: ROAD SURFACE CRATER', 18, 460);

  } else if (type === 'garbage') {
    // Street curb and pavement
    ctx.fillStyle = '#9ca3af';
    ctx.fillRect(0, 0, 640, 220); // sidewalk
    ctx.fillStyle = '#374151';
    ctx.fillRect(0, 220, 640, 260); // road

    // Curb edge line
    ctx.fillStyle = '#e5e7eb';
    ctx.fillRect(0, 215, 640, 10);

    // Overflowing municipal dumpster
    ctx.fillStyle = '#047857';
    ctx.fillRect(180, 80, 280, 180);
    ctx.fillStyle = '#065f46';
    ctx.fillRect(170, 70, 300, 20);

    // Overflowing plastic bags & municipal refuse
    const colors = ['#dc2626', '#2563eb', '#f59e0b', '#10b981', '#f3f4f6', '#1e293b'];
    for (let i = 0; i < 45; i++) {
      ctx.fillStyle = colors[i % colors.length];
      const x = 140 + (i * 23) % 360;
      const y = 140 + (i * 17) % 200;
      const r = 16 + (i % 12);
      ctx.beginPath();
      ctx.ellipse(x, y, r, r * 0.75, (i * 0.4), 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.fillStyle = 'rgba(0,0,0,0.6)';
    ctx.fillRect(10, 440, 310, 30);
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 14px sans-serif';
    ctx.fillText('CIVIC EVIDENCE: SOLID WASTE ACCUMULATION', 18, 460);

  } else if (type === 'streetlight') {
    // Night sky
    const skyGrad = ctx.createLinearGradient(0, 0, 0, 480);
    skyGrad.addColorStop(0, '#020617');
    skyGrad.addColorStop(1, '#0f172a');
    ctx.fillStyle = skyGrad;
    ctx.fillRect(0, 0, 640, 480);

    // Road below
    ctx.fillStyle = '#1e293b';
    ctx.fillRect(0, 380, 640, 100);

    // Streetlight pole (broken / tilted)
    ctx.strokeStyle = '#94a3b8';
    ctx.lineWidth = 14;
    ctx.beginPath();
    ctx.moveTo(320, 400);
    ctx.lineTo(350, 140);
    ctx.lineTo(440, 120);
    ctx.stroke();

    // Dark lamp fixture (unlit / cracked)
    ctx.fillStyle = '#475569';
    ctx.beginPath();
    ctx.ellipse(450, 125, 35, 18, 0.2, 0, Math.PI * 2);
    ctx.fill();

    // Hanging loose wire
    ctx.strokeStyle = '#ef4444';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(430, 130);
    ctx.quadraticCurveTo(450, 210, 420, 240);
    ctx.stroke();

    ctx.fillStyle = 'rgba(0,0,0,0.6)';
    ctx.fillRect(10, 440, 320, 30);
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 14px sans-serif';
    ctx.fillText('CIVIC EVIDENCE: DAMAGED STREETLIGHT POLE', 18, 460);

  } else if (type === 'waterlogging') {
    // Overcast sky & buildings
    ctx.fillStyle = '#64748b';
    ctx.fillRect(0, 0, 640, 200);

    // Building silhouettes
    ctx.fillStyle = '#334155';
    ctx.fillRect(40, 60, 120, 140);
    ctx.fillRect(200, 40, 160, 160);
    ctx.fillRect(400, 70, 180, 130);

    // Submerged roadway & muddy flood water
    const waterGrad = ctx.createLinearGradient(0, 200, 0, 480);
    waterGrad.addColorStop(0, '#475569');
    waterGrad.addColorStop(0.5, '#3b556e');
    waterGrad.addColorStop(1, '#253e54');
    ctx.fillStyle = waterGrad;
    ctx.fillRect(0, 200, 640, 280);

    // Water ripple reflections
    ctx.strokeStyle = '#93c5fd';
    ctx.lineWidth = 2;
    for (let i = 0; i < 15; i++) {
      ctx.beginPath();
      const ry = 230 + i * 16;
      ctx.moveTo(50 + (i * 20) % 150, ry);
      ctx.lineTo(450 + (i * 15) % 180, ry);
      ctx.stroke();
    }

    // Submerged vehicle tires indicator
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(280, 310, 80, 30); // Half submerged car tire

    ctx.fillStyle = 'rgba(0,0,0,0.6)';
    ctx.fillRect(10, 440, 330, 30);
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 14px sans-serif';
    ctx.fillText('CIVIC EVIDENCE: WATERLOGGED ROADWAY', 18, 460);

  } else {
    // Ambiguous: Indoor office desk with mug and laptop (NOT a civic issue)
    ctx.fillStyle = '#f8fafc';
    ctx.fillRect(0, 0, 640, 480);

    // Wooden desk
    ctx.fillStyle = '#d97706';
    ctx.fillRect(0, 280, 640, 200);

    // Laptop
    ctx.fillStyle = '#64748b';
    ctx.fillRect(220, 180, 200, 130);
    ctx.fillStyle = '#94a3b8';
    ctx.fillRect(200, 300, 240, 20);

    // Coffee mug
    ctx.fillStyle = '#3b82f6';
    ctx.beginPath();
    ctx.arc(140, 320, 30, 0, Math.PI * 2);
    ctx.fill();

    // Plant pot
    ctx.fillStyle = '#15803d';
    ctx.beginPath();
    ctx.arc(520, 260, 25, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = 'rgba(0,0,0,0.6)';
    ctx.fillRect(10, 440, 350, 30);
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 14px sans-serif';
    ctx.fillText('TEST IMAGE: INDOOR DESK (AMBIGUOUS TEST)', 18, 460);
  }

  return canvas.toDataURL('image/jpeg', 0.85);
}

export function getDemoPresets(): DemoPreset[] {
  return [
    {
      id: 'preset-pothole',
      name: 'Road Pothole',
      category: 'pothole',
      suggestedArea: 'Navrangpura',
      title: 'Crater on C.G. Road',
      description: 'Dangerous pothole approximately 2 feet wide near Commerce Six Roads junction.',
      dataUrl: createPresetDataUrl('pothole'),
      simulatedGps: {
        latitude: 23.0365,
        longitude: 72.5611,
        formatted: '23.03650°N, 72.56110°E',
      },
    },
    {
      id: 'preset-garbage',
      name: 'Waste Accumulation',
      category: 'garbage',
      suggestedArea: 'Maninagar',
      title: 'Overflowing Waste Dump',
      description: 'Solid plastic and household waste accumulation beside roadside bin near Jawahar Chowk.',
      dataUrl: createPresetDataUrl('garbage'),
      simulatedGps: {
        latitude: 22.9982,
        longitude: 72.5991,
        formatted: '22.99820°N, 72.59910°E',
      },
    },
    {
      id: 'preset-light',
      name: 'Broken Streetlight',
      category: 'streetlight',
      suggestedArea: 'Stadium',
      title: 'Dark / Damaged Lamp Post',
      description: 'Streetlight pole with damaged fixture and exposed hanging wire near Sardar Patel Stadium.',
      dataUrl: createPresetDataUrl('streetlight'),
      simulatedGps: {
        latitude: 23.0421,
        longitude: 72.5654,
        formatted: '23.04210°N, 72.56540°E',
      },
    },
    {
      id: 'preset-water',
      name: 'Waterlogging Drain',
      category: 'waterlogging',
      suggestedArea: 'Kankaria',
      title: 'Submerged Roadway',
      description: 'Deep standing monsoon runoff and choked stormwater drain near Kankaria Gate 3.',
      dataUrl: createPresetDataUrl('waterlogging'),
      simulatedGps: {
        latitude: 23.0062,
        longitude: 72.6025,
        formatted: '23.00620°N, 72.60250°E',
      },
    },
    {
      id: 'preset-ambiguous',
      name: 'Ambiguous Photo',
      category: 'ambiguous',
      suggestedArea: 'Navrangpura',
      title: 'Indoor Object (Gate Test)',
      description: 'Indoor table photo designed to verify confidence gating and prevent false municipal filing.',
      dataUrl: createPresetDataUrl('ambiguous'),
    },
  ];
}
