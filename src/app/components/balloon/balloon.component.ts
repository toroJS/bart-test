import {
  Component,
  ElementRef,
  ViewChild,
  AfterViewInit,
  ChangeDetectionStrategy,
  Input,
  OnDestroy,
  ViewEncapsulation,
  Output,
  EventEmitter,
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
import gsap from 'gsap';

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
    <div #wrapper class="canvasWrapper">
      <canvas #shadowCanvas class="shadowCanvas"></canvas>
      <canvas #ballonCanvas class="balloonCanvas"></canvas>
      <canvas #confettiCanvas class="confettiCanvas"></canvas>
      <div #emotionCanvas class="emotionCanvas"></div>
    </div>
  `,
  styleUrl: './balloon.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
})
export class BalloonComponent implements AfterViewInit, OnDestroy {
  @Input() public set size(size: number) {
    this.growStream$.next(size + 1); // Score starts at 0 but this is equivalent to the first size
  }
  @Input() public set emotion(emotion$: Observable<BalloonEmotion>) {
    this.emotionStream$ = emotion$;
  }
  @Output() public animationInProgress$ = new EventEmitter<boolean>();

  @ViewChild('wrapper')
  private wrapperRef!: ElementRef<HTMLElement>;
  @ViewChild('shadowCanvas')
  private shadowCanvasRef!: ElementRef<HTMLCanvasElement>;
  @ViewChild('ballonCanvas')
  private balloonCanvasRef!: ElementRef<HTMLCanvasElement>;
  @ViewChild('confettiCanvas')
  private canvasConfettiRef!: ElementRef<HTMLCanvasElement>;
  @ViewChild('emotionCanvas')
  private emotionCanvasRef!: ElementRef<HTMLCanvasElement>;

  private readonly TAU = Zdog.TAU;

  private balloonCanvas!: Zdog.Illustration;
  private shadowCanvas!: Zdog.Illustration;
  private explosionCanvas!: any;

  private mainAnchor!: Zdog.Anchor;
  private balloonAnchor!: Zdog.Anchor;
  private shadowAnchor!: Zdog.Anchor;
  private shadow!: Zdog.Ellipse;
  private balloonEllipseA!: Zdog.Ellipse;
  private balloonEllipseB!: Zdog.Ellipse;

  private growStream$ = new BehaviorSubject<number>(1);
  private emotionStream$ = new Observable<BalloonEmotion>();
  private destroy$ = new Subject<void>();

  // Color
  private mainColor = '#ea173a';
  private inflateColor = '#ea3f5b';
  private shadowColor = '#750B1D';
  private backColor = '#3d060f';
  private inflateShadowColor = '#75222f';
  private threadColor = '#636';
  private backgroundShadowColor = '#C9C9CA';
  // Dimensions
  private balloonDiameter = 50;
  private growthFactor = 1.06;
  // Animations
  private animationObject = {
    translateX: 0,
    translateY: -20,
    rotateX: -this.TAU * 0.05,
    rotateY: this.TAU * 0.1,
    scaleX: 1,
    scaleY: 1,
  };
  private inflateAnimationObject = {
    ellipseATranslateZ: 0,
    ellipseBTranslateZ: 0,
    ellipseAColor: this.mainColor,
    ellipseBColor: this.shadowColor,
  };

  private balloonHoverAnimation = gsap
    .timeline({ repeat: -1 })
    .to(this.animationObject, {
      translateY: 10,
      rotateX: -this.TAU * 0.05,
      rotateY: this.TAU * 0.2,
      scaleX: 1.2,
      scaleY: 1.2,
    })
    .to(this.animationObject, { ...this.animationObject });

  private balloonInflateAnimation = gsap
    .timeline({ repeat: 0 })
    .to(this.inflateAnimationObject, {
      ellipseATranslateZ: 4,
      ellipseBTranslateZ: -4,
      ellipseAColor: this.inflateColor,
      ellipseBColor: this.inflateShadowColor,
    })
    .to(this.inflateAnimationObject, { ...this.inflateAnimationObject })
    .eventCallback('onStart', () => {
      this.animationInProgress$.emit(true);
    })
    .eventCallback('onComplete', () => {
      this.animationInProgress$.emit(false);
    })
    .pause();

  private balloonCollectAnimation = gsap
    .timeline({ repeat: 0 })
    .to(this.animationObject, {
      rotateY: this.TAU * 1.1,
    })
    .eventCallback('onStart', () => {
      this.animationInProgress$.emit(true);
    })
    .eventCallback('onComplete', () => {
      this.animationInProgress$.emit(false);
      this.balloonHoverAnimation.play();
    })
    .pause();

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
    this.animationInProgress$.emit(false);
  }

  ngOnDestroy(): void {
    this.destroy$.next();
  }

  private initializeIllustration(): void {
    this.shadowCanvas = new Zdog.Illustration({
      element: this.shadowCanvasRef.nativeElement,
      resize: true,
    });
    this.balloonCanvas = new Zdog.Illustration({
      element: this.balloonCanvasRef.nativeElement,
      resize: true,
    });
    this.explosionCanvas = confetti.create(
      this.canvasConfettiRef.nativeElement,
      {
        resize: true,
        useWorker: true,
      }
    );
  }

  private drawIllustration(): void {
    /*
    mainAnchor
    ├── balloonAnchor
    │   ├── balloon
    │   │   ├── ellipseA
    │   │   └── ellipseB
    │   └── tail
    │       ├── ellipse
    │       ├── shape
    │       ├── shape
    │       └── shape
    └── shadowAnchor
        └── shadow
    */
    this.mainAnchor = new Zdog.Anchor({
      addTo: this.balloonCanvas,
    });
    // --- Build Balloon ---
    this.balloonAnchor = new Zdog.Anchor({
      addTo: this.mainAnchor,
      translate: {
        x: this.animationObject.translateX,
        y: this.animationObject.translateY,
      },
    });
    this.balloonEllipseA = new Zdog.Hemisphere({
      diameter: this.balloonDiameter,
      addTo: this.balloonAnchor,
      color: this.inflateAnimationObject.ellipseAColor,
      stroke: false,
      translate: { z: this.inflateAnimationObject.ellipseATranslateZ },
    });

    this.balloonEllipseB = this.balloonEllipseA.copy({
      rotate: { y: this.TAU / 2 },
      color: this.inflateAnimationObject.ellipseBColor,
      backface: this.backColor,
      translate: { z: this.inflateAnimationObject.ellipseBTranslateZ },
    });
    // --- Build Tail ----
    new Zdog.Ellipse({
      addTo: this.balloonAnchor,
      diameter: 10,
      stroke: 7,
      color: this.shadowColor,
      translate: { x: 0, y: this.balloonDiameter / 2 },
      rotate: { x: this.TAU / 4, y: 0, z: 0 },
    });

    let tail = new Zdog.Group({
      addTo: this.balloonAnchor,
      translate: { x: 0, y: -this.balloonDiameter / 2 },
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
    // --- Build Shadow ---
    this.shadowAnchor = new Zdog.Anchor({
      addTo: this.mainAnchor,
    });
    this.shadow = new Zdog.Ellipse({
      addTo: this.shadowAnchor,
      diameter: this.balloonDiameter - 15,
      fill: true,
      color: this.backgroundShadowColor,
      translate: { x: 0, y: this.balloonDiameter + 20 },
      rotate: { x: this.TAU / 3, y: 0, z: 0 },
      scale: {
        x: this.animationObject.scaleX,
        y: this.animationObject.scaleY,
      },
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
    this.balloonAnchor.translate.x = this.animationObject.translateX;
    this.balloonAnchor.translate.y = this.animationObject.translateY;
    this.balloonAnchor.rotate.x = this.animationObject.rotateX;
    this.balloonAnchor.rotate.y = this.animationObject.rotateY;
    this.shadow.scale.x = this.animationObject.scaleX;
    this.shadow.scale.y = this.animationObject.scaleY;
    this.balloonEllipseA.translate.z =
      this.inflateAnimationObject.ellipseATranslateZ;
    this.balloonEllipseB.translate.z =
      this.inflateAnimationObject.ellipseBTranslateZ;
    this.balloonEllipseA.color = this.inflateAnimationObject.ellipseAColor;
    this.balloonEllipseB.color = this.inflateAnimationObject.ellipseBColor;
  }

  private handleBalloonState(): void {
    this.emotionStream$
      .pipe(withLatestFrom(this.growStream$), takeUntil(this.destroy$))
      .subscribe(([emotion, size]) => {
        this.updateBalloonSize(size);
        this.handleEmotion(emotion);
      });
  }

  private updateBalloonSize(size: number): void {
    const newScale = Math.pow(this.growthFactor, size - 1);
    this.mainAnchor.scale.set({ x: newScale, y: newScale, z: newScale });
  }

  private shootParticles() {
    this.explosionCanvas({
      ...this.particlesDefaults,
      particleCount: 10 * this.growStream$.getValue(),
    });
    this.explosionCanvas({
      ...this.particlesDefaults,
      particleCount: 10 * this.growStream$.getValue(),
      shapes: ['circle'],
    });
  }

  private textAnimation(char: string): void {
    const moneyAnimation = document.createElement('p');
    moneyAnimation.innerHTML = char;
    this.emotionCanvasRef.nativeElement.appendChild(moneyAnimation);
    moneyAnimation.classList.add('moneyAnimation'); // Add the class that animates
  }

  private handleEmotion(emotion: BalloonEmotion) {
    switch (emotion) {
      case 'collect':
        this.textAnimation('💰');
        this.balloonHoverAnimation.pause();
        this.balloonCollectAnimation.play(0);
        break;
      case 'inflate':
        this.textAnimation('🌬️');
        this.balloonInflateAnimation.play(0);
        break;
      case 'explode':
        this.hideItemsInCanvas();
        this.shootParticles();
        this.textAnimation('😢');
        break;
      case 'new':
        this.updateBalloonSize(0);
        this.showItemsInCanvas();
        break;
      default:
        this.textAnimation('');
        break;
    }
  }

  private showItemsInCanvas(): void {
    this.mainAnchor.addChild(this.balloonAnchor);
    this.mainAnchor.addChild(this.shadowAnchor);
  }

  private hideItemsInCanvas(): void {
    this.balloonAnchor.remove();
    this.shadowAnchor.remove();
  }
}
