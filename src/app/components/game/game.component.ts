import { Component, OnDestroy } from '@angular/core';
import { GameService } from './game.service';
import { CommonModule } from '@angular/common';
import { BalloonComponent, BalloonEmotion } from '../balloon/balloon.component';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatCardModule } from '@angular/material/card';
import { BehaviorSubject, delay } from 'rxjs';
import { Subject, debounceTime, map, takeUntil, tap } from 'rxjs';
import { AUDIO, AudioService } from '../audio/audio.service';

enum ACTION {
  PUMP = 'pump',
  COLLECT = 'collect',
  NEXT_ROUND = 'next_round',
}

@Component({
  selector: 'app-game',
  standalone: true,
  templateUrl: './game.component.html',
  styleUrl: './game.component.scss',
  imports: [
    CommonModule,
    MatButtonModule,
    MatIconModule,
    BalloonComponent,
    MatProgressBarModule,
    MatCardModule,
  ],
})
export class GameComponent implements OnDestroy {
  private destroy$ = new Subject<void>();
  private clickSubject = new Subject<ACTION>();
  public ACTIONTYPE = ACTION;
  public disable = false;
  public totalRounds: number = 0;

  round$ = this.gameService.round$;
  roundEnd$ = this.gameService.roundEnd$;
  progress$ = this.gameService.round$.pipe(
    map((round) => {
      const totalRounds = this.gameService.maxRound;
      const porcentage = (round * 100) / totalRounds;
      return porcentage;
    })
  );
  gameEnd$ = this.gameService.gameEnd$;
  balloonSize$ = this.gameService.balloonSize$;
  totalPoints$ = this.gameService.totalPoints$;
  burts$ = this.gameService.burst$.pipe(
    delay(500),
    tap((burst) => {
      if (burst) {
        this.emotionSubject.next('explode');
        this.audioService.playSound(AUDIO.BURST);
      }
    })
  );
  emotionSubject = new BehaviorSubject<BalloonEmotion>('empty');
  emotion$ = this.emotionSubject.asObservable();
  username = this.gameService.user;

  constructor(
    private gameService: GameService,
    private audioService: AudioService
  ) {
    this.totalRounds = this.gameService.maxRound;
  }

  ngOnInit() {
    this.clickSubject
      .pipe(takeUntil(this.destroy$))
      .subscribe((action: ACTION) => {
        this.disable = true;
        switch (action) {
          case ACTION.PUMP:
            this.emotionSubject.next('inflate');
            this.pumpBalloon();
            break;

          case ACTION.COLLECT:
            this.emotionSubject.next('collect');
            this.collectPoints();
            break;

          case ACTION.NEXT_ROUND:
            this.emotionSubject.next('new');
            this.nextRound();
            break;

          default:
            break;
        }
        setTimeout(() => {
          this.disable = false;
        }, 180);
      });
  }

  onButtonClick(action: ACTION) {
    this.clickSubject.next(action);
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private pumpBalloon() {
    this.audioService.playSound(AUDIO.INFLATE);
    this.gameService.pumpBalloon();
  }

  private collectPoints() {
    this.audioService.playSound(AUDIO.COLLECT);
    this.gameService.collectPoints();
  }

  private nextRound() {
    this.gameService.nextRound();
  }
}
