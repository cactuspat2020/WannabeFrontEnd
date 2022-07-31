import { Injectable } from '@angular/core';
import { Observable, range } from 'rxjs';
import { HttpClient, HttpHeaders, HttpRequest } from '@angular/common/http';
import { PlayerRecord } from '../models/playerRecord';
import { OwnerRecord } from '../models/ownerRecord';
import { SetupData } from '../models/setupData';
import { AveragePlayerCost } from '../models/avePlayerCostRecord';
import { DraftedPlayerRecord } from '../models/draftedPlayerRecord';
import { WannabeCsvDAOService } from './wannabe-csv-dao.service';
import { CookieService } from 'ngx-cookie-service';

import { delay } from 'q';
import { ObserversModule } from '@angular/cdk/observers';



@Injectable({
  providedIn: 'root'
})


export class WannabeDAOService {
  http: HttpClient;
  csvDaoService: WannabeCsvDAOService;
  cookieService: CookieService;
  baseURL = 'https://u4oe9qvb4k.execute-api.us-west-2.amazonaws.com/default/';
  getPlayersURL = this.baseURL + 'getPlayers';
  getDraftInfoURL = this.baseURL + 'getDraftInfo';
  getDraftedPlayersURL = this.baseURL + 'getDraftedPlayers';
  getPlayerRankingsURL = this.baseURL + 'getPlayerRankings';
  saveDraftInfoURL = this.baseURL + 'saveDraftInfo';
  saveDraftPickURL = this.baseURL + 'saveDraftPick';
  undoLastPickURL = this.baseURL + 'undoLastPick';
  saveWatchlistPlayerURL = this.baseURL + 'saveWatchlistPlayer';
  deleteWatchPlayerURL = this.baseURL + 'deleteWatchlistPlayer';
  getWatchlistURL = this.baseURL + 'getWatchlists';
  auditURL = this.baseURL + 'audit';
  getAveragePlayercostURL = this.baseURL + 'getAveragePlayerCost';

  fullPlayerListInitialized = false;
  draftedPlayerListInitialized = false;
  draftInfoInitialized = false;
  playerRankingsInitialized = false;
  watchlistInitialized = false;
  averagePlayerCostInitialized = false;

  playerRankings;
  players: PlayerRecord[] = [];
  playerTest: PlayerRecord[] = [];
  draftedPlayers: DraftedPlayerRecord[] = [];
  watchlistPlayers: DraftedPlayerRecord[] = [];
  owners: OwnerRecord[] = [];
  averagePlayerCost: AveragePlayerCost[] = [];
  setupData: SetupData = new SetupData(' ', 0, 0, []);
  bidCount = 0;
  draftOwner: string;
  ROUNDS = 15;
  carryOverCount = 0;

  constructor(private httpClient: HttpClient, csvService: WannabeCsvDAOService, cookieService: CookieService) {
    this.http = httpClient;
    this.csvDaoService = csvService;
    this.cookieService = cookieService;

    this.fetchPlayers().subscribe();
    this.fetchWatchList().subscribe();
    this.fetchTeams().subscribe();
    this.fetchAveragePlayerCost().subscribe();
  }

  public forceNewWatchList() {
    this.watchlistInitialized = false;
  }

  public fetchWatchList(): Observable<object> {
    const returnVal = new Observable<DraftedPlayerRecord[]>(observer => {
        if (this.watchlistInitialized) {
        observer.next(this.watchlistPlayers);
      } else {
          this.setDraftOwner(this.cookieService.get('loginTeam'));
          this.http.get(this.getWatchlistURL).subscribe((response: DraftedPlayerRecord[]) => {
          this.watchlistPlayers = response.filter(x => x.ownerName === this.draftOwner);
          this.fetchDraftedPlayers().subscribe((playerList: DraftedPlayerRecord[]) => {
            for (const watchedPlayer of this.watchlistPlayers) {
              const draftedPlayer = playerList.filter(x => watchedPlayer.playerName === x.playerName);
              if (draftedPlayer.length > 0) {
                watchedPlayer.ownerName = draftedPlayer[0].ownerName;
              } else {
                watchedPlayer.ownerName = '--';
              }
            }
            this.watchlistInitialized = true;
            observer.next(this.watchlistPlayers);
          });
        });
      }
    });
    return returnVal;
  }

  public storeWatchlistPlayer(player: DraftedPlayerRecord): Observable<any> {
    const jsonBody = JSON.stringify(player);
    this.watchlistPlayers.push(player);
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
      })
    };
    return this.http.post(this.saveWatchlistPlayerURL, jsonBody, httpOptions);
  }

  public storeAuditRecord(page: string) {
    const jsonBody = '{"owner":"' + this.getDraftOwner() + '", "page":"' + page + '"}';
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
      })
    };
    this.http.post(this.auditURL, jsonBody, httpOptions).subscribe(x => {
      const ret = x;
    });
  }

  public deleteWatchlistPlayer(player: DraftedPlayerRecord): Observable<any> {
    player.ownerName = this.draftOwner;
    const jsonBody = JSON.stringify(player);
    this.watchlistPlayers = this.watchlistPlayers.filter(x => player.playerName !== x.playerName);
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
      })
    };
    return this.http.post(this.deleteWatchPlayerURL, jsonBody, httpOptions);
  }

  public fetchPlayerRankings(): Observable<object> {
    const observable = this.http.get(this.getPlayerRankingsURL);
    observable.subscribe((response) => {
      this.playerRankings = this.getRankingMap(response);
    });
    return observable;
  }

  public getRankingMap(response) {
    const rankingMap = new Map();

    for (const row of response) {
      const position = row.Position;
      const rank = row.Rank;
      const threshold = +row.Threshold;
      rankingMap.set(position + rank, threshold);
    }
    return rankingMap;
  }

  public getPlayerRating(playerRecord) {
    const fantasyPoints = playerRecord.fantasyPoints;
    const position = playerRecord.position;

    if (fantasyPoints >= this.playerRankings.get(position + 'ELITE')) {
      return 'Elite';
    } else if (fantasyPoints >= this.playerRankings.get(position + 'ALL_PRO')) {
      return 'All Pro';
    } else if (fantasyPoints >= this.playerRankings.get(position + 'STARTER')) {
      return 'Starter';
    } else {
      return 'Bench';
    }
  }

  public dataAvalable() {
    return (this.fullPlayerListInitialized && this.draftInfoInitialized
      && this.draftedPlayerListInitialized && this.playerRankingsInitialized
      && this.watchlistInitialized);
  }

  public storeDraftPick(record: DraftedPlayerRecord): Observable<any> {
    const jsonBody = JSON.stringify(record);

    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
      })
    };

    const returnObservable = this.http.post(this.saveDraftPickURL, jsonBody, httpOptions);

    returnObservable.subscribe(
      next => { },
      response => {
        // error condition
        console.log("POST call in error", response);
      },
      () => {
        // success condition
        record.draftOrder = this.draftedPlayers.length + 1;
        this.draftedPlayers.push(record);
        console.log("Success in DAO");
      }
    );
    return returnObservable;
  }


  // Get players by position
  public getPlayers(position): PlayerRecord[] {
    const names = [];

    for (const player of this.draftedPlayers) {
      names.push(player.playerName);
    }

    const filteredList = this.players.filter(availablePlayer => !names.includes(availablePlayer.playerName));
    let finalList = filteredList;

    if (position !== 'all') {
      finalList = filteredList.filter(availablePlayer => availablePlayer.position === position);
    }
    return finalList;
  }

  // Get Drafted players
  public getDraftedPlayers(teamName): DraftedPlayerRecord[] {

    if (teamName === 'all') {
      return this.draftedPlayers;
    }
    const filteredList = this.draftedPlayers.filter(player => player.ownerName === teamName);
    return filteredList;
  }

  // Get Max Bid
  public getMaxBid(teamName: string): number {
    let amountSpent = 0;
    let playerCount = 0;
    const ownerRecord: OwnerRecord = this.owners.filter(owner => owner.teamName === teamName)[0];

    for (const player of this.draftedPlayers) {
      if (player.ownerName === teamName) {
        amountSpent += player.price;
        playerCount++;
      }
    }

    const neededReserve = playerCount === this.ROUNDS ? 0 : this.ROUNDS - (playerCount + 1);
    const remainingBudget = ownerRecord.budget - amountSpent - neededReserve;
    return remainingBudget;
  }

  // Get team that's on the clock
  public getOnTheClock(): string {
    var currentIndex = this.draftedPlayers.length % this.owners.length + 1 - this.carryOverCount;
    if (currentIndex < 1 ) {
      currentIndex = 1;
    }

    for (const owner of this.owners) {
      if (owner.draftOrder === currentIndex) {
        return owner.teamName;
      }
    }
  }

  // Get remaining players to be drafted
  public getRemainingPlayerCount(): number {
    const totalPlayersToDraft = this.owners.length * this.ROUNDS;
    return totalPlayersToDraft - this.draftedPlayers.length;
  }
  // Get Current Round
  public getRound(): number {
    return Math.ceil((this.draftedPlayers.length + 1) / this.owners.length);
  }

  // Get all the teams for the draft
  public getTeams(): OwnerRecord[] {
    return this.owners;
  }

  public fetchTeams(): Observable<OwnerRecord[]> {
    const returnVal = new Observable<OwnerRecord[]>(observer => {
      if (this.draftInfoInitialized) {
        observer.next(this.setupData.teams);
      } else {
        this.http.get(this.getDraftInfoURL).subscribe((response: OwnerRecord[]) => {
          this.setupData.teams = response;
          this.setupData.budget = response[0].budget;
          this.setupData.draftName = response[0].draftName;
          this.setupData.leagueSize = response.length;
          this.owners = response;
          this.draftInfoInitialized = true;
          observer.next(this.setupData.teams);
        });
      }
    });
    this.carryOverCount = this.owners.filter(x => x.hasCarryOver === true).length;
    this.http.post(this.auditURL, '{"owner":"Gunslingers","page","Auction"}', {});

    return returnVal;
  }

public getAveCost(pick: number, position: string): number {
    const record = this.averagePlayerCost.filter(x => x.pick === pick)[0];
    if (record) {
    if ( position === 'qb') {
      return record.qb;
    } else if (position === 'rb') {
      return record.rb;
    } else if (position === 'wr' || position === 'te') {
      return record.rec;
    } else if (position === 'k') {
      return record.k;
    } else if (position === 'dst') {
      return record.dst;
    } else {
      return 1;
    }
  } else {
    return 1;
  }
}

  public fetchAveragePlayerCost() {
    const returnVal = new Observable<AveragePlayerCost[]>(observer => {
      if ( this.averagePlayerCostInitialized ) {
        observer.next(this.averagePlayerCost);
      } else {
        this.csvDaoService.fetchCostRecords().subscribe((response: AveragePlayerCost[]) => {
          this.averagePlayerCost = response;
          this.averagePlayerCostInitialized = true;
          observer.next(this.averagePlayerCost);
        });
      }
    });
    return returnVal;
  }
  public undoLastSelection(): Observable<object> {
    const player = this.getLastPlayerDrafted();

    const jsonBody = JSON.stringify(player);
    const httpOptions = { headers: new HttpHeaders({ 'Content-Type': 'application/json', }) };
    const observable = this.http.post(this.undoLastPickURL, jsonBody, httpOptions);

    observable.subscribe((response: DraftedPlayerRecord[]) => {
      this.draftedPlayers = response;
    });
    return observable;
  }
  private getLastPlayerDrafted() {
    let lastPlayer = this.draftedPlayers[0];

    this.draftedPlayers.forEach( player => {
      if (player.draftOrder > lastPlayer.draftOrder) {
        lastPlayer = player;
      }
    });
    return lastPlayer;
  }

  public fetchDraftedPlayers(): Observable<object> {
    const returnVal = new Observable<DraftedPlayerRecord[]>(observer => {
      if (this.draftedPlayerListInitialized) {
        observer.next(this.draftedPlayers);
      } else {
        this.http.get(this.getDraftedPlayersURL).subscribe((response: DraftedPlayerRecord[]) => {
          this.draftedPlayers = response;
          observer.next(this.draftedPlayers);
        });
      }
    });
    return returnVal;
  }


  public fetchPlayers(): Observable<PlayerRecord[]> {
    console.log('fetching Players');

    const returnVal = new Observable<PlayerRecord[]>(observer => {
      if (this.dataAvalable()) {
        observer.next(this.players);
      } else {
        this.csvDaoService.fetchPlayerRecords().subscribe((response: PlayerRecord[]) => {
          this.players = response;
          this.setEstimatedCosts();
          this.fullPlayerListInitialized = true;
          this.http.get(this.getPlayerRankingsURL).subscribe((response2) => {
            this.playerRankings = this.getRankingMap(response2);
            for (const player of this.players) {
              player.assessment = this.getPlayerRating(player);
            }
            this.playerRankingsInitialized = true;
            observer.next(this.players);
          });
        });
      }
    });
    return returnVal;
  }

  private setEstimatedCosts() {
    const positions = ['QB', 'RB', 'DST', 'K'];

    positions.forEach( position => {
        const playerArray = this.players.filter(x => x.position === position);
        this.assignCosts(playerArray);
      });

    const receivers = this.players.filter(x => x.position === 'WR' || x.position === 'TE');
    this.assignCosts(receivers);
  }

  private assignCosts(playerArray: PlayerRecord[]) {
    playerArray.sort((a, b) => b.fantasyPoints - a.fantasyPoints);
    for (let i = 0; i < playerArray.length; i++) {
      playerArray[i].costEstimate = this.getAveCost(i + 1, playerArray[i].position.toLowerCase());
    }
  }
  // get a specfic team record
  public getTeamRecord(teamName): OwnerRecord {
    return this.owners.filter(owner => owner.teamName === teamName)[0];
  }

  public setDraftOwner(owner: string) {
    this.draftOwner = owner;
  }
  public getDraftOwner(): string {
    return this.cookieService.get('loginTeam');
  }
  public getDraftInfo(): SetupData {
    return this.setupData;
  }

  public storeSetupData(data: SetupData): Observable<any> {
    const jsonBody = JSON.stringify(data);
    this.setupData = data;
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
      })
    };
    return this.http.post(this.saveDraftInfoURL, jsonBody, httpOptions);
  }

  public delay(ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}
