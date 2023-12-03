import {
  Component,
  ElementRef,
  ViewChild,
  AfterViewInit,
  ChangeDetectionStrategy,
  Input,
  OnDestroy,
  ViewEncapsulation,
} from '@angular/core';
import {
  BehaviorSubject,
  Observable,
  Subject,
  takeUntil,
  withLatestFrom,
} from 'rxjs';
import Zdog from 'zdog';
import confetti from 'canvas-confetti';

export type BalloonEmotion =
  | 'collect'
  | 'inflate'
  | 'explode'
  | 'new'
  | 'empty';

@Component({
  selector: 'app-balloon',
  standalone: true,
  template: `
    <div class="canvasWrapper">
      <canvas #shadowCanvas class="shadowCanvas"></canvas>
      <canvas #ballonCanvas class="balloonCanvas"></canvas>
      <canvas #confettiCanvas class="confettiCanvas"></canvas>
      <div #emotionCanvas class="emotionCanvas"></div>
    </div>
  `,
  styles: [
    `
      .canvasWrapper {
        position: relative;
        width: 100%;
        height: 100%;
        min-width: 300px;
        min-height: 300px;
      }
      .shadowCanvas,
      .balloonCanvas,
      .confettiCanvas,
      .emotionCanvas {
        position: absolute;
        top: 0;
        left: 0;
        display: block;
        width: 100%;
        height: 100%;
      }
      .emotionCanvas {
        display: flex;
        justify-content: flex-start;
        align-items: flex-start;
      }
      .emotionCanvas > p {
        padding-right: 18px;
        font-size: 70px;
        font-weight: bold;
        color: black;
        font-family: 'sans-serif';
      }
      @keyframes moneyAnimation {
        0% {
          opacity: 1;
          bottom: 0;
        }
        100% {
          opacity: 0;
          bottom: 20%;
        }
      }
      .moneyAnimation {
        animation: moneyAnimation 1s forwards;
        position: absolute;
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
})
export class BalloonComponent implements AfterViewInit, OnDestroy {
  @Input() public set size(size: number) {
    this.growStream$.next(size);
  }
  @Input() public set emotion(emotion$: Observable<BalloonEmotion>) {
    this.emotionStream$ = emotion$;
  }
  @ViewChild('shadowCanvas')
  private shadowCanvasRef!: ElementRef<HTMLCanvasElement>;
  @ViewChild('ballonCanvas')
  private balloonCanvasRef!: ElementRef<HTMLCanvasElement>;
  @ViewChild('confettiCanvas')
  private canvasConfettiRef!: ElementRef<HTMLCanvasElement>;
  @ViewChild('emotionCanvas')
  private emotionCanvasRef!: ElementRef<HTMLCanvasElement>;

  private readonly TAU = Zdog.TAU;
  private readonly cycleCount = 180;

  private ticker = 0;
  private balloonCanvas!: Zdog.Illustration;
  private shadowCanvas!: Zdog.Illustration;
  private explosionCanvas!: any;

  private balloonAnchor!: Zdog.Anchor;
  private shadow!: Zdog.Ellipse;
  private shadowAnchor!: Zdog.Anchor;
  private currEmotion!: BalloonEmotion;

  private growStream$ = new BehaviorSubject<number>(0);
  private emotionStream$ = new Observable<BalloonEmotion>();
  private destroy$ = new Subject<void>();

  // Color
  private mainColor = '#ea173a';
  private shadowColor = '#750B1D';
  private threadColor = '#636';
  private backgroundShadowColor = '#C9C9CA';
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
    { x: 0, y: -20 },
    { x: 0, y: 10 },
    { x: 0, y: -20 },
  ];
  private readonly scaleKeyframes = [
    { x: 1, y: 1 },
    { x: 1.2, y: 1.2 },
    { x: 1, y: 1 },
  ];
  private readonly fullRotateKeyframes = [
    { x: 0, y: 0 },
    { x: 0, y: this.TAU },
    { x: 0, y: this.TAU },
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
    const turnLimit = this.rotateKeyframes.length - 1;
    const progress = this.ticker / this.cycleCount;
    const tween = Zdog.easeInOut(progress % 1, 4);
    const turn = Math.floor(progress % turnLimit);

    if (this.currEmotion !== 'collect') {
      this.interpolateKeyframes(this.rotateKeyframes, turn, tween, (value) =>
        this.balloonAnchor.rotate.set(value)
      );
    } else {
      this.interpolateKeyframes(
        this.fullRotateKeyframes,
        turn,
        tween,
        (value) => this.balloonAnchor.rotate.set(value)
      );
    }
    // Animate bounce
    this.interpolateKeyframes(this.translateKeyframes, turn, tween, (value) =>
      this.balloonAnchor.translate.set(value)
    );
    // Animate shadow
    this.interpolateKeyframes(this.scaleKeyframes, turn, tween, (value) =>
      this.shadow.scale.set(value)
    );

    this.ticker++;
  }

  private handleBalloonState(): void {
    this.emotionStream$
      .pipe(withLatestFrom(this.growStream$), takeUntil(this.destroy$))
      .subscribe(([emotion, size]) => {
        this.currEmotion = emotion;
        this.updateBalloonSize(size);
        this.handleEmotion(emotion);
      });
  }

  private updateBalloonSize(size: number): void {
    const newScale = Math.pow(this.growthFactor, size - 1);
    this.setAnchorScale(this.shadowAnchor, newScale);
    this.setAnchorScale(this.balloonAnchor, newScale);
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

  private textAnimation(char: string): void {
    const moneyAnimation = document.createElement('p');
    moneyAnimation.innerHTML = char;
    this.emotionCanvasRef.nativeElement.appendChild(moneyAnimation);
    moneyAnimation.classList.add('moneyAnimation'); // Add the class that animates
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

  private handleEmotion(emotion: BalloonEmotion) {
    switch (emotion) {
      case 'collect':
        this.textAnimation('💰');
        break;
      case 'inflate':
        this.textAnimation('🌬️');
        break;
      case 'explode':
        this.removeBalloonFromCanvas();
        this.shootParticles();
        this.textAnimation('😢');
        break;
      case 'new':
        this.updateBalloonSize(0);
        this.addBalloonToCanvas();
        break;
      default:
        this.textAnimation('');
        break;
    }
  }

  private setAnchorScale(anchor: Zdog.Anchor, scale: number): void {
    anchor.scale.set({ x: scale, y: scale, z: scale });
  }

  private addBalloonToCanvas(): void {
    this.balloonCanvas.addChild(this.balloonAnchor);
    this.shadowCanvas.addChild(this.shadowAnchor);
  }

  private removeBalloonFromCanvas(): void {
    this.balloonAnchor.remove();
    this.shadowAnchor.remove();
  }
}
