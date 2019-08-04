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

@Component({
  selector: 'app-players',
  templateUrl: './players.component.html',
  styleUrls: ['./players.component.css']
})
export class PlayersComponent implements OnInit {

  wannabeDAO: WannabeDAOService;

  // 2-Way data binding
  selectedPlayer;
  selectedTeam;
  currentBid;
  PlayersTakenLabel;


  // Lists used for form elements
  playerList: PlayerRecord[] = [];
  draftedPlayers: DraftedPlayerRecord[] = [];
  // playerFilterValues: string[] = [];
  teamLookAheadValues: string[] = [];
  teams: OwnerRecord[];
  positionSelection: string;
  maxBid;
  owner;
  statusMessage = 'Initializing...';

  // AutoSelect Configurations
  teamControl = new FormControl();
  playerControl = new FormControl();
  teamFilteredOptions: Observable<OwnerRecord[]>;
  playerFilteredOptions: Observable<PlayerRecord[]>;
  @ViewChild(MatSort) sort: MatSort;

  // Table Variables
  dataSource = new MatTableDataSource(this.playerList);
  // displayedColumns2: string[] = ['position', 'playerName', 'NFLTeam', 'fantasyPoints', 'percentOwn', 'percentStart', 'byeWeek'];
  displayedColumns: string[] = ['position', 'playerName', 'NFLTeam', 'byeWeek'];

  constructor(wannabeDAO: WannabeDAOService) {
    this.wannabeDAO = wannabeDAO;
  }

  ngOnInit() {
    if (this.wannabeDAO.dataAvalable()) {
      this.teams = this.wannabeDAO.getTeams();
      this.playerList = this.wannabeDAO.getPlayers('all');
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
      this.owner = this.wannabeDAO.getDraftOwner();
      this.PlayersTakenLabel = this.wannabeDAO.getDraftedPlayers(this.owner).length + ' of 15';
      this.maxBid = this.wannabeDAO.getMaxBid(this.owner);
    } else {
      this.wannabeDAO.fetchPlayers().subscribe((response: PlayerRecord[]) => {
        this.playerList = response;
        this.wannabeDAO.fetchTeams().subscribe((response2: OwnerRecord[]) => {
          this.teams = response2;
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
          this.owner = this.wannabeDAO.getDraftOwner();
          this.PlayersTakenLabel = this.wannabeDAO.getDraftedPlayers(this.owner).length + ' of 15';
          this.maxBid = this.wannabeDAO.getMaxBid(this.owner);
        });
      });
    }
  }

  selectPlayers() {
    this.playerList = this.wannabeDAO.getPlayers(this.positionSelection);
    this.dataSource = new MatTableDataSource(this.playerList);
    this.dataSource.sort = this.sort;

    // Update the team auto complete
    this.playerFilteredOptions = this.playerControl.valueChanges
    .pipe( startWith<string | PlayerRecord>(''),
      map(value => typeof value === 'string' ? value : value.playerName),
      map(playerName => playerName ? this._filterPlayers(playerName) : this.playerList.slice())
    );

  }
  submit() {
    const draftedPlayer = new DraftedPlayerRecord();
    const record = this.selectedPlayer;

    draftedPlayer.price = Number(this.currentBid);
    draftedPlayer.ownerName = this.selectedTeam.teamName;
    draftedPlayer.playerName = record.playerName;
    draftedPlayer.NFLTeam = record.NFLTeam;
    draftedPlayer.byeWeek = record.byeWeek;
    draftedPlayer.fantasyPoints = record.fantasyPoints;
    draftedPlayer.position = record.position;

    this.wannabeDAO.storeDraftPick(draftedPlayer).subscribe(
      next => {},
      response => {
        // error condition
        console.log("POST call in error", response); },
       () => {
        // success condition
        this.playerList = this.wannabeDAO.getPlayers(this.selectPlayers);
        this.currentBid = '';
        this.selectedPlayer = '';
        this.selectedTeam = '';
        console.log("Success in action");
      });
  }

  // Callback when keys are pressed on the table filter
  applyFilter(filterValue: string) {
    this.dataSource.filter = filterValue.trim().toLowerCase();
  }

  // Callback when a table row is selected
  selectRow(row) {
    this.selectedPlayer = row.playerName;
  }

  // Team autofill methods
  displayTeamFn(owner?: OwnerRecord): string | undefined {
    return owner ? owner.teamName : undefined;
  }

  private _filterTeams(name: string): OwnerRecord[] {
    const filterValue = name.toLowerCase();

    return this.teams.filter(option => option.teamName.toLowerCase().indexOf(filterValue) === 0);
  }

  // Player autofill methods
  displayPlayerFn(player?: PlayerRecord): string | undefined {
    return player ? player.playerName : undefined;
  }

  private _filterPlayers(name: string): PlayerRecord[] {
    const filterValue = name.toLowerCase();

    return this.playerList.filter(option => option.playerName.toLowerCase().indexOf(filterValue) === 0);
  }

  private _getPlayer(playerName: string): PlayerRecord {
    const record = this.playerList.filter(player => player.playerName === playerName);
    return record[0];
  }
}
