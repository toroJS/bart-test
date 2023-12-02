import {
  Component,
  ElementRef,
  ViewChild,
  AfterViewInit,
  ChangeDetectionStrategy,
  Input,
  OnDestroy,
} from '@angular/core';
import { Subject, takeUntil } from 'rxjs';
import Zdog from 'zdog';
import confetti from 'canvas-confetti';

@Component({
  selector: 'app-balloon',
  standalone: true,
  template: `
    <div class="canvas-wrapper">
      <canvas #shadowCanvas class="shadow-canvas"></canvas>
      <canvas #ballonCanvas class="balloon-canvas"></canvas>
      <canvas #canvasConfetti class="confetti-canvas"></canvas>
    </div>
  `,
  styles: [
    `
      .canvas-wrapper {
        position: relative;
        width: 300px;
        height: 300px;
        background: #ccffdd;
      }
      .shadow-canvas {
        position: relative;
        display: block;
        width: 100%;
        height: 100%;
      }
      .balloon-canvas {
        position: absolute;
        top: 0;
        left: 0;
        display: block;
        width: 100%;
        height: 100%;
      }
      .confetti-canvas {
        position: absolute;
        top: 0;
        left: 0;
        display: block;
        width: 100%;
        height: 100%;
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BalloonComponent implements AfterViewInit, OnDestroy {
  @Input() public set size(size: number) {
    this.growStream$.next(size);
  }
  @Input() public set burst(burst: boolean) {
    console.log(burst);
    this.burstStream$.next(burst);
  }
  @ViewChild('shadowCanvas')
  private shadowCanvasRef!: ElementRef<HTMLCanvasElement>;
  @ViewChild('ballonCanvas')
  private balloonCanvasRef!: ElementRef<HTMLCanvasElement>;
  @ViewChild('canvasConfetti')
  private canvasConfettiRef!: ElementRef<HTMLCanvasElement>;

  private readonly TAU = Zdog.TAU;
  private readonly cycleCount = 180;
  private ticker = 0;
  private isSpinning = true;
  private balloonCanvas!: Zdog.Illustration;
  private shadowCanvas!: Zdog.Illustration;
  private explosionCanvas!: any;
  private balloonAnchor!: Zdog.Anchor;
  private shadow!: Zdog.Ellipse;
  private shadowAnchor!: Zdog.Anchor;
  private growStream$ = new Subject<number>();
  private burstStream$ = new Subject<boolean>();
  private destroy$ = new Subject<void>();

  // Color
  private mainColor = '#ea173a';
  private shadowColor = '#750B1D';
  private threadColor = '#636';
  private backgroundShadowColor = '#99BFA5';
  // Dimensions
  private balloonDiameter = 80;
  private growthFactor = 1.05;
  // Animations
  private readonly rotateKeyframes = [
    { x: 0, y: 0 },
    { x: -this.TAU * 0.05, y: this.TAU * 0.1 },
    { x: 0, y: 0 },
  ];
  private readonly translateKeyframes = [
    { x: 0, y: -10 },
    { x: 0, y: 10 },
    { x: 0, y: -10 },
  ];
  private readonly scaleKeyframes = [
    { x: 1, y: 1 },
    { x: 1.2, y: 1.2 },
    { x: 1, y: 1 },
  ];
  // Explosion
  private particlesDefaults = {
    spread: 360,
    ticks: 50,
    gravity: 0,
    decay: 0.94,
    startVelocity: 10,
    colors: [this.mainColor, this.shadowColor],
  };

  ngAfterViewInit(): void {
    this.initializeIllustration();
    this.drawIllustration();
    this.startAnimation();
    this.handleBalloonState();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
  }

  private initializeIllustration(): void {
    this.shadowCanvas = new Zdog.Illustration({
      element: this.shadowCanvasRef.nativeElement,
      resize: true,
      onResize: this.handleResize.bind(this),
    });
    this.balloonCanvas = new Zdog.Illustration({
      element: this.balloonCanvasRef.nativeElement,
      resize: true,
      onResize: this.handleResize.bind(this),
    });
    this.explosionCanvas = confetti.create(
      this.canvasConfettiRef.nativeElement,
      {
        resize: true,
        useWorker: true,
      }
    );
  }

  private handleResize(width: number, height: number): void {
    const displaySize = Math.min(width, height);
    const zoom = Math.floor(displaySize / 300);
    // this.illo.zoom = zoom;
  }

  private drawIllustration(): void {
    // --- Build Shadow ---
    this.shadowAnchor = new Zdog.Anchor({
      addTo: this.shadowCanvas,
      translate: { x: 0, y: 110 },
    });
    this.shadow = new Zdog.Ellipse({
      addTo: this.shadowAnchor,
      diameter: this.balloonDiameter - 15,
      fill: true,
      color: this.backgroundShadowColor,
      rotate: { x: this.TAU / 3, y: 0, z: 0 },
    });
    // --- Build Balloon ---
    this.balloonAnchor = new Zdog.Anchor({
      addTo: this.balloonCanvas,
      translate: { x: 0, y: 0 },
    });
    new Zdog.Hemisphere({
      diameter: this.balloonDiameter,
      addTo: this.balloonAnchor,
      color: this.mainColor,
      backface: this.shadowColor,
      stroke: false,
    }).copy({
      rotate: { y: this.TAU / 2 },
      color: this.shadowColor,
      backface: this.mainColor,
    });
    // --- Build Tail ----
    new Zdog.Ellipse({
      addTo: this.balloonAnchor,
      diameter: 10,
      stroke: 5,
      color: this.mainColor,
      translate: { x: 0, y: 40 },
      rotate: { x: this.TAU / 4, y: 0, z: 0 },
    });

    let tail = new Zdog.Group({
      addTo: this.balloonAnchor,
    });
    new Zdog.Shape({
      addTo: tail,
      path: [
        { x: 0, y: 40 },
        { x: 0, y: 60 },
      ],
      stroke: 4,
      color: this.threadColor,
    });
    new Zdog.Shape({
      addTo: tail,
      path: [
        { x: 0, y: 65 },
        { x: 0, y: 68 },
      ],
      stroke: 4,
      color: this.threadColor,
    });
    new Zdog.Shape({
      addTo: tail,
      path: [
        { x: 0, y: 74 },
        { x: 0, y: 75 },
      ],
      stroke: 4,
      color: this.threadColor,
    });
  }

  private startAnimation(): void {
    const animate = () => {
      this.updateAnimation();
      this.shadowCanvas.updateRenderGraph();
      this.balloonCanvas.updateRenderGraph();
      requestAnimationFrame(animate);
    };
    animate();
  }

  private updateAnimation(): void {
    if (!this.isSpinning) return;
    const turnLimit = this.rotateKeyframes.length - 1;
    const progress = this.ticker / this.cycleCount;
    const tween = Zdog.easeInOut(progress % 1, 4);
    const turn = Math.floor(progress % turnLimit);

    this.interpolateKeyframes(this.rotateKeyframes, turn, tween, (value) =>
      this.balloonAnchor.rotate.set(value)
    );
    this.interpolateKeyframes(this.translateKeyframes, turn, tween, (value) =>
      this.balloonAnchor.translate.set(value)
    );
    this.interpolateKeyframes(this.scaleKeyframes, turn, tween, (value) =>
      this.shadow.scale.set(value)
    );
    this.ticker++;
  }

  private handleBalloonState(): void {
    // --- Handle Burst ---
    this.burstStream$
      .pipe(takeUntil(this.destroy$))
      .subscribe((burst: boolean) => {
        if (burst) {
          this.balloonAnchor.remove();
          this.shadowAnchor.remove();
          this.shootParticles();
        } else {
          this.balloonCanvas.addChild(this.balloonAnchor);
          this.shadowCanvas.addChild(this.shadowAnchor);
        }
      });
    // --- Handle Growth ---
    this.growStream$
      .pipe(takeUntil(this.destroy$))
      .subscribe((size: number) => {
        let newScale = Math.pow(this.growthFactor, size - 1);
        this.shadowAnchor.scale.set({ x: newScale, y: newScale, z: newScale });
        this.balloonAnchor.scale.set({ x: newScale, y: newScale, z: newScale });
      });
  }

  private shootParticles() {
    this.explosionCanvas({
      ...this.particlesDefaults,
      particleCount: 50,
    });
    this.explosionCanvas({
      ...this.particlesDefaults,
      particleCount: 50,
      shapes: ['circle'],
    });
  }

  private interpolateKeyframes(
    keyframes: Array<{ x: number; y: number }>,
    turn: number,
    tween: number,
    apply: (value: Zdog.Vector) => void
  ): void {
    const keyA = keyframes[turn];
    const keyB = keyframes[turn + 1] || keyframes[0]; // Loop back to the first keyframe if necessary
    const interpolatedValue = new Zdog.Vector({
      x: Zdog.lerp(keyA.x, keyB.x, tween),
      y: Zdog.lerp(keyA.y, keyB.y, tween),
    });

    apply(interpolatedValue);
  }
}
