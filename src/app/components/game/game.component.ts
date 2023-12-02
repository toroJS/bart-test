import { Component } from '@angular/core';
import { GameService } from './game.service';
import { CommonModule } from '@angular/common';
import { BalloonComponent } from '../balloon/balloon.component';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-game',
  standalone: true,
  templateUrl: './game.component.html',
  styleUrl: './game.component.scss',
  imports: [CommonModule, MatButtonModule, MatIconModule, BalloonComponent],
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
    alert('points collected');

    this.gameService.collectPoints();
  }

  nextRound() {
    this.gameService.nextRound();
  }
}
