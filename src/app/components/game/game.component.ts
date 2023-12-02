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
  balloonHeight$ = this.gameService.balloonHeight$;
  balloonWidth$ = this.gameService.balloonWidth$;
  burts$ = this.gameService.burst$;

  constructor(private gameService: GameService) {}

  pumpBalloon() {
    const pumpStrength = Math.random();
    this.gameService.pumpBalloon(pumpStrength);
  }
}
