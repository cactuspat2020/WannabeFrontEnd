import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { PlayerRecord } from '../models/playerRecord';
import { Observable } from 'rxjs';
import {AveragePlayerCost} from '../models/avePlayerCostRecord';

@Injectable({
  providedIn: 'root'
})
export class WannabeCsvDAOService {
  http: HttpClient;
  playerRecords: PlayerRecord[] = [];
  recordsLoaded = false;
  costRecords: AveragePlayerCost[] = [];
  costRecordsLoaded = false;

  constructor(private httpClient: HttpClient) {
    this.http = httpClient;
    this.initPlayerRecords().subscribe(records => {
      this.playerRecords = records;
      this.recordsLoaded = true;
    });

    this.initCostRecords().subscribe( records => {
      this.costRecords  = records;
      this.costRecordsLoaded = true;
    });
  }

  /**
   * Initializes the historical costs from previous drafts. This is calculated from a spreadsheet that's maintained year after year.
   * Ultimately this should be all done with a function using stored historical drafts, but for now it's just a csv file that
   * gets created manually.
   */
  private initCostRecords(): Observable<AveragePlayerCost[]> {
    console.log('in initCostRecords');

    const returnVal = new Observable<AveragePlayerCost[]>(observer => {

      this.http.get('assets/AverageCosts.csv', {responseType: 'text'}).subscribe(costs => {
        const costRecords = this.parseCostData(costs);
        observer.next(costRecords);
      });
    });
    return returnVal;
  }

  /**
   * This parses the data loaded from the AverageCosts CSV file
   */
  public parseCostData(data: string): AveragePlayerCost[] {
    const records: AveragePlayerCost[] = [];
    const costs: string[] = data.split('\n');

    let rowCount = 0;
    for (const row of costs) {

      if (rowCount > 0 && rowCount < costs.length - 2) {

        const elements = row.split(',');
        const costRecord: AveragePlayerCost = {
          pick: +elements[0],
          qb: +elements[1],
          rb: +elements[2],
          rec: +elements[3],
          k: +elements[4],
          dst: +elements[5],
        };
        records.push(costRecord);
      }
      rowCount++;
    }
    return records;
  }

  /**
   * Retrieves the cost records. If they're not already loaded they will be here.
   */
  public fetchCostRecords(): Observable<AveragePlayerCost[]> {
    const returnVal = new Observable<AveragePlayerCost[]>(observer => {
      if (this.costRecordsLoaded) {
        observer.next(this.costRecords);
      } else {
        this.initCostRecords().subscribe(records => {
          observer.next(records);
        });
      }
    });
    return returnVal;
  }

  /**
   * Initializes all the player records. It loads the kickers, defense and offense csv files that are pulled down from www.cbssports.com.
   * Create the csv files by going to Players->Stats and export the projections from All Offense, DST and K.
   */
  private initPlayerRecords(): Observable<PlayerRecord[]> {
    console.log('in initPlayerRecords');

    const returnVal = new Observable<PlayerRecord[]>(observer => {
      let records: PlayerRecord[] = [];

      this.http.get('assets/Kickers.csv', { responseType: 'text' }).subscribe(kickers => {
        records = records.concat(this.parsePlayerData(kickers));
        this.http.get('assets/Defense.csv', { responseType: 'text' }).subscribe(defense => {
          records = records.concat(this.parsePlayerData(defense));
          this.http.get('assets/Offense.csv', { responseType: 'text' }).subscribe(offense => {
            records = records.concat(this.parsePlayerData(offense));
            observer.next(records);
          });
        });
      });
    });

    return returnVal;
  }

  /**
   * Retrieves the player records. If they're not already loaded they will be here.
   */
  public fetchPlayerRecords(): Observable<PlayerRecord[]> {
    const returnVal = new Observable<PlayerRecord[]>(observer => {
      if (this.recordsLoaded) {
        observer.next(this.playerRecords);
      } else {
       this.initPlayerRecords().subscribe(records => {
         observer.next(this.playerRecords);
       });
      }
    });
    return returnVal;
  }

  /**
   * Parses the player records from Kickers, Offense and Defense CSV files.
   * @param data - the full set of records loaded from the textfile.
   */
  public parsePlayerData(data: string): PlayerRecord[] {
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
