import { Injectable, PlatformRef } from '@angular/core';
import { WannabeDAOService } from './wannabe-dao.service';
import { Observable } from 'rxjs';
import { DraftedPlayerRecord } from '../models/draftedPlayerRecord';
import { OwnerRecord } from '../models/ownerRecord';
import { stringify } from '@angular/compiler/src/util';
import { PlayerRecord } from '../models/playerRecord';


export class Ranking {
  teamName: string;
  fantasyPoints: number;
}

export class PlayersRemaining {
  position: string;
  elite: number;
  allPro: number;
  starter: number;
  reserve: number;
}

export function sortOnFantasy(a: DraftedPlayerRecord, b: DraftedPlayerRecord) {
  if (a.fantasyPoints > b.fantasyPoints) { return 1; }
  if (a.fantasyPoints < b.fantasyPoints) { return -1; }
  return 0;
}

@Injectable({
  providedIn: 'root'
})
export class StatisticsService {
  wannabeDAO: WannabeDAOService;

  constructor(wannabeDAO: WannabeDAOService) {
    this.wannabeDAO = wannabeDAO;
  }

  /*********************************************/
  /* Get team's ranking against the rest of the leaue
  /*********************************************/



  /*********************************************/
  /* get Data for a summary of remainging players by grouping
  /*********************************************/
  public getRemainingByStatus(): Observable<Map<string, PlayersRemaining>> {

    const returnVal = new Observable<Map<string, PlayersRemaining>>(observer => {
      this.wannabeDAO.fetchPlayers().subscribe((players: PlayerRecord[]) => {
        this.wannabeDAO.fetchDraftedPlayers().subscribe((draftedPlayers: DraftedPlayerRecord[]) => {
          draftedPlayers.map(x => players = players.filter(player => player.playerName !== x.playerName));

          const playerMap = new Map<string, PlayersRemaining>();
          const positions = ['QB', 'RB', 'Rec', 'DST', 'K'];

          for (const pos of positions) {
            const playerRec = new PlayersRemaining();

            playerRec.position = pos;
            if (pos === 'Rec') {
              playerRec.allPro = players.filter(x => x.assessment === 'All Pro' && (x.position === 'WR' || x.position === 'TE')).length;
              playerRec.elite = players.filter(x => x.assessment === 'Elite' && (x.position === 'WR' || x.position === 'TE')).length;
              playerRec.starter = players.filter(x => x.assessment === 'Starter' && (x.position === 'WR' || x.position === 'TE')).length;
              playerRec.reserve = players.filter(x => x.assessment === 'Bench' && (x.position === 'WR' || x.position === 'TE')).length;
            } else {
              playerRec.allPro = players.filter(x => x.assessment === 'All Pro' && x.position === pos).length;
              playerRec.elite = players.filter(x => x.assessment === 'Elite' && x.position === pos).length;
              playerRec.starter = players.filter(x => x.assessment === 'Starter' && x.position === pos).length;
              playerRec.reserve = players.filter(x => x.assessment === 'Bench' && x.position === pos).length;
            }
            playerMap.set(pos, playerRec);
          }
          observer.next(playerMap);
        });
      });
    });

    return returnVal;
  }

  /*********************************************/
  /* get Data for Spider Graph
  /*********************************************/
  public getSpiderData(startersOnly: boolean): Observable<any> {
    const spiderData = new Map<string, Map<string, number>>();
    const averageMap = new Map<string, number>();
    averageMap.set('QB', 0);
    averageMap.set('RB', 0);
    averageMap.set('Rec', 0);
    averageMap.set('DST', 0);
    averageMap.set('K', 0);
    spiderData.set('averages', averageMap);
    let qbCount = 0;
    let rbCount = 0;
    let recCount = 0;
    let dstCount = 0;
    let kCount = 0;
    const adder = startersOnly ? 0 : 1;

    const returnVal = new Observable(observer => {
      this.wannabeDAO.fetchDraftedPlayers().subscribe((draftedPlayers: DraftedPlayerRecord[]) => {
        this.wannabeDAO.fetchTeams().subscribe((teams: OwnerRecord[]) => {
          this.wannabeDAO.fetchPlayers().subscribe((allPlayers: PlayerRecord[]) => {

            // Update the projected points with most recent statistics
            for (const player of draftedPlayers) {
              const updatedPlayer = allPlayers.filter(x => x.playerName === player.playerName)[0];
              player.fantasyPoints = updatedPlayer.fantasyPoints;
            }

            for (const team of teams) {
              const positionMap = new Map<string, number>();
              const QBs = draftedPlayers.filter(x => x.position === 'QB' && x.ownerName === team.teamName).sort(sortOnFantasy).reverse().slice(0, 1 + adder);
              const RBs = draftedPlayers.filter(x => x.position === 'RB' && x.ownerName === team.teamName).sort(sortOnFantasy).reverse().slice(0, 2 + adder);
              const DSTs = draftedPlayers.filter(x => x.position === 'DST' && x.ownerName === team.teamName).sort(sortOnFantasy).reverse().slice(0, 1 + adder);
              const Ks = draftedPlayers.filter(x => x.position === 'K' && x.ownerName === team.teamName).sort(sortOnFantasy).reverse().slice(0, 1 + adder);
              const rec = draftedPlayers.filter(x => (x.position === 'WR' || x.position === 'TE') && x.ownerName === team.teamName)
                .sort(sortOnFantasy).reverse().slice(0, 3 + adder);

              const teamMap = new Map<string, number>();
              if (QBs.length > 0) {
                qbCount++;
                teamMap.set('QB', QBs.map(x => x.fantasyPoints).reduce((sum, current) => sum + current) / QBs.length);
                spiderData.get('averages').set('QB', (spiderData.get('averages').get('QB') + teamMap.get('QB')));
              } else {
                teamMap.set('QB', 0);
              }
              if (RBs.length > 0) {
                rbCount++;
                teamMap.set('RB', RBs.map(x => x.fantasyPoints).reduce((sum, current) => sum + current) / RBs.length);
                spiderData.get('averages').set('RB', (spiderData.get('averages').get('RB') + teamMap.get('RB')));
              } else {
                teamMap.set('RB', 0);
              }
              if (rec.length > 0) {
                recCount++;
                teamMap.set('Rec', rec.map(x => x.fantasyPoints).reduce((sum, current) => sum + current) / rec.length);
                spiderData.get('averages').set('Rec', (spiderData.get('averages').get('Rec') + teamMap.get('Rec')));
              } else {
                teamMap.set('Rec', 0);
              }
              if (DSTs.length > 0) {
                dstCount++;
                teamMap.set('DST', DSTs.map(x => x.fantasyPoints).reduce((sum, current) => sum + current) / DSTs.length);
                spiderData.get('averages').set('DST', (spiderData.get('averages').get('DST') + teamMap.get('DST')));
              } else {
                teamMap.set('DST', 0);
              }
              if (Ks.length > 0) {
                kCount++;
                teamMap.set('K', Ks.map(x => x.fantasyPoints).reduce((sum, current) => sum + current) / Ks.length);
                spiderData.get('averages').set('K', (spiderData.get('averages').get('K') + teamMap.get('K')));
              } else {
                teamMap.set('K', 0);
              }
              spiderData.set(team.teamName, teamMap);

              // update the averages
            }
            const countMap = new Map<string, number>();
            countMap.set('QB', qbCount);
            countMap.set('RB', rbCount);
            countMap.set('Rec', recCount);
            countMap.set('DST', dstCount);
            countMap.set('K', kCount);

            // Normalize All the data
            for (const team of Array.from(spiderData.keys())) {
              if (team !== 'averages') {
                for (const position of Array.from(spiderData.get(team).keys())) {
                  const positionValue = spiderData.get(team).get(position);
                  const averageValue = spiderData.get('averages').get(position) / countMap.get(position);
                  spiderData.get(team).set(position, positionValue / averageValue);
                }
              }
            }
            // Reset the normalized averages to 1
            for (const position of Array.from(spiderData.get('averages').keys())) {
              spiderData.get('averages').set(position, 1.0);
            }

            observer.next(spiderData);
          });
        });
      });
    });
    return returnVal;
  }

  /*********************************************/
  /* get power ranking data
  /*********************************************/
  public getPowerRankings(startersOnly: boolean): Observable<any> {
    const rankings = [];
    const adder = startersOnly ? 0 : 1;

    const returnVal = new Observable(observer => {

      this.wannabeDAO.fetchDraftedPlayers().subscribe((draftedPlayers: DraftedPlayerRecord[]) => {
        this.wannabeDAO.fetchTeams().subscribe((teams: OwnerRecord[]) => {
          this.wannabeDAO.fetchPlayers().subscribe((allPlayers: PlayerRecord[]) => {

            // Update the fantasy points with most recent statistics
            for (const player of draftedPlayers) {
              const updatedPlayer = allPlayers.filter(x => x.playerName === player.playerName)[0];
              player.fantasyPoints = updatedPlayer.fantasyPoints;
            }

            for (const team of teams) {
              const QBs = draftedPlayers.filter(x => x.position === 'QB' && x.ownerName === team.teamName).sort(sortOnFantasy).reverse().slice(0, 1 + adder);
              const RBs = draftedPlayers.filter(x => x.position === 'RB' && x.ownerName === team.teamName).sort(sortOnFantasy).reverse().slice(0, 2 + adder);
              const DSTs = draftedPlayers.filter(x => x.position === 'DST' && x.ownerName === team.teamName).sort(sortOnFantasy).reverse().slice(0, 1 + adder);
              const Ks = draftedPlayers.filter(x => x.position === 'K' && x.ownerName === team.teamName).sort(sortOnFantasy).reverse().slice(0, 1 + adder);
              const rec = draftedPlayers.filter(x => (x.position === 'WR' || x.position === 'TE') && x.ownerName === team.teamName)
                .sort(sortOnFantasy).reverse().slice(0, 3 + adder);

              const ranking: Ranking = { fantasyPoints: 0, teamName: team.teamName };
              QBs.map(x => ranking.fantasyPoints += x.fantasyPoints);
              RBs.map(x => ranking.fantasyPoints += x.fantasyPoints);
              DSTs.map(x => ranking.fantasyPoints += x.fantasyPoints);
              Ks.map(x => ranking.fantasyPoints += x.fantasyPoints);
              rec.map(x => ranking.fantasyPoints += x.fantasyPoints);

              rankings.push(ranking);
            }
            rankings.sort((a, b) => (a.fantasyPoints < b.fantasyPoints ? 1 : -1));
            observer.next(rankings);
          });
        });
      });
    });

    return returnVal;
  }
}
