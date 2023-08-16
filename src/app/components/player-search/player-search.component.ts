import { Component, OnInit, ViewChild } from '@angular/core';
import { WannabeDAOService } from 'src/app/services/wannabe-dao.service';
import { Observable } from 'rxjs';
import { PlayerRecord } from '../../models/playerRecord';
import { MatTableDataSource } from '@angular/material/table';
import { MatSort } from '@angular/material/sort';
import { OwnerRecord } from '../../models/ownerRecord';
import { FormControl } from '@angular/forms';
import { map, startWith } from 'rxjs/operators';
import { DraftedPlayerRecord } from 'src/app/models/draftedPlayerRecord';

@Component({
  // tslint:disable-next-line:component-selector
  selector: 'player-search',
  templateUrl: './player-search.component.html',
  styleUrls: ['./player-search.component.css']
})
export class PlayerSearchComponent implements OnInit {
  wannabeDAO: WannabeDAOService;

  // 2-Way data binding
  selectedPlayer;

  // Lists used for form elements
  playerList: PlayerRecord[] = [];
  teams: OwnerRecord[];
  positionSelection: string;
  isLoaded = false;

  // AutoSelect Configurations
  teamControl = new FormControl();
  playerControl = new FormControl();
  teamFilteredOptions: Observable<OwnerRecord[]>;
  playerFilteredOptions: Observable<PlayerRecord[]>;
  @ViewChild(MatSort, { static: true }) sort: MatSort;

  // Table Variables
  dataSource = new MatTableDataSource(this.playerList);
  displayedColumns: string[] = ['position', 'playerName', 'NFLTeam', 'fantasyPoints',
    'percentOwn', 'percentStart', 'byeWeek', 'assessment', 'cost'];

  limitedDisplayColumns: string[] = ['position', 'playerName', 'NFLTeam', 'byeWeek' ];
  constructor(wannabeDAO: WannabeDAOService) {
    this.wannabeDAO = wannabeDAO;
  }

  ngOnInit() {
    this.wannabeDAO.fetchPlayers().subscribe(playerList => {
      this.wannabeDAO.draftedPlayerListInitialized = false;
      this.wannabeDAO.fetchDraftedPlayers().subscribe((draftedPlayers: DraftedPlayerRecord[]) => {
        for (const player of draftedPlayers) {
          playerList = playerList.filter(x => x.playerName !== player.playerName);
        }
        this.playerList = playerList;
        this.wannabeDAO.fetchTeams().subscribe((response2: OwnerRecord[]) => {
          this.teams = response2;
          this.initVariables();
          // this.assessCosts();
        });
      });
    });
    this.wannabeDAO.storeAuditRecord('Auction');
  }

  refresh() {
    this.ngOnInit();
  }
  private initVariables() {
    this.playerFilteredOptions = this.playerControl.valueChanges
      .pipe(startWith<string | PlayerRecord>(''),
        map(value => typeof value === 'string' ? value : value.playerName),
        map(playerName => playerName ? this._filterPlayers(playerName) : this.playerList.slice())
      );
    this.teamFilteredOptions = this.teamControl.valueChanges
      .pipe(startWith<string | OwnerRecord>(''),
        map(value => typeof value === 'string' ? value : value.teamName),
        map(teamName => teamName ? this._filterTeams(teamName) : this.teams.slice())
      );

    this.dataSource = new MatTableDataSource(this.playerList);
    this.dataSource.sort = this.sort;

    if (this.wannabeDAO.getDraftOwner() !== 'Gunslingers') {
      this.displayedColumns = this.limitedDisplayColumns;
    }
    this.isLoaded = true;
  }

  assessCosts() {
    const positions: string[] = ['QB', 'RB', 'K', 'DST'];
    for (const pos of positions) {
      const playerList = this.playerList.filter(x => x.position === pos);
      let rank = 1;
      for (const player of playerList) {
        player.costEstimate = this.wannabeDAO.getAveCost(rank++, pos.toLowerCase());
      }
    }
    const receiverList = this.playerList.filter(x => x.position === 'WR' || x.position === 'TE');
    receiverList.sort((a, b) => b.fantasyPoints - a.fantasyPoints);
    let i = 1;
    for (const player of receiverList) {
      player.costEstimate = this.wannabeDAO.getAveCost(i++, 'rec');
    }
  }

  selectPlayers() {
    this.playerList = this.wannabeDAO.getPlayers(this.positionSelection);
    this.dataSource = new MatTableDataSource(this.playerList);
    this.dataSource.sort = this.sort;

    // Update the team auto complete
    this.playerFilteredOptions = this.playerControl.valueChanges
      .pipe(startWith<string | PlayerRecord>(''),
        map(value => typeof value === 'string' ? value : value.playerName),
        map(playerName => playerName ? this._filterPlayers(playerName) : this.playerList.slice())
      );

  }

  submit() {

  }
  // Callback when keys are pressed on the table filter
  applyFilter(filterValue: string) {
    this.dataSource.filter = filterValue.trim().toLowerCase();
  }

  private _filterTeams(name: string): OwnerRecord[] {
    const filterValue = name.toLowerCase();

    return this.teams.filter(option => option.teamName.toLowerCase().indexOf(filterValue) === 0);
  }

  private _filterPlayers(name: string): PlayerRecord[] {
    const filterValue = name.toLowerCase();

    return this.playerList.filter(option => option.playerName.toLowerCase().indexOf(filterValue) === 0);
  }
}
