import { Component } from '@angular/core';
import { GameService } from './game.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-game',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './game.component.html',
  styleUrl: './game.component.scss',
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
