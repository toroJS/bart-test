import { Component } from '@angular/core';
import { GameService } from './game.service';
import { CommonModule } from '@angular/common';
import { BalloonComponent } from '../balloon/balloon.component';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatCardModule } from '@angular/material/card';

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
export class GameComponent {
  round$ = this.gameService.round$;
  gameEnd$ = this.gameService.gameEnd$;
  balloonSize$ = this.gameService.balloonSize$;
  totalPoints$ = this.gameService.totalPoints$;
  burts$ = this.gameService.burst$;

  constructor(private gameService: GameService) {}

  pumpBalloon() {
    this.gameService.pumpBalloon();
  }

  collectPoints() {
    this.gameService.collectPoints();
  }

  nextRound() {
    this.gameService.nextRound();
  }
}
