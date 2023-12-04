import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { GameService, gameStats } from '../game/game.service';
import { DataService } from '../../data/data.service';

@Component({
  selector: 'app-results',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './results.component.html',
  styleUrl: './results.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ResultsComponent {
  numberOfBurstedBaloons: number;
  user: string;
  totalPoints$ = this.gameService.totalPoints$;
  totalRounds = this.gameService.maxRound;
  userAvarageScore: number;

  constructor(
    private gameService: GameService,
    private dataService: DataService
  ) {
    const results = gameService.savedGameStats;
    this.user = gameService.user;
    this.numberOfBurstedBaloons = results.filter((stat) => stat.bursted).length;
    this.userAvarageScore = this.gameService.userAvarageScore();
  }

  // getDocs() {
  //   this.dataService.getAllStats().subscribe((res) => console.log(res));
  // }
}
