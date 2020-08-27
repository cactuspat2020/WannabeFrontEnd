import { Component, OnInit } from '@angular/core';
import { WannabeDAOService } from 'src/app/services/wannabe-dao.service';
import { Observable } from 'rxjs';
import { PlayerRecord } from '../../models/playerRecord';
import { MatTableDataSource } from '@angular/material/table';
import { OwnerRecord } from '../../models/ownerRecord';
import { DraftStatus } from '../../models/DraftStatus';
import { OwnerDraftStatus } from '../../models/OwnerDraftStatus';
import { FormControl } from '@angular/forms';
import { map, startWith } from 'rxjs/operators';
import { DraftedPlayerRecord } from 'src/app/models/draftedPlayerRecord';

@Component({
  selector: 'app-budgets',
  templateUrl: './budgets.component.html',
  styleUrls: ['./budgets.component.css']
})


export class BudgetsComponent implements OnInit {

  wannabeDAO: WannabeDAOService;
  draftedPlayers: DraftedPlayerRecord[] = [];
  teams: OwnerRecord[];
  draftMap = new Map<string, OwnerDraftStatus>();
  budgetTable = [];
  dataSource = new MatTableDataSource(this.budgetTable);
  displayedColumns: string[] = ['team', 'budget', 'QB', 'RB', 'WR', 'TE', 'K', 'DST'];

  constructor(wannabeDAO: WannabeDAOService) {
    this.wannabeDAO = wannabeDAO;
  }

  ngOnInit() {
    if (this.wannabeDAO.dataAvalable()) {
      this.draftedPlayers = this.wannabeDAO.getDraftedPlayers('all');
      this.teams = this.wannabeDAO.getTeams();

      this.buildBudgetMap();
      this.createDataTable();
      this.dataSource = new MatTableDataSource(this.budgetTable);
    } else {
      this.fetchData();
    }
  }

  fetchData() {
    this.wannabeDAO.fetchDraftedPlayers().subscribe((playerResponse: DraftedPlayerRecord[]) => {
        this.draftedPlayers = playerResponse;
        this.wannabeDAO.fetchTeams().subscribe((teamResponse: OwnerRecord[]) => {
          this.teams = teamResponse;
          this.wannabeDAO.fetchPlayerRankings().subscribe(rankingsResponse => {

          this.buildBudgetMap();
          this.createDataTable();
          this.dataSource = new MatTableDataSource(this.budgetTable);

          console.log('done');
          });
        });
      });
  }

  buildBudgetMap() {
    const ratingMap = new Map<string, number>();
    ratingMap.set('Elite', 4);
    ratingMap.set('All Pro', 3);
    ratingMap.set('Starter', 2);
    ratingMap.set('Bench', 1);
    ratingMap.set('none', 0);

    // Initialize the draftMap by creating empty records for each team
    this.teams.forEach(team => {
      const positions = ['QB', 'RB', 'WR', 'TE', 'K', 'DST'];

      const ownerRecord = new OwnerDraftStatus();
      positions.forEach(position => {
        ownerRecord.positions.set(position, new DraftStatus());
      });
      ownerRecord.remainingBudget = team.budget;
      this.draftMap.set(team.teamName, ownerRecord);
    });

    // evaluate each drafted player
    this.draftedPlayers.forEach(player => {
      const ownerDraftStatus = this.draftMap.get(player.ownerName);
      ownerDraftStatus.remainingBudget -= player.price;
      ownerDraftStatus.totalDraftedPlayers++;

      const draftStatus = ownerDraftStatus.positions.get(player.position);
      draftStatus.playerCount++;

      console.log('getting player Rating for ' + player.playerName);
      const playerRating = this.wannabeDAO.getPlayerRating(player);

      if (ownerDraftStatus.positions.has(player.position)) {
        if (ratingMap.get(playerRating) > ratingMap.get(draftStatus.maxRating)) {
          draftStatus.maxRating = playerRating;
        }
      } else {
        draftStatus.maxRating = playerRating;
        ownerDraftStatus.positions.set(player.position, draftStatus);
      }
    });
  }

  createDataTable() {
    const owners = Array.from(this.draftMap.keys());
    this.budgetTable = [];

    owners.forEach(owner => {
      const record = this.draftMap.get(owner);
      const maxBid = record.remainingBudget - Math.max(0, (15 - record.totalDraftedPlayers - 1));

      this.budgetTable.push({
        team: owner,
        maxBid: '$' + maxBid,
        qbCount: record.positions.get('QB').playerCount,
        qbRating: record.positions.get('QB').maxRating,
        rbCount: record.positions.get('RB').playerCount,
        rbRating: record.positions.get('RB').maxRating,
        wrCount: record.positions.get('WR').playerCount,
        wrRating: record.positions.get('WR').maxRating,
        teCount: record.positions.get('TE').playerCount,
        teRating: record.positions.get('TE').maxRating,
        kCount: record.positions.get('K').playerCount,
        kRating: record.positions.get('K').maxRating,
        dstCount: record.positions.get('DST').playerCount,
        dstRating: record.positions.get('DST').maxRating
      });
    });
    console.log('hi');
  }

  refresh() {
    this.fetchData();
   }
}
