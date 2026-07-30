/**
 * Atelier — Canvas Drawing Engine
 * Animation player for step-by-step drawing demonstrations
 * + Free-draw canvas with tools
 */

const CanvasDraw = (() => {

  // ===== STROKE DEFINITIONS =====
  // Pre-defined drawing demonstrations as step-by-step stroke data
  const DEMONSTRATIONS = {
    'box-perspective': {
      id: 'box-perspective',
      title: 'Drawing a Box in 2-Point Perspective',
      description: 'Learn to draw a cube using two-point perspective',
      canvasWidth: 800,
      canvasHeight: 600,
      steps: [
        { type: 'text', x: 400, y: 350, content: 'Step 1: Draw the horizon line', font: '16px sans-serif', color: '#666', duration_ms: 1200 },
        { type: 'line', from: [100, 350], to: [700, 350], color: '#4477bb', width: 2, duration_ms: 1000 },
        { type: 'text', x: 200, y: 320, content: 'VP1', font: '14px sans-serif', color: '#666', duration_ms: 600 },
        { type: 'line', from: [200, 348], to: [200, 340], color: '#bb4444', width: 1, duration_ms: 400 },
        { type: 'text', x: 550, y: 320, content: 'VP2', font: '14px sans-serif', color: '#666', duration_ms: 600 },
        { type: 'line', from: [550, 348], to: [550, 340], color: '#bb4444', width: 1, duration_ms: 400 },
        { type: 'text', x: 370, y: 150, content: 'Step 2: Draw the closest vertical edge', font: '16px sans-serif', color: '#666', duration_ms: 1200 },
        { type: 'line', from: [380, 280], to: [380, 420], color: '#333', width: 3, duration_ms: 1000 },
        { type: 'text', x: 340, y: 470, content: 'Step 3: Connect top to VP1 and VP2', font: '16px sans-serif', color: '#666', duration_ms: 1200 },
        { type: 'line', from: [380, 280], to: [200, 300], color: '#888', width: 1.5, duration_ms: 800, dashed: true },
        { type: 'line', from: [380, 280], to: [550, 310], color: '#888', width: 1.5, duration_ms: 800, dashed: true },
        { type: 'text', x: 340, y: 500, content: 'Step 4: Connect bottom to VP1 and VP2', font: '16px sans-serif', color: '#666', duration_ms: 1200 },
        { type: 'line', from: [380, 420], to: [200, 440], color: '#888', width: 1.5, duration_ms: 800, dashed: true },
        { type: 'line', from: [380, 420], to: [550, 430], color: '#888', width: 1.5, duration_ms: 800, dashed: true },
        { type: 'text', x: 340, y: 530, content: 'Step 5: Add the back vertical edges', font: '16px sans-serif', color: '#666', duration_ms: 1200 },
        { type: 'line', from: [200, 300], to: [200, 440], color: '#555', width: 2.5, duration_ms: 800 },
        { type: 'line', from: [550, 310], to: [550, 430], color: '#555', width: 2.5, duration_ms: 800 },
        { type: 'text', x: 340, y: 560, content: 'Step 6: Complete the box — connect back top edge', font: '16px sans-serif', color: '#666', duration_ms: 1200 },
        { type: 'line', from: [200, 300], to: [550, 310], color: '#333', width: 2, duration_ms: 800 },
        { type: 'line', from: [200, 440], to: [550, 430], color: '#333', width: 2, duration_ms: 800 },
        { type: 'text', x: 370, y: 200, content: 'Step 7: Shade visible faces', font: '16px sans-serif', color: '#666', duration_ms: 1200 },
        { type: 'fill', path: [[380,280],[200,300],[200,440],[380,420]], color: 'rgba(200,200,220,0.2)', duration_ms: 600 },
        { type: 'fill', path: [[380,280],[550,310],[550,430],[380,420]], color: 'rgba(180,180,200,0.15)', duration_ms: 600 },
        { type: 'hatch', area: {x: 280, y: 320, w: 60, h: 80}, angle: 45, spacing: 6, color: 'rgba(100,100,130,0.3)', width: 0.5, duration_ms: 1500 },
        { type: 'text', x: 370, y: 120, content: '✓ Complete! A box in 2-point perspective', font: '18px sans-serif', color: '#34d399', duration_ms: 1500 },
      ]
    },

    'sphere-shading': {
      id: 'sphere-shading',
      title: 'Shading a Sphere',
      description: 'Learn how to shade a sphere with proper values',
      canvasWidth: 800,
      canvasHeight: 600,
      steps: [
        { type: 'text', x: 400, y: 100, content: 'Step 1: Draw a perfect circle', font: '16px sans-serif', color: '#666', duration_ms: 1200 },
        { type: 'ellipse', center: [400, 320], rx: 120, ry: 120, color: '#333', width: 2.5, duration_ms: 1500 },
        { type: 'text', x: 400, y: 530, content: 'Step 2: Mark the light source direction', font: '16px sans-serif', color: '#666', duration_ms: 1200 },
        { type: 'line', from: [550, 150], to: [510, 230], color: '#f0a832', width: 2, duration_ms: 600 },
        { type: 'text', x: 555, y: 145, content: '☀️ Light', font: '14px sans-serif', color: '#f0a832', duration_ms: 500 },
        { type: 'text', x: 400, y: 560, content: 'Step 3: Add core shadow (darkest area)', font: '16px sans-serif', color: '#666', duration_ms: 1200 },
        { type: 'ellipse', center: [430, 340], rx: 45, ry: 60, color: '#555', width: 2, duration_ms: 1200 },
        { type: 'hatch', area: {x: 400, y: 300, w: 70, h: 80}, angle: 30, spacing: 4, color: 'rgba(80,80,80,0.5)', width: 0.5, duration_ms: 1500 },
        { type: 'text', x: 400, y: 590, content: 'Step 4: Add cast shadow on ground', font: '16px sans-serif', color: '#666', duration_ms: 1200 },
        { type: 'ellipse', center: [440, 470], rx: 90, ry: 25, color: '#777', width: 1.5, duration_ms: 1000 },
        { type: 'fill', path: [[360,460],[520,460],[530,480],[350,480]], color: 'rgba(100,100,100,0.2)', duration_ms: 600 },
        { type: 'text', x: 400, y: 80, content: 'Step 5: Add mid-tones and blend', font: '16px sans-serif', color: '#666', duration_ms: 1200 },
        { type: 'ellipse', center: [380, 310], rx: 100, ry: 100, color: 'rgba(200,200,200,0.1)', width: 0, duration_ms: 400 },
        { type: 'fill', path: [[280,320],[380,240],[380,320]], color: 'rgba(220,220,230,0.08)', duration_ms: 600 },
        { type: 'hatch', area: {x: 300, y: 250, w: 60, h: 80}, angle: -30, spacing: 5, color: 'rgba(180,180,200,0.2)', width: 0.5, duration_ms: 1500 },
        { type: 'text', x: 370, y: 60, content: '✓ Sphere shading complete!', font: '18px sans-serif', color: '#34d399', duration_ms: 1500 },
      ]
    },

    'table-shading': {
      id: 'table-shading',
      title: 'Drawing a Table with Shading',
      description: 'Draw a wooden table with perspective and shading',
      canvasWidth: 800,
      canvasHeight: 600,
      steps: [
        { type: 'text', x: 400, y: 80, content: 'Step 1: Draw the tabletop (perspective rectangle)', font: '16px sans-serif', color: '#666', duration_ms: 1200 },
        { type: 'line', from: [200, 250], to: [600, 220], color: '#333', width: 2.5, duration_ms: 800 },
        { type: 'line', from: [600, 220], to: [650, 320], color: '#333', width: 2.5, duration_ms: 800 },
        { type: 'line', from: [650, 320], to: [250, 350], color: '#333', width: 2.5, duration_ms: 800 },
        { type: 'line', from: [250, 350], to: [200, 250], color: '#333', width: 2.5, duration_ms: 800 },
        { type: 'text', x: 400, y: 480, content: 'Step 2: Add the front two legs', font: '16px sans-serif', color: '#666', duration_ms: 1200 },
        { type: 'line', from: [220, 258], to: [220, 480], color: '#444', width: 3, duration_ms: 800 },
        { type: 'line', from: [630, 228], to: [630, 480], color: '#444', width: 3, duration_ms: 800 },
        { type: 'text', x: 400, y: 510, content: 'Step 3: Add the back legs (shorter, perspective)', font: '16px sans-serif', color: '#666', duration_ms: 1200 },
        { type: 'line', from: [260, 340], to: [260, 450], color: '#666', width: 2.5, duration_ms: 700 },
        { type: 'line', from: [590, 310], to: [590, 430], color: '#666', width: 2.5, duration_ms: 700 },
        { type: 'fill', path: [[220,480],[630,480],[590,430],[260,450]], color: 'rgba(180,160,130,0.1)', duration_ms: 500 },
        { type: 'text', x: 400, y: 540, content: 'Step 4: Add table edge thickness', font: '16px sans-serif', color: '#666', duration_ms: 1200 },
        { type: 'line', from: [200, 250], to: [200, 265], color: '#555', width: 2, duration_ms: 500 },
        { type: 'line', from: [600, 220], to: [600, 235], color: '#555', width: 2, duration_ms: 500 },
        { type: 'line', from: [200, 265], to: [600, 235], color: '#555', width: 2, duration_ms: 600 },
        { type: 'text', x: 400, y: 570, content: 'Step 5: Add cross-hatch shading to legs', font: '16px sans-serif', color: '#666', duration_ms: 1200 },
        { type: 'hatch', area: {x: 220, y: 350, w: 15, h: 130}, angle: 10, spacing: 5, color: 'rgba(100,80,60,0.4)', width: 0.5, duration_ms: 1500 },
        { type: 'hatch', area: {x: 625, y: 320, w: 15, h: 160}, angle: 10, spacing: 5, color: 'rgba(100,80,60,0.4)', width: 0.5, duration_ms: 1500 },
        { type: 'text', x: 400, y: 600, content: 'Step 6: Shade the tabletop edge', font: '16px sans-serif', color: '#666', duration_ms: 1200 },
        { type: 'hatch', area: {x: 210, y: 260, w: 380, h: 10}, angle: 0, spacing: 4, color: 'rgba(120,100,80,0.3)', width: 0.5, duration_ms: 1200 },
        { type: 'text', x: 370, y: 60, content: '✓ Table drawing complete!', font: '18px sans-serif', color: '#34d399', duration_ms: 1500 },
      ]
    },

    'cylinder': {
      id: 'cylinder',
      title: 'Cylinder Construction',
      description: 'Construct a 3D cylinder with proper ellipses',
      canvasWidth: 800,
      canvasHeight: 600,
      steps: [
        { type: 'text', x: 400, y: 90, content: 'Step 1: Draw the center axis line', font: '16px sans-serif', color: '#666', duration_ms: 1200 },
        { type: 'line', from: [400, 120], to: [400, 480], color: '#888', width: 1.5, duration_ms: 800, dashed: true },
        { type: 'text', x: 400, y: 530, content: 'Step 2: Draw the top ellipse', font: '16px sans-serif', color: '#666', duration_ms: 1200 },
        { type: 'ellipse', center: [400, 180], rx: 100, ry: 35, color: '#333', width: 2.5, duration_ms: 1500 },
        { type: 'text', x: 400, y: 560, content: 'Step 3: Draw the bottom ellipse', font: '16px sans-serif', color: '#666', duration_ms: 1200 },
        { type: 'ellipse', center: [400, 440], rx: 100, ry: 35, color: '#333', width: 2.5, duration_ms: 1500 },
        { type: 'text', x: 400, y: 590, content: 'Step 4: Connect sides with vertical lines', font: '16px sans-serif', color: '#666', duration_ms: 1200 },
        { type: 'line', from: [300, 180], to: [300, 440], color: '#333', width: 2.5, duration_ms: 700 },
        { type: 'line', from: [500, 180], to: [500, 440], color: '#333', width: 2.5, duration_ms: 700 },
        { type: 'text', x: 400, y: 80, content: 'Step 5: Add contour curves for volume', font: '16px sans-serif', color: '#666', duration_ms: 1200 },
        { type: 'curve', points: [[400,180],[340,280],[400,380],[400,440]], color: 'rgba(100,100,100,0.4)', width: 1, duration_ms: 1200 },
        { type: 'curve', points: [[400,180],[460,280],[400,380],[400,440]], color: 'rgba(100,100,100,0.4)', width: 1, duration_ms: 1200 },
        { type: 'text', x: 370, y: 60, content: '✓ Cylinder complete!', font: '18px sans-serif', color: '#34d399', duration_ms: 1500 },
      ]
    },

    'gesture': {
      id: 'gesture',
      title: 'Figure Gesture Drawing',
      description: 'Capture the flow of the human figure',
      canvasWidth: 800,
      canvasHeight: 600,
      steps: [
        { type: 'text', x: 400, y: 80, content: 'Step 1: Draw the line of action', font: '16px sans-serif', color: '#666', duration_ms: 1200 },
        { type: 'curve', points: [[350,100],[330,250],[360,400],[340,550]], color: '#cc4444', width: 2, duration_ms: 1200 },
        { type: 'text', x: 400, y: 110, content: 'Step 2: Add the head (circle)', font: '16px sans-serif', color: '#666', duration_ms: 1200 },
        { type: 'ellipse', center: [350, 120], rx: 25, ry: 30, color: '#444', width: 2, duration_ms: 800 },
        { type: 'text', x: 400, y: 530, content: 'Step 3: Add torso mass (rib cage)', font: '16px sans-serif', color: '#666', duration_ms: 1200 },
        { type: 'ellipse', center: [335, 230], rx: 40, ry: 55, color: '#555', width: 2, duration_ms: 1000 },
        { type: 'text', x: 400, y: 560, content: 'Step 4: Add pelvis (inverted wedge)', font: '16px sans-serif', color: '#666', duration_ms: 1200 },
        { type: 'ellipse', center: [355, 370], rx: 35, ry: 30, color: '#555', width: 2, duration_ms: 900 },
        { type: 'text', x: 400, y: 590, content: 'Step 5: Add limb lines (gestural strokes)', font: '16px sans-serif', color: '#666', duration_ms: 1200 },
        { type: 'line', from: [335, 260], to: [290, 340], color: '#666', width: 2, duration_ms: 600 },
        { type: 'line', from: [290, 340], to: [280, 420], color: '#666', width: 2, duration_ms: 600 },
        { type: 'line', from: [335, 260], to: [400, 320], color: '#666', width: 2, duration_ms: 600 },
        { type: 'line', from: [400, 320], to: [420, 430], color: '#666', width: 2, duration_ms: 600 },
        { type: 'line', from: [355, 390], to: [310, 490], color: '#666', width: 2, duration_ms: 600 },
        { type: 'line', from: [355, 390], to: [410, 500], color: '#666', width: 2, duration_ms: 600 },
        { type: 'text', x: 370, y: 60, content: '✓ Gesture drawing complete!', font: '18px sans-serif', color: '#34d399', duration_ms: 1500 },
      ]
    }
  };

  // ===== ANIMATION PLAYER =====
  class AnimationPlayer {
    constructor(canvasId) {
      this.canvas = document.getElementById(canvasId);
      if (!this.canvas) return;
      this.ctx = this.canvas.getContext('2d');
      this.ctx.lineCap = 'round';
      this.ctx.lineJoin = 'round';

      this.steps = [];
      this.currentStep = 0;
      this.currentProgress = 0; // 0 to 1 within current step
      this.isPlaying = false;
      this.isPaused = false;
      this.speed = 1;
      this.animationId = null;
      this.onStepChange = null;
      this.onComplete = null;
      this.startTime = 0;
      this.completed = false;
    }

    load(demoId) {
      const demo = DEMONSTRATIONS[demoId];
      if (!demo) return false;

      this.steps = demo.steps;
      this.canvas.width = demo.canvasWidth || 800;
      this.canvas.height = demo.canvasHeight || 600;
      this.title = demo.title;
      this.currentStep = 0;
      this.currentProgress = 0;
      this.completed = false;
      this.clear();
      return true;
    }

    clear() {
      this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
      // Draw white background
      this.ctx.fillStyle = '#ffffff';
      this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    }

    play() {
      if (this.completed) {
        this.restart();
        return;
      }
      if (this.isPaused) {
        this.isPaused = false;
        this.isPlaying = true;
        this.startTime = performance.now() - (this.elapsed || 0);
        this._animate();
        return;
      }
      if (this.isPlaying) return;

      this.isPlaying = true;
      this.isPaused = false;
      this.completed = false;
      this.startTime = performance.now();
      this.elapsed = 0;
      this._animate();
    }

    pause() {
      if (this.isPlaying && !this.isPaused) {
        this.isPaused = true;
        if (this.animationId) {
          cancelAnimationFrame(this.animationId);
          this.animationId = null;
        }
      }
    }

    stop() {
      this.isPlaying = false;
      this.isPaused = false;
      this.currentStep = 0;
      this.currentProgress = 0;
      this.completed = false;
      if (this.animationId) {
        cancelAnimationFrame(this.animationId);
        this.animationId = null;
      }
      this.clear();
      this._renderCurrentStep();
    }

    restart() {
      this.stop();
      this.play();
    }

    setSpeed(speed) {
      this.speed = speed;
    }

    getCurrentStep() {
      return {
        index: this.currentStep,
        total: this.steps.length,
        step: this.steps[this.currentStep],
        completed: this.completed
      };
    }

    _animate() {
      if (!this.isPlaying || this.isPaused) return;

      const now = performance.now();
      this.elapsed = (now - this.startTime) * this.speed;

      // Calculate total time up to current step
      let accumulatedTime = 0;
      let stepIndex = 0;

      for (let i = 0; i < this.steps.length; i++) {
        const step = this.steps[i];
        const stepDuration = step.duration_ms || 500;
        if (accumulatedTime + stepDuration > this.elapsed) {
          stepIndex = i;
          this.currentProgress = (this.elapsed - accumulatedTime) / stepDuration;
          break;
        }
        accumulatedTime += stepDuration;
        stepIndex = i;
      }

      if (stepIndex >= this.steps.length - 1 && accumulatedTime >= (this.steps[this.steps.length - 1]?.duration_ms || 500) && this.elapsed >= accumulatedTime) {
        // Animation complete
        this.completed = true;
        this.isPlaying = false;
        this.currentStep = this.steps.length - 1;
        this.currentProgress = 1;
        this._renderAllSteps();
        if (this.onStepChange) this.onStepChange(this.getCurrentStep());
        if (this.onComplete) this.onComplete();
        return;
      }

      if (stepIndex !== this.currentStep) {
        this.currentStep = stepIndex;
        if (this.onStepChange) this.onStepChange(this.getCurrentStep());
      }

      // Render: draw all completed steps fully, current step partially
      this.clear();
      for (let i = 0; i < stepIndex; i++) {
        this._drawStep(this.steps[i], 1);
      }

      // Draw current step partially
      if (this.steps[stepIndex]) {
        this._drawStep(this.steps[stepIndex], this.currentProgress);
      }

      this.animationId = requestAnimationFrame(() => this._animate());
    }

    _renderCurrentStep() {
      // Draw all steps up to current
      this.clear();
      for (let i = 0; i <= this.currentStep && i < this.steps.length; i++) {
        this._drawStep(this.steps[i], i === this.currentStep ? this.currentProgress : 1);
      }
    }

    _renderAllSteps() {
      this.clear();
      for (let i = 0; i < this.steps.length; i++) {
        this._drawStep(this.steps[i], 1);
      }
    }

    _drawStep(step, progress) {
      const ctx = this.ctx;
      const p = Math.min(1, Math.max(0, progress));

      switch (step.type) {
        case 'line':
          ctx.save();
          ctx.strokeStyle = step.color || '#333';
          ctx.lineWidth = (step.width || 2) * p;
          ctx.beginPath();
          const fx = step.from[0] + (step.to[0] - step.from[0]) * p;
          const fy = step.from[1] + (step.to[1] - step.from[1]) * p;
          ctx.moveTo(step.from[0], step.from[1]);
          ctx.lineTo(fx, fy);
          ctx.stroke();
          ctx.restore();
          break;

        case 'ellipse':
          ctx.save();
          ctx.strokeStyle = step.color || '#333';
          ctx.lineWidth = step.width || 2;
          const endAngle = Math.PI * 2 * p;
          ctx.beginPath();
          ctx.ellipse(step.center[0], step.center[1], step.rx || 30, step.ry || 30, 0, 0, endAngle);
          ctx.stroke();
          ctx.restore();
          break;

        case 'rect':
          ctx.save();
          ctx.strokeStyle = step.color || '#333';
          ctx.lineWidth = step.width || 2;
          const rw = (step.w || 50) * p;
          const rh = (step.h || 50) * p;
          ctx.strokeRect(step.x, step.y, rw, rh);
          ctx.restore();
          break;

        case 'curve':
          ctx.save();
          ctx.strokeStyle = step.color || '#333';
          ctx.lineWidth = step.width || 2;
          ctx.beginPath();
          ctx.moveTo(step.points[0][0], step.points[0][1]);
          const cp1x = step.points[0][0] + (step.points[1][0] - step.points[0][0]) * p;
          const cp1y = step.points[0][1] + (step.points[1][1] - step.points[0][1]) * p;
          const cp2x = step.points[1][0] + (step.points[2][0] - step.points[1][0]) * p;
          const cp2y = step.points[1][1] + (step.points[2][1] - step.points[1][1]) * p;
          const endX = step.points[0][0] + (step.points[3][0] - step.points[0][0]) * p;
          const endY = step.points[0][1] + (step.points[3][1] - step.points[0][1]) * p;
          ctx.bezierCurveTo(cp1x, cp1y, cp2x, cp2y, endX, endY);
          ctx.stroke();
          ctx.restore();
          break;

        case 'fill':
          ctx.save();
          ctx.fillStyle = step.color || 'rgba(200,200,200,0.2)';
          ctx.globalAlpha = p;
          ctx.beginPath();
          if (step.path && step.path.length > 0) {
            ctx.moveTo(step.path[0][0], step.path[0][1]);
            for (let i = 1; i < step.path.length; i++) {
              ctx.lineTo(step.path[i][0], step.path[i][1]);
            }
            ctx.closePath();
            ctx.fill();
          }
          ctx.restore();
          break;

        case 'hatch':
          ctx.save();
          ctx.strokeStyle = step.color || 'rgba(100,100,100,0.3)';
          ctx.lineWidth = step.width || 0.5;
          ctx.globalAlpha = p;

          const area = step.area;
          const spacing = step.spacing || 5;
          const angle = (step.angle || 45) * Math.PI / 180;
          const cos = Math.cos(angle);
          const sin = Math.sin(angle);
          const diag = Math.sqrt(area.w * area.w + area.h * area.h);
          const cx = area.x + area.w / 2;
          const cy = area.y + area.h / 2;
          const numLines = Math.floor(diag / spacing);
          const linesToDraw = Math.floor(numLines * p);

          for (let i = 0; i < linesToDraw; i++) {
            const offset = (i - numLines / 2) * spacing;
            const sx = cx + offset * cos;
            const sy = cy + offset * sin;
            const ex = cx + offset * cos + diag * sin;
            const ey = cy + offset * sin - diag * cos;
            ctx.beginPath();
            ctx.moveTo(sx, sy);
            ctx.lineTo(ex, ey);
            ctx.stroke();
          }
          ctx.restore();
          break;

        case 'text':
          ctx.save();
          ctx.fillStyle = step.color || '#666';
          ctx.font = step.font || '14px sans-serif';
          ctx.globalAlpha = p;
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText(step.content || '', step.x, step.y);
          ctx.restore();
          break;

        case 'clear':
          // Clear is handled by the render loop
          break;

        case 'pause':
          // Pause is just a time delay, no rendering
          break;
      }
    }

    getDemonstrations() {
      return Object.values(DEMONSTRATIONS).map(d => ({
        id: d.id,
        title: d.title,
        description: d.description
      }));
    }

    destroy() {
      if (this.animationId) {
        cancelAnimationFrame(this.animationId);
      }
    }
  }

  // ===== FREE-DRAW CANVAS =====
  class DrawingCanvas {
    constructor(canvasId) {
      this.canvas = document.getElementById(canvasId);
      if (!this.canvas) return;
      this.ctx = this.canvas.getContext('2d');

      this.isDrawing = false;
      this.tool = 'pen';
      this.color = '#333333';
      this.brushSize = 3;
      this.history = [];
      this.historyIndex = -1;
      this.maxHistory = 50;
      this.referenceImage = null;
      this.referenceOpacity = 0.3;

      this._setupEvents();
      this._saveState();
    }

    _setupEvents() {
      const c = this.canvas;

      c.addEventListener('mousedown', (e) => {
        if (this.tool === 'eraser') {
          this.ctx.globalCompositeOperation = 'destination-out';
        } else {
          this.ctx.globalCompositeOperation = 'source-over';
        }
        this.isDrawing = true;
        const pos = this._getPos(e);
        this.ctx.beginPath();
        this.ctx.moveTo(pos.x, pos.y);
      });

      c.addEventListener('mousemove', (e) => {
        if (!this.isDrawing) return;
        const pos = this._getPos(e);
        this.ctx.strokeStyle = this.tool === 'eraser' ? '#ffffff' : this.color;
        this.ctx.lineWidth = this.brushSize;
        this.ctx.lineCap = 'round';
        this.ctx.lineJoin = 'round';
        this.ctx.lineTo(pos.x, pos.y);
        this.ctx.stroke();
      });

      c.addEventListener('mouseup', () => {
        if (this.isDrawing) {
          this.isDrawing = false;
          this.ctx.globalCompositeOperation = 'source-over';
          this._saveState();
        }
      });

      c.addEventListener('mouseleave', () => {
        if (this.isDrawing) {
          this.isDrawing = false;
          this.ctx.globalCompositeOperation = 'source-over';
          this._saveState();
        }
      });

      // Touch support
      c.addEventListener('touchstart', (e) => {
        e.preventDefault();
        const touch = e.touches[0];
        const rect = c.getBoundingClientRect();
        if (this.tool === 'eraser') {
          this.ctx.globalCompositeOperation = 'destination-out';
        } else {
          this.ctx.globalCompositeOperation = 'source-over';
        }
        this.isDrawing = true;
        this.ctx.beginPath();
        this.ctx.moveTo(touch.clientX - rect.left, touch.clientY - rect.top);
      });

      c.addEventListener('touchmove', (e) => {
        e.preventDefault();
        if (!this.isDrawing) return;
        const touch = e.touches[0];
        const rect = c.getBoundingClientRect();
        this.ctx.strokeStyle = this.tool === 'eraser' ? '#ffffff' : this.color;
        this.ctx.lineWidth = this.brushSize;
        this.ctx.lineCap = 'round';
        this.ctx.lineTo(touch.clientX - rect.left, touch.clientY - rect.top);
        this.ctx.stroke();
      });

      c.addEventListener('touchend', () => {
        this.isDrawing = false;
        this.ctx.globalCompositeOperation = 'source-over';
        this._saveState();
      });
    }

    _getPos(e) {
      const rect = this.canvas.getBoundingClientRect();
      return {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top
      };
    }

    _saveState() {
      this.historyIndex++;
      this.history = this.history.slice(0, this.historyIndex);
      this.history.push(this.canvas.toDataURL());
      if (this.history.length > this.maxHistory) {
        this.history.shift();
        this.historyIndex--;
      }
    }

    setTool(tool) {
      this.tool = tool;
    }

    setColor(color) {
      this.color = color;
    }

    setBrushSize(size) {
      this.brushSize = size;
    }

    clearCanvas() {
      this.ctx.globalCompositeOperation = 'source-over';
      this.ctx.fillStyle = '#ffffff';
      this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
      this._drawReference();
      this._saveState();
    }

    undo() {
      if (this.historyIndex > 0) {
        this.historyIndex--;
        const img = new Image();
        img.onload = () => {
          this.ctx.globalCompositeOperation = 'source-over';
          this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
          this.ctx.drawImage(img, 0, 0);
          this._drawReference();
        };
        img.src = this.history[this.historyIndex];
      }
    }

    redo() {
      if (this.historyIndex < this.history.length - 1) {
        this.historyIndex++;
        const img = new Image();
        img.onload = () => {
          this.ctx.globalCompositeOperation = 'source-over';
          this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
          this.ctx.drawImage(img, 0, 0);
          this._drawReference();
        };
        img.src = this.history[this.historyIndex];
      }
    }

    setReferenceImage(url, opacity = 0.3) {
      this.referenceOpacity = opacity;
      if (url) {
        const img = new Image();
        img.crossOrigin = 'anonymous';
        img.onload = () => {
          this.referenceImage = img;
          this._drawReference();
        };
        img.src = url;
      } else {
        this.referenceImage = null;
        this._drawReference();
      }
    }

    _drawReference() {
      if (this.referenceImage) {
        this.ctx.save();
        this.ctx.globalAlpha = this.referenceOpacity;
        this.ctx.drawImage(this.referenceImage, 0, 0, this.canvas.width, this.canvas.height);
        this.ctx.restore();
      }
    }

    getImageDataURL() {
      return this.canvas.toDataURL('image/png');
    }

    getImageBlob(callback) {
      this.canvas.toBlob(callback, 'image/png');
    }

    setup(demoId) {
      const demo = DEMONSTRATIONS[demoId];
      if (!demo) {
        this.canvas.width = 800;
        this.canvas.height = 600;
      } else {
        this.canvas.width = demo.canvasWidth || 800;
        this.canvas.height = demo.canvasHeight || 600;
      }
      this.clearCanvas();
    }
  }

  return {
    AnimationPlayer,
    DrawingCanvas,
    DEMONSTRATIONS
  };
})();