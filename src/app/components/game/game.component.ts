import { Component } from '@angular/core';
import { GameService } from './game.service';
import { CommonModule } from '@angular/common';
import { BalloonComponent } from '../balloon/balloon.component';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar } from '@angular/material/snack-bar';
import { filter } from 'rxjs';

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

  constructor(
    private gameService: GameService,
    private _snackBar: MatSnackBar
  ) {}

  pumpBalloon() {
    this.gameService.pumpBalloon();
  }

  collectPoints() {
    this.openSnackBar('Points collected', '🎉🎉🎉');
    this.gameService.collectPoints();
  }

  openSnackBar(message: string, action: string) {
    this._snackBar.open(message, action, {
      duration: 2000,
      verticalPosition: 'top',
    });
  }

  nextRound() {
    this.gameService.nextRound();
  }
}
