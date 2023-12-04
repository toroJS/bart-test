import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { GameService, gameStats } from '../game/game.service';
import { DataService } from '../../data/data.service';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatDividerModule } from '@angular/material/divider';
import { Router } from '@angular/router';
import { BalloonComponent } from '../balloon/balloon.component';
import { MatListModule } from '@angular/material/list';

@Component({
  selector: 'app-results',
  standalone: true,
  templateUrl: './results.component.html',
  styleUrl: './results.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule,
    MatButtonModule,
    MatCardModule,
    MatDividerModule,
    BalloonComponent,
    MatListModule,
  ],
})
export class ResultsComponent {
  numberOfBurstedBalloons!: number;
  user: string;
  totalPoints$ = this.gameService.totalPoints$;
  totalRounds = this.gameService.maxRound;
  userAverageScore!: number;
  displayedColumns: string[] = ['category', 'value'];
  dataSource: Array<{ category: string; value: string }> = [];

  constructor(
    private gameService: GameService,
    private dataService: DataService,
    private router: Router
  ) {
    const results = gameService.savedGameStats;

    this.dataSource = [
      // TODO: add here the total points
      { category: 'Total points', value: '34' },
      {
        category: 'Bursted Balloons',
        value: `${results.filter((stat) => stat.bursted).length} out of ${
          this.gameService.maxRound
        }`,
      },
      {
        category: 'Avg. point per round',
        value: `${this.gameService.userAvarageScore()}`,
      },
    ];

    this.user = gameService.user;
  }

  public handleRestart(): void {
    this.router.navigate(['/home']);
    // TODO: restart user game state
  }

  // getDocs() {
  //   this.dataService.getAllStats().subscribe((res) => console.log(res));
  // }
}
