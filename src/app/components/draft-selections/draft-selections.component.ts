import { Component, OnInit, ViewChild } from '@angular/core';
import { WannabeDAOService } from 'src/app/services/wannabe-dao.service';
import {Observable} from 'rxjs';
import { PlayerRecord } from '../../models/playerRecord';
import { MatTableDataSource } from '@angular/material';
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
  playerFilter: string;
  teams: OwnerRecord[];
  totalCount = 0;
  selectedCount = 0;
  public playerList: PlayerRecord[] = [];
  excelExportService: IgxExcelExporterService;
  @ViewChild(MatSort) sort: MatSort;

  // Table Variables
  dataSource = new MatTableDataSource(this.draftedPlayers);
  displayedColumns: string[] = ['draftOrder', 'position', 'playerName', 'NFLTeam', 'ownerName', 'price', 'fantasyPoints' ];


  constructor(wannabeDAO: WannabeDAOService, excelExportService: IgxExcelExporterService) {
    this.wannabeDAO = wannabeDAO;
    this.excelExportService = excelExportService;
  }
  ngOnInit() {
    this.draftedPlayers = this.wannabeDAO.getDraftedPlayers('all');
    this.selectedCount = this.draftedPlayers.length;
    this.teams = this.wannabeDAO.getTeams();
    this.totalCount = this.teams.length * 15;
    this.dataSource = new MatTableDataSource(this.draftedPlayers);
    this.dataSource.sort = this.sort;
  }
  selectPlayers() {
    this.draftedPlayers = this.wannabeDAO.getDraftedPlayers(this.playerFilter);
    this.selectedCount = this.draftedPlayers.length;
    this.totalCount = this.playerFilter === 'all' ? this.teams.length * 15 : 15;
    this.dataSource = new MatTableDataSource(this.draftedPlayers);
    this.dataSource.sort = this.sort;
  }
  exportToExcel() {
    const igxExcelExportOptions = new IgxExcelExporterOptions('Wannabe');
    const jsonData = JSON.parse(JSON.stringify(this.draftedPlayers));

    this.excelExportService.exportData(jsonData, igxExcelExportOptions);
  }
}
