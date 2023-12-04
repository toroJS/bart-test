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
  maxSize = 31;
  maxRound = 1; // for testing real maxrounds 20

  savedGameStats: gameStats[] = [];
  sizeExplosionChance = new Map<number, number>([
    [1, 0.0313],
    [2, 0.0323],
    [3, 0.0333],
    [4, 0.0345],
    [5, 0.0357],
    [6, 0.037],
    [7, 0.0385],
    [8, 0.04],
    [9, 0.0417],
    [10, 0.0435],
    [11, 0.0455],
    [12, 0.0476],
    [13, 0.05],
    [14, 0.0526],
    [15, 0.0556],
    [16, 0.0588],
    [17, 0.0625],
    [18, 0.0667],
    [19, 0.0714],
    [20, 0.0769],
    [21, 0.0833],
    [22, 0.0909],
    [23, 0.1],
    [24, 0.1111],
    [25, 0.125],
    [26, 0.1429],
    [27, 0.1667],
    [28, 0.2],
    [29, 0.25],
    [30, 0.3333],
    [31, 0.5],
    [32, 1],
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
        this.dataService.saveUserResults(this.user, this.savedGameStats);
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

  userAvarageScore() {
    const pointsPerRound = this.savedGameStats
      .filter((stats) => !stats.bursted)
      .map((stats) => stats.clicks);
    const numberOfNonBurstedBalloons = pointsPerRound.length;
    const initialValue = 0;
    const sumWithInitial = pointsPerRound.reduce(
      (accumulator, currentValue) => accumulator + currentValue,
      initialValue
    );

    return sumWithInitial / numberOfNonBurstedBalloons;
  }
}
