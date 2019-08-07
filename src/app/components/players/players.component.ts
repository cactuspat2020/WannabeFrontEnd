import { Component, OnInit, ViewChild } from '@angular/core';
import { WannabeDAOService } from 'src/app/services/wannabe-dao.service';
import { Observable } from 'rxjs';
import { PlayerRecord } from '../../models/playerRecord';
import { MatTableDataSource } from '@angular/material';
import { MatSort } from '@angular/material/sort';
import { OwnerRecord } from '../../models/ownerRecord';
import { FormControl } from '@angular/forms';
import { map, startWith } from 'rxjs/operators';
import { DraftedPlayerRecord } from 'src/app/models/draftedPlayerRecord';

class Summary {
  position: string;
  count: number;
  rating: string;
  legal: boolean;
}

@Component({
  selector: 'app-players',
  templateUrl: './players.component.html',
  styleUrls: ['./players.component.css']
})
export class PlayersComponent implements OnInit {

  wannabeDAO: WannabeDAOService;
  summary: Summary[] = [];

  // 2-Way data binding
  selectedPlayer;
  selectedTeam;
  currentBid;
  PlayersTakenLabel;
  qbTaken;
  qbRating;
  qbLegal;


  // Lists used for form elements
  playerList: PlayerRecord[] = [];
  draftedPlayers: DraftedPlayerRecord[] = [];
  playerRankings;
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
      this.draftedPlayers = this.wannabeDAO.getDraftedPlayers(this.wannabeDAO.getDraftOwner());
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

      this.playerRankings = this.wannabeDAO.getPlayerRankings();

      this.dataSource = new MatTableDataSource(this.playerList);
      this.dataSource.sort = this.sort;
      this.owner = this.wannabeDAO.getDraftOwner();
      this.PlayersTakenLabel = this.wannabeDAO.getDraftedPlayers(this.owner).length + ' of 15';
      this.maxBid = this.wannabeDAO.getMaxBid(this.owner);
      this.generateSummary();
    } else {
      // First get all the players
      this.wannabeDAO.fetchPlayers().subscribe((response: PlayerRecord[]) => {
        this.playerList = response;

        // Next get the player rankings
        this.wannabeDAO.fetchPlayerRankings().subscribe((response2) => {
          this.playerRankings = this.wannabeDAO.getRankingMap(response2);

          // Next get all the team names
          this.wannabeDAO.fetchTeams().subscribe((response3: OwnerRecord[]) => {
            this.teams = response3;
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

            // Finaly get the drafted players and generate the summary.
            this.wannabeDAO.fetchDraftedPlayers().subscribe((draftedPlayers: DraftedPlayerRecord[]) => {
              this.draftedPlayers = draftedPlayers.filter(x => x.ownerName === this.wannabeDAO.getDraftOwner());
              this.generateSummary();
            });
          });
        });
      });
    }
  }

  generateSummary() {
    const positions = ['QB', 'RB', 'WR', 'TE', 'K', 'DST'];
    const legalMap: Map<string, number> = new Map([
      ['QB', 1], ['RB', 2], ['WR', 3], ['TE', 3], ['K', 1], ['DST', 1]]);

    for (const player of this.draftedPlayers) {
      player.assessment = this.wannabeDAO.getPlayerRating(player);
    }
    for (const position of positions) {
      const record = new Summary();
      record.count = 0;
      record.legal = false;
      record.position = position;
      record.rating = null;
      for (const player of this.draftedPlayers) {
        if (player.position === position) {
          record.count++;
          record.legal = record.count >= legalMap.get(position) ? true : false;
          if (record.rating === null) {
            record.rating = player.assessment;
          } else if (player.assessment === 'Elite') {
            record.rating = 'Elite';
          } else if (player.assessment === 'All Pro' && record.rating !== 'Elite') {
            record.rating = player.assessment;
          } else if (player.assessment === 'Starter' && record.rating !== 'Elite' && record.rating !== 'All Pro') {
            record.rating = player.assessment;
          } else {
            record.rating = player.assessment;
          }
        }
      }
      this.summary.push(record);
    }
    const wrRecord = this.summary.filter(x => x.position === 'WR')[0];
    const teRecord = this.summary.filter(x => x.position === 'TE')[0];
    let receiverRecord = new Summary();
    if (teRecord != null) {
      receiverRecord.position = 'WR/TE';
      receiverRecord.count = wrRecord.count + teRecord.count;
      receiverRecord.legal = wrRecord.legal || teRecord.legal;
      receiverRecord.rating = wrRecord.rating;
    } else {
      receiverRecord.position = 'WR/TE';
      receiverRecord = wrRecord;
    }
    this.summary = this.summary.filter(x => x.position !== 'WR' && x.position !== 'TE');
    this.summary.push(receiverRecord);
    const tmpRecord: Summary[] = [];
    tmpRecord.push(this.summary.filter(x => x.position === 'QB')[0]);
    tmpRecord.push(this.summary.filter(x => x.position === 'RB')[0]);
    tmpRecord.push(this.summary.filter(x => x.position === 'WR/TE')[0]);
    tmpRecord.push(this.summary.filter(x => x.position === 'K')[0]);
    tmpRecord.push(this.summary.filter(x => x.position === 'DST')[0]);

    this.summary = tmpRecord;
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
      next => { },
      response => {
        // error condition
        console.log("POST call in error", response);
      },
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
