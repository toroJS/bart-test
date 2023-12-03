import { Injectable } from '@angular/core';
import { BehaviorSubject, tap } from 'rxjs';
import { DataService } from '../../data/data.service';

export interface gameStats {
  clicks: number;
  bursted: boolean;
}

@Injectable({
  providedIn: 'root',
})
export class GameService {
  user: string = '';
  maxSize = 29;
  maxRound = 20; // for testing real maxrounds 20

  savedGameStats: gameStats[] = [];
  sizeExplosionChance = new Map<number, number>([
    [1, 0.0333],
    [2, 0.066],
    [3, 0.1],
    [4, 0.13],
    [5, 0.166],
    [6, 0.2],
    [7, 0.233],
    [8, 0.266],
    [9, 0.3],
    [10, 0.333],
    [11, 0.366],
    [12, 0.4],
    [13, 0.433],
    [14, 0.466],
    [15, 0.5],
    [16, 0.533],
    [17, 0.566],
    [18, 0.6],
    [19, 0.633],
    [20, 0.666],
    [21, 0.7],
    [22, 0.733],
    [23, 0.766],
    [24, 0.8],
    [25, 0.833],
    [26, 0.866],
    [27, 0.9],
    [28, 0.933],
    [29, 0.966],
    [30, 1],
  ]);

  private totalPointsSubject$ = new BehaviorSubject<number>(0);
  totalPoints$ = this.totalPointsSubject$.asObservable();

  private roundSubject$ = new BehaviorSubject<number>(1);
  round$ = this.roundSubject$.asObservable();

  private balloonSizeSubject = new BehaviorSubject<number>(0);
  balloonSize$ = this.balloonSizeSubject.asObservable();

  private burstSubject = new BehaviorSubject<boolean>(false);
  burst$ = this.burstSubject.asObservable();

  private roundEndSubject = new BehaviorSubject<boolean>(false);
  roundEnd$ = this.roundEndSubject.asObservable();

  private gameEndSubject$ = new BehaviorSubject<boolean>(false);
  gameEnd$ = this.gameEndSubject$.asObservable().pipe(
    tap((end) => {
      if (end) {
        this.dataService.saveUserResults('someuser', this.savedGameStats);
      }
    })
  );

  constructor(private dataService: DataService) {}

  pumpBalloon() {
    this.balloonSizeSubject.next(this.balloonSizeSubject.value + 1);
    if (this.balloonSizeSubject.value >= this.maxSize) {
      // Handle reaching max size (e.g., reset the balloon)
      console.log('max size');

      return;
    }

    const burstChance =
      this.sizeExplosionChance.get(this.balloonSizeSubject.value) ?? 1;

    const bursted = Math.random() < burstChance;

    if (bursted) {
      this.burstSubject.next(true);
      this.roundEndSubject.next(true);
      if (this.roundSubject$.value === this.maxRound) {
        this.savedGameStats.push({
          clicks: this.balloonSizeSubject.value,
          bursted: this.burstSubject.value,
        });

        console.log(this.savedGameStats);

        this.gameEndSubject$.next(true);
      }
      return;
    }
  }

  collectPoints() {
    this.totalPointsSubject$.next(
      this.totalPointsSubject$.value + this.balloonSizeSubject.value
    );

    if (this.roundSubject$.value === this.maxRound) {
      this.savedGameStats.push({
        clicks: this.balloonSizeSubject.value,
        bursted: this.burstSubject.value,
      });

      console.log(this.savedGameStats);
      this.gameEndSubject$.next(true);
      return;
    }
    this.roundEndSubject.next(true);
  }

  nextRound() {
    this.gameEndSubject$.next(false);
    this.roundEndSubject.next(false);
    this.savedGameStats.push({
      clicks: this.balloonSizeSubject.value,
      bursted: this.burstSubject.value,
    });
    this.resetBalloon();
    this.roundSubject$.next(this.roundSubject$.value + 1);
  }

  resetBalloon() {
    this.burstSubject.next(false);
    this.balloonSizeSubject.next(0);
  }
}
