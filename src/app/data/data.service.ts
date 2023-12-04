import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { FirebaseApp, initializeApp } from 'firebase/app';
import {
  Firestore,
  Timestamp,
  addDoc,
  collection,
  doc,
  getDocs,
  getFirestore,
  limit,
  orderBy,
  query,
} from 'firebase/firestore';
import { gameStats } from '../components/game/game.service';
import { from, map } from 'rxjs';

export interface DbScoreResponse {
  createdAt: Timestamp;
  score: gameStats[];
  user: string;
}

export interface Score {
  avarageScore: number;
  totalPoints: number;
  numberOfBursts: number;
}

export interface RankedPlayer {
  rank: string;
  user: string;
  userId: string;
  score: number;
  avg: number;
  bursted: number;
}

@Injectable({
  providedIn: 'root',
})
export class DataService {
  db: Firestore;

  constructor() {
    const app = initializeApp(environment.firebaseConfig);
    this.db = getFirestore(app);
  }

  async saveUserResults(
    username: string,
    totalScore: number,
    avgScore: number,
    numberRounds: number,
    burstedBalloons: number,
    score: gameStats[]
  ) {
    return await addDoc(collection(this.db, 'results'), {
      createdAt: Timestamp.fromDate(new Date()),
      totalScore: totalScore,
      avgScore: avgScore,
      numberOfBurstedBalloons: burstedBalloons,
      numberofRounds: numberRounds,
      score: score,
      user: username,
    });
  }

  getAllStats() {
    return from(getDocs(collection(this.db, 'results'))).pipe(
      map((res) => {
        const results: DbScoreResponse[] = [];
        res.forEach((element) => {
          results.push(element.data() as DbScoreResponse);
        });
        return results;
      })
    );
  }

  getTopScoresOfAllTime(userStats: RankedPlayer) {
    const resultsCollection = collection(this.db, 'results');
    return from(
      getDocs(query(resultsCollection, orderBy('totalScore', 'desc'), limit(5)))
    ).pipe(
      map((res) => {
        const results: RankedPlayer[] = [];
        let index = 1;
        res.forEach((element) => {
          const { totalScore, avgScore, numberOfBurstedBalloons, user } =
            element.data();
          const playerId = element.id;
          const player = {
            rank: index.toString(),
            userId: playerId,
            user: user,
            score: totalScore,
            avg: avgScore,
            bursted: numberOfBurstedBalloons,
          } as RankedPlayer;
          index = index + 1;
          results.push(player);
        });

        if (
          !results.map((player) => player.userId).includes(userStats.userId)
        ) {
          results.push(userStats);
        }
        return results;
      })
    );
  }
}
