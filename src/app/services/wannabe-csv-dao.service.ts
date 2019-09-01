import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { PlayerRecord } from '../models/playerRecord';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class WannabeCsvDAOService {
  csvContent: string;
  parsedCsv: string[][];
  http: HttpClient;
  playerRecords: PlayerRecord[] = [];
  recordsLoaded = false;
  myObserver = {
    next: x => console.log('Observer got a next value: ' + x),
    error: err => console.error('Observer got an error: ' + err),
    complete: () => console.log('Observer got a complete notification'),
  };

  constructor(private httpClient: HttpClient) {
    this.http = httpClient;
    this.initRecords().subscribe(records => {
      this.playerRecords = records;
      this.recordsLoaded = true;
    });
  }

  private initRecords(): Observable<PlayerRecord[]> {
    console.log('in initRecords');

    const returnVal = new Observable<PlayerRecord[]>(observer => {
      let records: PlayerRecord[] = [];

      this.http.get('assets/Kickers.csv', { responseType: 'text' }).subscribe(kickers => {
        records = records.concat(this.parseCsv(kickers));
        this.http.get('assets/Defense.csv', { responseType: 'text' }).subscribe(defense => {
          records = records.concat(this.parseCsv(defense));
          this.http.get('assets/Offense.csv', { responseType: 'text' }).subscribe(offense => {
            records = records.concat(this.parseCsv(offense));
            observer.next(records);
          });
        });
      });
    });

    return returnVal;
  }

  public recordsComplete() {
    return this.recordsLoaded;
  }

  public getPlayerRecords(): PlayerRecord[] {
    console.log('getPlayerRecords - returning ' + this.playerRecords.length + ' records');
    return this.playerRecords;
  }

  public fetchPlayerRecords(): Observable<PlayerRecord[]> {
    const returnVal = new Observable<PlayerRecord[]>(observer => {
      if (this.recordsLoaded) {
        observer.next(this.playerRecords);
      } else {
       this.initRecords().subscribe(records => {
         observer.next(this.playerRecords);
       });
      }
    });
    return returnVal;
  }

  public parseCsv(data: string): PlayerRecord[] {
  const records: PlayerRecord[] = [];
  const defenses: string[] = data.split('\n');

  let rowCount = 0;
  for (const row of defenses) {
    if (rowCount > 2 && rowCount < defenses.length - 2) {

      const elements = row.split(',');

      const playerPosTeam = elements[1].trim().split(' ');
      const team = playerPosTeam[playerPosTeam.length - 1];
      const pos = playerPosTeam[playerPosTeam.length - 3];
      const player = elements[1].substring(0, elements[1].lastIndexOf(pos + ' ') - 1);

      const playerRecord: PlayerRecord = {
        playerName: player,
        position: pos,
        NFLTeam: team,
        percentOwn: +elements[5],
        percentStart: +elements[6],
        byeWeek: +elements[4],
        fantasyPoints: +elements[elements.length - 1],
        assessment: ' ',
        costEstimate: 0,
        rank: 0
      };
      records.push(playerRecord);
    }
    rowCount++;
  }
  return records;
}
}
