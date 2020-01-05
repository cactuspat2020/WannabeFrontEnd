import { Component, OnInit, ViewChild } from '@angular/core';
import { WannabeDAOService } from 'src/app/services/wannabe-dao.service';
import { StatisticsService } from '../../services/statistics.service';
import { Observable } from 'rxjs';
import { PlayerRecord } from '../../models/playerRecord';
import { MatTableDataSource } from '@angular/material/table';
import { MatSort } from '@angular/material/sort';
import { OwnerRecord } from '../../models/ownerRecord';
import { FormControl } from '@angular/forms';
import { map, startWith } from 'rxjs/operators';
import { DraftedPlayerRecord } from 'src/app/models/draftedPlayerRecord';

class Summary {
  position: string;
  count: number;
  rating: number;
  legal: boolean;
}

@Component({
  selector: 'app-owner-summary',
  templateUrl: './owner-summary.component.html',
  styleUrls: ['./owner-summary.component.css']
})
export class OwnerSummaryComponent implements OnInit {

  wannabeDAO: WannabeDAOService;
  statisticsService: StatisticsService;
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
  allDraftedPlayers: DraftedPlayerRecord[] = [];
  playerRankings;
  // playerFilterValues: string[] = [];
  teamLookAheadValues: string[] = [];
  teams: OwnerRecord[];
  positionSelection: string;
  maxBid;
  owner;
  statusMessage = 'Initializing...';

  dataSource2 = new MatTableDataSource(this.draftedPlayers);
  displayedColumns2: string[] = ['draftOrder', 'position', 'playerName', 'NFLTeam', 'byeWeek', 'fantasyPoints', 'price', 'rating'];

  // AutoSelect Configurations
  teamControl = new FormControl();
  playerControl = new FormControl();
  teamFilteredOptions: Observable<OwnerRecord[]>;
  playerFilteredOptions: Observable<PlayerRecord[]>;
  @ViewChild(MatSort, { static: true }) sort: MatSort;
  @ViewChild(MatSort, { static: true }) sort2: MatSort;

  // Table Variables
  dataSource = new MatTableDataSource(this.playerList);
  // displayedColumns2: string[] = ['position', 'playerName', 'NFLTeam', 'fantasyPoints', 'percentOwn', 'percentStart', 'byeWeek'];
  displayedColumns: string[] = ['position', 'playerName', 'NFLTeam', 'byeWeek'];

  constructor(wannabeDAO: WannabeDAOService, statService: StatisticsService) {
    this.wannabeDAO = wannabeDAO;
    this.statisticsService = statService;
  }

  ngOnInit() {
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
            this.allDraftedPlayers = draftedPlayers;
            this.draftedPlayers = draftedPlayers.filter(x => x.ownerName === this.wannabeDAO.getDraftOwner());
            for (const player of draftedPlayers) {
              player.assessment = this.wannabeDAO.getPlayerRating(player);
            }
            this.dataSource2 = new MatTableDataSource(this.draftedPlayers);
            this.dataSource2.sort = this.sort2;

            this.statisticsService.getSpiderData(false).subscribe((spiderData: Map<string, Map<string, number>>) => {
              const spiderChart = this.generateSummary(this.wannabeDAO.getDraftOwner(), spiderData);
            });
          });
        });
      });
    });
  }

  refresh() {
    this.wannabeDAO.draftedPlayerListInitialized = false;
    this.ngOnInit();
  }
  generateSummary(teamName: string, draftRankingMap: Map<string, Map<string, number>>) {
    const positions = ['QB', 'RB', 'WR', 'TE', 'K', 'DST'];
    const legalMap: Map<string, number> = new Map([
      ['QB', 1], ['RB', 2], ['WR', 3], ['TE', 3], ['K', 1], ['DST', 1]]);

    for (const position of positions) {
      const record = new Summary();
      record.count = 0;
      record.legal = false;
      record.position = position;
      record.rating = null;

      // work through all the players drafted by this owner
      for (const player of this.draftedPlayers) {
        if (player.position === position) {
          record.count++;
          record.legal = record.count >= legalMap.get(position) ? true : false;
        }
      }
      this.summary.push(record);
    }

    // Combine WR/TE records
    this.combineReceivers();

    // Update Rankings
    this.updateRankings(teamName, draftRankingMap);

    // Reorder
    this.reOrderSummary();
  }

  // Determine where this player ranks against the others
  updateRankings(teamName: string, draftRankingMap: Map<string, Map<string, number>>) {
    const teamRankings = draftRankingMap.get(teamName);

    for (let position of Array.from(this.summary.map(x => x.position))) {
      let ranking = 1;
      position = position === 'WR/TE' ? 'Rec' : position;

      const ratedValue = teamRankings.get(position);

      for (const team of Array.from(draftRankingMap.keys()).filter(x => x !== 'averages')) {
        if (draftRankingMap.get(team).get(position) > ratedValue) {
          ranking++;
        }
      }

      // update the ranking
      position = position ===  'Rec' ? 'WR/TE' : position;

      const record = this.summary.filter( x => x.position === position)[0];
      record.rating = ranking;

      // replace the record in the array
      const tmpSummary = this.summary.filter( x => x.position !== position);
      tmpSummary.push(record);
      this.summary = tmpSummary;
    }
  }

  // this is just a helper function to put the summary entries into order (too lazy to do a custom sort)
  reOrderSummary() {
    const tmpRecord: Summary[] = [];
    tmpRecord.push(this.summary.filter(x => x.position === 'QB')[0]);
    tmpRecord.push(this.summary.filter(x => x.position === 'RB')[0]);
    tmpRecord.push(this.summary.filter(x => x.position === 'WR/TE')[0]);
    tmpRecord.push(this.summary.filter(x => x.position === 'K')[0]);
    tmpRecord.push(this.summary.filter(x => x.position === 'DST')[0]);
    this.summary = tmpRecord;
  }

  // combine the WR and TE into a common receivers
  combineReceivers() {
    const wrRecord = this.summary.filter(x => x.position === 'WR')[0];
    const teRecord = this.summary.filter(x => x.position === 'TE')[0];

    let receiverRecord = new Summary();
    if (teRecord != null) {
      receiverRecord.position = 'WR/TE';
      receiverRecord.count = wrRecord.count + teRecord.count;
      receiverRecord.legal = receiverRecord.count >= 3 ? true : false;
      receiverRecord.rating = wrRecord.rating;
    } else {
      receiverRecord.position = 'WR/TE';
      receiverRecord = wrRecord;
    }

    this.summary = this.summary.filter(x => x.position !== 'WR' && x.position !== 'TE');
    this.summary.push(receiverRecord);
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
