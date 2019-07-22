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
  players: PlayerRecord[] = [];
  playerTest: PlayerRecord[] = [];
  draftedPlayers: DraftedPlayerRecord[] = [];
  owners: OwnerRecord[] = [];
  setupData: SetupData;
  testBids: DraftBid[];
  bidCount = 0;
  draftOwner: string;

  constructor(private httpClient: HttpClient) {
    this.http = httpClient;

    this.owners = JSON.parse('[' +
      '{\"ownerName\":\"Pat Vessels\", \"teamName\":\"Gunslingers\", \"remainingBudget\":200, \"draftOrder\":1, \"isAdmin\":true },' +
      '{\"ownerName\":\"Wayne Bryan\", \"teamName\":\"Smack\", \"remainingBudget\":200, \"draftOrder\":2, \"isAdmin\":true },' +
      '{\"ownerName\":\"Tim Bryan\", \"teamName\":\"Diablos\", \"remainingBudget\":200, \"draftOrder\":3, \"isAdmin\":false },' +
      '{\"ownerName\":\"Dan Mayer \", \"teamName\":\"Bud Light Man\", \"remainingBudget\":200, \"draftOrder\":4, \"isAdmin\":false },' +
      '{\"ownerName\":\"Max Fregoso\", \"teamName\":\"Corn Bread\", \"remainingBudget\":200, \"draftOrder\":5, \"isAdmin\":false },' +
      '{\"ownerName\":\"Ed Garcia\", \"teamName\":\"Davids Revenge\", \"remainingBudget\":200, \"draftOrder\":6, \"isAdmin\":false },' +
      '{\"ownerName\":\"Weston Bryant\", \"teamName\":\"En Vogue\", \"remainingBudget\":200, \"draftOrder\":7, \"isAdmin\":false },' +
      '{\"ownerName\":\"Jeff Fregoso \", \"teamName\":\"SKOL\", \"remainingBudget\":200, \"draftOrder\":8, \"isAdmin\":false },' +
      '{\"ownerName\":\"David Turner\", \"teamName\":\"Boss Man II\", \"remainingBudget\":200, \"draftOrder\":9, \"isAdmin\":false },' +
      '{\"ownerName\":\"Randy Fregoso\", \"teamName\":\"Smokey\", \"remainingBudget\":200, \"draftOrder\":10, \"isAdmin\":false },' +
      '{\"ownerName\":\"Scott Mayer\", \"teamName\":\"Bud Heavy\", \"remainingBudget\":200, \"draftOrder\":11, \"isAdmin\":false },' +
      '{\"ownerName\":\"Lee Bryan\", \"teamName\":\"Big Daddy\", \"remainingBudget\":200, \"draftOrder\":12, \"isAdmin\":false }' +
      ']');

    this.setupData = new SetupData('2019 Draft', 200, this.owners.length, this.owners);

    this.playerTest = JSON.parse('[' +
      '{"position":"QB","byeWeek":3,"fantasyPoints":138,"playerName":"Aaron Rodgers","NFLTeam":"Packers","percentOwn":90,"percentStart":20},' +
      '{"position":"RB","byeWeek":8,"fantasyPoints":123,"playerName":"David Johnson","NFLTeam":"Cardinals","percentOwn":90,"percentStart":20},' +
      '{"position":"QB","byeWeek":9,"fantasyPoints":38,"playerName":"Drew Brees","NFLTeam":"Saints","percentOwn":90,"percentStart":20},' +
      '{"position":"WR","byeWeek":5,"fantasyPoints":108,"playerName":"Randy Moss","NFLTeam":"Vikings","percentOwn":90,"percentStart":20},' +
      '{"position":"K","byeWeek":3,"fantasyPoints":93,"playerName":"Chandler Cantenzaro","NFLTeam":"Cardinals","percentOwn":90,"percentStart":20},' +
      '{"position":"DST","byeWeek":1,"fantasyPoints":31,"playerName":"Cardinals","NFLTeam":"Cardinals","percentOwn":90,"percentStart":20}' +
      ']'
    );

    this.testBids = JSON.parse('[' +
      '{"amount":24,"final":false,"playerName":"Aaron Rodgers","teamName":"Gunslingers","timeStamp":"2019-08-17T10:24:00.000Z"},' +
      '{"amount":23,"final":false,"playerName":"Aaron Rodgers","teamName":"Smack","timeStamp":"2019-08-17T10:25:00.000Z"},' +
      '{"amount":24,"final":false,"playerName":"Aaron Rodgers","teamName":"Diablos","timeStamp":"2019-08-17T10:25:30.000Z"},' +
      '{"amount":0,"final":false,"playerName":"","teamName":"Diablos","timeStamp":"2019-08-17T10:27:00.000Z"},' +
      '{"amount":8,"final":false,"playerName":"Kyler Murray","teamName":"Diablos","timeStamp":"2019-08-17T10:27:30.000Z"}' +
      ']'
    );

    this.http.get(this.getPlayersURL).subscribe((response: PlayerRecord[]) => {
      this.players = response; });

    this.http.get(this.getDraftInfoURL).subscribe((response: OwnerRecord[]) => {
      this.setupData.teams = response;
      this.setupData.budget = this.owners[0].remainingBudget;
      this.setupData.draftName = this.owners[0].draftName;
      this.setupData.leagueSize = this.owners.length;
      });

    this.http.get(this.getDraftedPlayersURL).subscribe((response: DraftedPlayerRecord[]) => {
      this.draftedPlayers = response; });

  }

  public storeDraftPick(record: DraftedPlayerRecord): Observable<any> {
    const jsonBody = JSON.stringify(record);

    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
      })
    };

    const returnObservable = this.http.post(this.saveDraftPickURL, jsonBody, httpOptions)

    returnObservable.subscribe(
      next => {},
      response => {
        // error condition
        console.log("POST call in error", response); },
      () => {
        // success condition
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
  public getPlayers(position): PlayerRecord[] {
    let names = [];

    for ( let player of this.draftedPlayers) {
      names.push(player.playerName);
    }

    const filteredList = this.players.filter(availablePlayer => !names.includes(availablePlayer.playerName));
    let finalList = filteredList;

    if (position != 'all') {
      finalList = filteredList.filter(availablePlayer => availablePlayer.position === position);
    }

    return finalList;

  }

  public getTeams(): OwnerRecord[] {
      return this.owners;
    }

  public setDraftOwner(owner: string) {
    this.draftOwner = owner;
  }
  public getDraftOwner() {
    return this.draftOwner;
  }
  public getDraftInfo(): SetupData {
    return this.setupData;
  }

  public storeSetupData(data: SetupData) {
    let jsonBody = JSON.stringify(this.setupData);

    this.setupData = data;
  }

  public getLatestBid() {
    return this.testBids[this.bidCount++ % 5];
  }
}
