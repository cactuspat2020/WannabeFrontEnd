import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { PlayerRecord } from '../models/playerRecord';
import { OwnerRecord } from '../models/ownerRecord';
import { SetupData } from '../models/setupData';
import { DraftBid } from '../models/draftBid';



@Injectable({
  providedIn: 'root'
})


export class WannabeDAOService {
  baseURL = 'https://u4oe9qvb4k.execute-api.us-west-2.amazonaws.com/default/';
  http: HttpClient;
  // players: PlayerRecord[] = [];
  players;
  owners: OwnerRecord[] = [];
  setupData: SetupData;
  testBids: DraftBid[];
  url: string;
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

    this.testBids = JSON.parse('[' +
      '{"amount":24,"final":false,"playerName":"Aaron Rodgers","teamName":"Gunslingers","timeStamp":"2019-08-17T10:24:00.000Z"},' +
      '{"amount":23,"final":false,"playerName":"Aaron Rodgers","teamName":"Smack","timeStamp":"2019-08-17T10:25:00.000Z"},' +
      '{"amount":24,"final":false,"playerName":"Aaron Rodgers","teamName":"Diablos","timeStamp":"2019-08-17T10:25:30.000Z"},' +
      '{"amount":0,"final":false,"playerName":"","teamName":"Diablos","timeStamp":"2019-08-17T10:27:00.000Z"},' +
      '{"amount":8,"final":false,"playerName":"Kyler Murray","teamName":"Diablos","timeStamp":"2019-08-17T10:27:30.000Z"}' +
      ']'
    );
  }

  // public getPlayers(position, playerList): PlayerRecord[] {
  //   this.url = this.baseURL + 'getPlayers?position=' + position + '&playerList=' + playerList;

  //   this.http.get(this.url).subscribe((response: PlayerRecord[]) => {
  //     this.players = response;
  //     console.log(this.players[0]);
  //   });
  //   return this.players;
  // }

  public getFakeSetup() {
    return this.setupData;
  }
  public getPlayers(position, playerList): Observable <any> {
    this.url = this.baseURL + 'getPlayers?position=' + position + '&playerList=' + playerList;

    return this.http.get(this.url);
  }

  public getTeams(): OwnerRecord[] {
    this.url = this.baseURL + '/getDraftInfo';
    this.getDraftInfo().subscribe((response: OwnerRecord[]) => {
      this.owners = response;

      this.setupData.teams = this.owners;
      this.setupData.budget = this.owners[0].remainingBudget;
      this.setupData.draftName = this.owners[0].draftName;
      this.setupData.leagueSize = this.owners.length;
      return this.owners;
    });

    return this.owners;
  }

  public setDraftOwner(owner: string) {
    this.draftOwner = owner;
  }
  public getDraftOwner() {
    return this.draftOwner;
  }
  public getDraftInfo(): Observable <any> {
    this.url = this.baseURL + 'getDraftInfo';
    return this.http.get(this.url);
  }

  public storeSetupData(data: SetupData) {
    let jsonBody = JSON.stringify(this.setupData);

    this.setupData = data;
  }

  public getLatestBid() {
    return this.testBids[this.bidCount++ % 5];
  }
}
