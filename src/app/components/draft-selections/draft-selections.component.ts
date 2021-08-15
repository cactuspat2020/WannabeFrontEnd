import { Component, OnInit, ViewChild } from '@angular/core';
import { WannabeDAOService } from 'src/app/services/wannabe-dao.service';
import {Observable} from 'rxjs';
import { PlayerRecord } from '../../models/playerRecord';
import { MatTableDataSource } from '@angular/material/table';
import {MatSort} from '@angular/material/sort';
import { OwnerRecord } from '../../models/ownerRecord';
import {FormControl} from '@angular/forms';
import {map, startWith} from 'rxjs/operators';
import { DraftedPlayerRecord } from 'src/app/models/draftedPlayerRecord';
import { IgxExcelExporterService, IgxExcelExporterOptions } from 'igniteui-angular';

@Component({
  selector: 'app-draft-selections',
  templateUrl: './draft-selections.component.html',
  styleUrls: ['./draft-selections.component.css']
})
export class DraftSelectionsComponent implements OnInit {
  wannabeDAO: WannabeDAOService;
  draftedPlayers: DraftedPlayerRecord[] = [];
  playerFilter = 'all';
  teams: OwnerRecord[];
  totalCount = 0;
  selectedCount = 0;
  budgetMessage = ' ';
  public playerList: PlayerRecord[] = [];
  excelExportService: IgxExcelExporterService;
  @ViewChild(MatSort, { static: true }) sort: MatSort;
  dataAvailable = false;
  isLoaded = false;

  // Table Variables
  dataSource = new MatTableDataSource(this.draftedPlayers);
  displayedColumns: string[] = ['draftOrder', 'position', 'playerName', 'NFLTeam', 'ownerName', 'price', 'fantasyPoints', 'assessment' ];


  constructor(wannabeDAO: WannabeDAOService, excelExportService: IgxExcelExporterService) {
    this.wannabeDAO = wannabeDAO;
    this.excelExportService = excelExportService;
  }
  ngOnInit() {
    if (this.wannabeDAO.dataAvalable() ) {
      // this.draftedPlayers = this.wannabeDAO.getDraftedPlayers('all');
      this.teams = this.wannabeDAO.getTeams();
      this.isLoaded = true;
      // this.totalCount = this.teams.length * 15;
      // this.selectedCount = this.draftedPlayers.length;
      // this.dataSource = new MatTableDataSource(this.draftedPlayers);
      // this.dataSource.sort = this.sort;
      // this.budgetMessage = '-';
      this.selectPlayers();
    } else {
        // this.fetchData();
        this.wannabeDAO.fetchDraftedPlayers()
        .subscribe((response: DraftedPlayerRecord[]) => {
          this.draftedPlayers = response;
          this.wannabeDAO.fetchTeams().subscribe((response2: OwnerRecord[]) => {
            this.teams = response2;
            this.isLoaded = true;
            // this.totalCount = response2.length * 15;
            // this.selectedCount = this.draftedPlayers.length;
            // this.dataSource = new MatTableDataSource(this.draftedPlayers);
            // this.dataSource.sort = this.sort;
            // this.budgetMessage = '-';
            this.selectPlayers();
          });
        });
    }
    this.wannabeDAO.storeAuditRecord('Draft Results');
  }
  fetchData() {
    this.wannabeDAO.fetchDraftedPlayers()
      .subscribe((response: DraftedPlayerRecord[]) => {
        this.draftedPlayers = response;
        this.wannabeDAO.fetchTeams().subscribe((response2: OwnerRecord[]) => {
          this.teams = response2;
          this.totalCount = response2.length * 15;
          this.selectedCount = this.draftedPlayers.length;
          this.dataSource = new MatTableDataSource(this.draftedPlayers);
          this.dataSource.sort = this.sort;
          this.budgetMessage = '-';
          this.isLoaded = true;
        });
      });
  }
  selectPlayers() {
    this.draftedPlayers = this.wannabeDAO.getDraftedPlayers(this.playerFilter);
    this.selectedCount = this.draftedPlayers.length;
    this.totalCount = this.playerFilter === 'all' ? this.teams.length * 15 : 15;
    this.dataSource = new MatTableDataSource(this.draftedPlayers);
    this.dataSource.sort = this.sort;
    if ( this.playerFilter !== 'all') {
      const budget = this.wannabeDAO.getMaxBid(this.playerFilter);
      this.budgetMessage = 'Max Bid = $' + budget;
    } else {
      this.budgetMessage = '-';
    }

    for (const player of this.draftedPlayers) {
      player.assessment = this.wannabeDAO.getPlayerRating(player);
    }

  }
  exportToExcel() {
    const igxExcelExportOptions = new IgxExcelExporterOptions('Wannabe');
    const jsonData = JSON.parse(JSON.stringify(this.draftedPlayers));

    this.excelExportService.exportData(jsonData, igxExcelExportOptions);
  }

  refresh() {
    this.fetchData();
  }
}
