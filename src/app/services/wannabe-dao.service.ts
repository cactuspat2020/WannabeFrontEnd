import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpClient, HttpHeaders, HttpRequest } from '@angular/common/http';
import { PlayerRecord } from '../models/playerRecord';
import { OwnerRecord } from '../models/ownerRecord';
import { SetupData } from '../models/setupData';
import { DraftedPlayerRecord } from '../models/draftedPlayerRecord';
import { DraftBid } from '../models/draftBid';



@Injectable({
  providedIn: 'root'
})


export class WannabeDAOService {
  http: HttpClient;
  baseURL = 'https://u4oe9qvb4k.execute-api.us-west-2.amazonaws.com/default/';
  getPlayersURL = this.baseURL + 'getPlayers';
  getDraftInfoURL = this.baseURL + 'getDraftInfo';
  getDraftedPlayersURL = this.baseURL + 'getDraftedPlayers';
  saveDraftInfoURL = this.baseURL + 'saveDraftInfo';
  saveDraftPickURL = this.baseURL + 'saveDraftPick';
  undoLastPickURL = this.baseURL + 'undoLastPick';

  fullPlayerListInitialized = false;
  draftedPlayerListInitialized = false;
  draftInfoInitialized = false;

  players: PlayerRecord[] = [];
  playerTest: PlayerRecord[] = [];
  draftedPlayers: DraftedPlayerRecord[] = [];
  owners: OwnerRecord[] = [];
  setupData: SetupData = new SetupData(' ', 0, 0, []);
  bidCount = 0;
  draftOwner: string;
  ROUNDS = 15;

  constructor(private httpClient: HttpClient) {
    this.http = httpClient;

    this.http.get(this.getPlayersURL).subscribe((response: PlayerRecord[]) => {
      this.players = response;
      this.fullPlayerListInitialized = true;
    });

    this.http.get(this.getDraftInfoURL).subscribe((response: OwnerRecord[]) => {
      this.setupData.teams = response;
      this.setupData.budget = response[0].budget;
      this.setupData.draftName = response[0].draftName;
      this.setupData.leagueSize = response.length;
      this.owners = response;
      this.draftInfoInitialized = true;
      });

    this.http.get(this.getDraftedPlayersURL).subscribe((response: DraftedPlayerRecord[]) => {
      this.draftedPlayers = response;
      this.draftedPlayerListInitialized = true;
    });
  }

  public dataAvalable() {
    return (this.fullPlayerListInitialized && this.draftInfoInitialized && this.draftedPlayerListInitialized);
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
      next => {},
      response => {
        // error condition
        console.log("POST call in error", response); },
      () => {
        // success condition
        record.draftOrder = this.draftedPlayers.length + 1;
        this.draftedPlayers.push(record);
        console.log("Success in DAO");
      }
    );
    return returnObservable;
  }

  public getFakeSetup() {
    return this.setupData;
  }
  public getTestPlayers(): PlayerRecord[] {
    return this.playerTest;
  }


  // Get players by position
  public getPlayers(position): PlayerRecord[] {
    const names = [];

    for ( const player of this.draftedPlayers) {
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
  public getMaxBid(teamName : string ): number {
    let amountSpent = 0;
    let playerCount = 0;
    const ownerRecord: OwnerRecord = this.owners.filter(owner => owner.teamName === teamName)[0];

    for ( const player of this.draftedPlayers ) {
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

  public fetchTeams(): Observable<object> {
    return this.http.get(this.getDraftInfoURL);
  }

  public undoLastSelection(): Observable<object> {
    const observable = this.http.get(this.undoLastPickURL);
    observable.subscribe((response: DraftedPlayerRecord[]) => {
      this.draftedPlayers = response;
    });
    return observable;
  }

  public fetchDraftedPlayers(): Observable<object> {
    const observable = this.http.get(this.getDraftedPlayersURL);
    observable.subscribe((response: DraftedPlayerRecord[]) => {
      this.draftedPlayers = response;
    });
    return observable;
  }

  public fetchPlayers(): Observable<object> {
    const names = [];

    const observable = this.http.get(this.getPlayersURL);

    observable.subscribe((response: PlayerRecord[]) => {
      this.players = response;
      this.fullPlayerListInitialized = true;
    });
    return observable;
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
}
