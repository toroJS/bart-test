import { Component, OnDestroy } from '@angular/core';
import { GameService } from './game.service';
import { CommonModule } from '@angular/common';
import { BalloonComponent } from '../balloon/balloon.component';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatCardModule } from '@angular/material/card';
import { Subject, debounceTime, map, takeUntil, tap } from 'rxjs';

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

  round$ = this.gameService.round$;
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
  burts$ = this.gameService.burst$;
  username = this.gameService.user;

  constructor(private gameService: GameService) {}

  ngOnInit() {
    this.clickSubject
      .pipe(
        tap(() => (this.disable = true)),
        debounceTime(200)
      )
      .pipe(takeUntil(this.destroy$))
      .subscribe((action: ACTION) => {
        switch (action) {
          case ACTION.PUMP:
            this.pumpBalloon();
            break;

          case ACTION.COLLECT:
            this.collectPoints();
            break;

          case ACTION.NEXT_ROUND:
            this.nextRound();
            break;

          default:
            break;
        }
        this.disable = false;
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
    this.gameService.pumpBalloon();
  }

  private collectPoints() {
    this.gameService.collectPoints();
  }

  private nextRound() {
    this.gameService.nextRound();
  }
}
