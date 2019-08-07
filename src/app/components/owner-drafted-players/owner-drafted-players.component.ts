import { Component, OnInit, ViewChild } from '@angular/core';
import { WannabeDAOService } from 'src/app/services/wannabe-dao.service';
import { DraftedPlayerRecord } from 'src/app/models/draftedPlayerRecord';
import { MatTableDataSource } from '@angular/material';
import { MatSort } from '@angular/material/sort';

@Component({
  selector: 'app-owner-drafted-players',
  templateUrl: './owner-drafted-players.component.html',
  styleUrls: ['./owner-drafted-players.component.css']
})
export class OwnerDraftedPlayersComponent implements OnInit {
  wannabeDAO: WannabeDAOService;
  draftedPlayers: DraftedPlayerRecord[] = [];
  dataSource2 = new MatTableDataSource(this.draftedPlayers);
  displayedColumns2: string[] = ['draftOrder', 'position', 'playerName', 'NFLTeam', 'byeWeek', 'fantasyPoints', 'price', 'rating'];
  isLoaded = false;

  @ViewChild(MatSort) sort2: MatSort;

  constructor(wannabeDAO: WannabeDAOService) {
    this.wannabeDAO = wannabeDAO;
  }

  ngOnInit() {
    if (this.wannabeDAO.dataAvalable()) {
      this.draftedPlayers = this.wannabeDAO.getDraftedPlayers(this.wannabeDAO.getDraftOwner());
      this.dataSource2 = new MatTableDataSource(this.draftedPlayers);
      this.dataSource2.sort = this.sort2;

      for (const player of this.draftedPlayers) {
        player.assessment = this.wannabeDAO.getPlayerRating(player);
      }
    } else {
      this.fetchData();
    }
  }

  fetchData() {
    this.wannabeDAO.fetchDraftedPlayers().subscribe((response2: DraftedPlayerRecord[]) => {
      this.draftedPlayers = response2
        .filter(record => record.ownerName === this.wannabeDAO.getDraftOwner());
      this.dataSource2 = new MatTableDataSource(this.draftedPlayers);
      this.dataSource2.sort = this.sort2;

      this.wannabeDAO.fetchPlayerRankings().subscribe((response3) => {
        for (const player of this.draftedPlayers) {
          player.assessment = this.wannabeDAO.getPlayerRating(player);
        }

      });
    });
  }

}
