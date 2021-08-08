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
  selector: 'app-watchlist',
  templateUrl: './watchlist.component.html',
  styleUrls: ['./watchlist.component.css']
})
export class WatchlistComponent implements OnInit {
  wannabeDAO: WannabeDAOService;
  selectedPlayer: DraftedPlayerRecord = new DraftedPlayerRecord();
  playerFilteredOptions: Observable<PlayerRecord[]>;
  playerList: PlayerRecord[] = [];
  draftedPlayerList: DraftedPlayerRecord[] = [];
  playerControl = new FormControl();
  dataSource = new MatTableDataSource(this.playerList);
  removeButtonEnabled = false;

  @ViewChild(MatSort, { static: true }) sort: MatSort;

  // Table Variables
  watchList: DraftedPlayerRecord[] = [];
  watchlistDataSource = new MatTableDataSource(this.watchList);
  displayedColumns: string[] = ['position', 'playerName', 'NFLTeam', 'byeWeek', 'fantasyPoints', 'rating', 'ownerName'];
  @ViewChild(MatSort, { static: true }) tableSort: MatSort;


  constructor(wannabeDAO: WannabeDAOService) {
    this.wannabeDAO = wannabeDAO;
  }

  ngOnInit() {
    this.wannabeDAO.watchlistInitialized = false;
    this.wannabeDAO.fetchPlayers().subscribe((players: PlayerRecord[]) => {
      this.playerList = players;
    });
    this.fetchTableData();
    this.playerFilteredOptions = this.playerControl.valueChanges
      .pipe(startWith<string | PlayerRecord>(''),
        map(value => typeof value === 'string' ? value : value.playerName),
        map(playerName => playerName ? this._filterPlayers(playerName) : this.playerList.slice())
      );
  }
  selectPlayers() {
    this.playerList = this.wannabeDAO.getPlayers('all');
    this.dataSource = new MatTableDataSource(this.playerList);
    this.dataSource.sort = this.sort;

    // Update the team auto complete
    this.playerFilteredOptions = this.playerControl.valueChanges
      .pipe(startWith<string | PlayerRecord>(''),
        map(value => typeof value === 'string' ? value : value.playerName),
        map(playerName => playerName ? this._filterPlayers(playerName) : this.playerList.slice())
      );

  }
  // Player autofill methods
  displayPlayerFn(player?: PlayerRecord): string | undefined {
    return player ? player.playerName : undefined;
  }

  private _filterPlayers(name: string): PlayerRecord[] {
    const filterValue = name.toLowerCase();

    return this.playerList.filter(option => option.playerName.toLowerCase().indexOf(filterValue) === 0);
  }
  selectRow(row) {
    this.removeButtonEnabled = true;
    this.selectedPlayer = row;
    console.log(row);
  }
  removePlayerFromWatchlist() {
    console.log('remove button clicked');
    this.wannabeDAO.deleteWatchlistPlayer(this.selectedPlayer).subscribe((data: any) => {
      this.fetchTableData();
    });
  }
  addPlayerClick() {
    const record = this.playerList.filter(x => x.playerName === this.selectedPlayer.playerName)[0];
    const watchedPlayer = new DraftedPlayerRecord();

    watchedPlayer.price = Number(0);
    watchedPlayer.ownerName = this.wannabeDAO.getDraftOwner();
    watchedPlayer.playerName = record.playerName;
    watchedPlayer.NFLTeam = record.NFLTeam;
    watchedPlayer.byeWeek = record.byeWeek;
    watchedPlayer.fantasyPoints = record.fantasyPoints;
    watchedPlayer.position = record.position;

    this.wannabeDAO.storeWatchlistPlayer(watchedPlayer).subscribe((x: any) => {
      // this.selectedPlayer.playerName = '';
      this.wannabeDAO.watchlistInitialized = false;
      this.wannabeDAO.fetchWatchList().subscribe((players: DraftedPlayerRecord[]) => {
        this.watchList = players;
        for (const player of this.watchList) {
          player.assessment = this.wannabeDAO.getPlayerRating(player);
        }
        this.watchlistDataSource = new MatTableDataSource(this.watchList);
        this.watchlistDataSource.sort = this.tableSort;
        this.selectedPlayer = new DraftedPlayerRecord();
      });
    });
  }

  refresh() {
    this.wannabeDAO.watchlistInitialized = false;
    this.fetchTableData();
  }
  playerIsDrafted(row: DraftedPlayerRecord): boolean {
    const isAMatch = this.draftedPlayerList.filter(x => x.playerName === row.playerName).length > 0;
    return isAMatch;
  }

  fetchTableData() {
    this.wannabeDAO.watchlistInitialized = false;
    this.wannabeDAO.fetchWatchList().subscribe((response2: DraftedPlayerRecord[]) => {
      this.watchList = response2;
      this.watchlistDataSource = new MatTableDataSource(this.watchList);
      this.watchlistDataSource.sort = this.tableSort;

      this.wannabeDAO.fetchPlayerRankings().subscribe((response3) => {
        for (const player of this.watchList) {
          player.assessment = this.wannabeDAO.getPlayerRating(player);
        }
      });
    });
  }
}
