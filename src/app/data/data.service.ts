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
    await addDoc(collection(this.db, 'results'), {
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
    // const querySnapshot = await getDocs(collection(this.db, 'results'));
    // const results = [];
    // querySnapshot.forEach((doc) => {
    //   // doc.data() is never undefined for query doc snapshots
    //   console.log(doc.id, ' => ', doc.data());
    //   results.push(doc.data());
    // });
  }

  gettopScoresOfAllTime() {
    const resultsCollection = collection(this.db, 'results');
    return from(
      getDocs(query(resultsCollection, orderBy('totalScore', 'desc'), limit(5)))
    ).pipe(
      map((res) => {
        const results: any = [];
        res.forEach((element) => {
          results.push(element.data());
        });
        return results;
      })
    );

    // return from(
    //   getDocs(collection(this.db, 'results').orderBy('createdAt', 'desc'))
    // )
  }
}
