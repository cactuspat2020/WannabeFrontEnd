import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpClient, HttpHeaders, HttpRequest } from '@angular/common/http';
import { PlayerRecord } from '../models/playerRecord';
import { OwnerRecord } from '../models/ownerRecord';
import { SetupData } from '../models/setupData';
import { DraftedPlayerRecord } from '../models/draftedPlayerRecord';
import { WannabeCsvDAOService } from './wannabe-csv-dao.service';
import { delay } from 'q';
import { ObserversModule } from '@angular/cdk/observers';



@Injectable({
  providedIn: 'root'
})


export class WannabeDAOService {
  http: HttpClient;
  csvDaoService: WannabeCsvDAOService;
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

  fullPlayerListInitialized = false;
  draftedPlayerListInitialized = false;
  draftInfoInitialized = false;
  playerRankingsInitialized = false;
  watchlistInitialized = false;

  playerRankings;
  players: PlayerRecord[] = [];
  playerTest: PlayerRecord[] = [];
  draftedPlayers: DraftedPlayerRecord[] = [];
  watchlistPlayers: DraftedPlayerRecord[] = [];
  owners: OwnerRecord[] = [];
  setupData: SetupData = new SetupData(' ', 0, 0, []);
  bidCount = 0;
  draftOwner: string;
  ROUNDS = 15;

  constructor(private httpClient: HttpClient, csvService: WannabeCsvDAOService) {
    this.http = httpClient;
    this.csvDaoService = csvService;

    this.fetchPlayers().subscribe();
    this.fetchWatchList().subscribe();
    this.fetchTeams().subscribe();
  }

  public forceNewWatchList() {
    this.watchlistInitialized = false;
  }

  public fetchWatchList(): Observable<object> {
    const returnVal = new Observable<DraftedPlayerRecord[]>(observer => {
      if (this.watchlistInitialized) {
        observer.next(this.watchlistPlayers);
      } else {
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
    const currentIndex = this.draftedPlayers.length % this.owners.length + 1;

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
    return returnVal;
  }

  public undoLastSelection(): Observable<object> {
    const player = this.draftedPlayers[0];

    const jsonBody = JSON.stringify(player);
    const httpOptions = { headers: new HttpHeaders({ 'Content-Type': 'application/json', }) };
    const observable = this.http.post(this.undoLastPickURL, jsonBody, httpOptions);

    observable.subscribe((response: DraftedPlayerRecord[]) => {
      this.draftedPlayers = response;
    });
    return observable;
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

  // get a specfic team record
  public getTeamRecord(teamName): OwnerRecord {
    return this.owners.filter(owner => owner.teamName === teamName)[0];
  }

  public setDraftOwner(owner: string) {
    this.draftOwner = owner;
  }
  public getDraftOwner(): string {
    return this.draftOwner;
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
