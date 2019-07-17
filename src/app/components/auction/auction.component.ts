import { Component, OnInit } from '@angular/core';
import { WannabeDAOService } from 'src/app/services/wannabe-dao.service';
import { DraftBid } from 'src/app/models/draftBid';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { PlayerRecord } from '../../models/playerRecord';

@Component({
  selector: 'app-auction',
  templateUrl: './auction.component.html',
  styleUrls: ['./auction.component.css']
})
export class AuctionComponent implements OnInit {
  currentBid: DraftBid;
  wannabeDAO: WannabeDAOService;
  positionSelection: string;
  playerList;

  constructor(wannabeDAO: WannabeDAOService) {
    this.wannabeDAO = wannabeDAO;

    this.currentBid = this.wannabeDAO.getLatestBid();
  }

  ngOnInit() {
    // this.playerList = this.wannabeDAO.getPlayers('all', 'all');
    this.playerList = this.wannabeDAO.getPlayers('all', 'all').subscribe((response: PlayerRecord[]) => {
      this.playerList = response;
      console.log(this.playerList[0]);
    });
  }
  selectPlayers() {
    // this.playerList = this.wannabeDAO.getPlayers(this.positionSelection, 'available', this.playerList);
    this.playerList = this.wannabeDAO.getPlayers(this.positionSelection, 'available').subscribe((response: PlayerRecord[]) => {
      this.playerList = response;
      console.log(this.playerList[0]);
    });
  }
  onSubmit() {

  }

}
