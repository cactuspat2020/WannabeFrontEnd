import { Component, OnInit } from '@angular/core';
import { WannabeDAOService } from '../../services/wannabe-dao.service';
import { OwnerRecord } from '../../models/ownerRecord';
import { Router } from '@angular/router';
import { SetupData } from '../../models/setupData';

@Component({
  selector: 'app-draft-home',
  templateUrl: './draft-home.component.html',
  styleUrls: ['./draft-home.component.css']
})
export class DraftHomeComponent implements OnInit {
  wannabeDAO: WannabeDAOService;
  router: Router;
  teams: OwnerRecord[];
  draftStatus: SetupData;
  draftOwner: string;

  constructor(wannabeDAO: WannabeDAOService, router: Router ) {
    this.wannabeDAO = wannabeDAO;
    this.router = router;
    this.draftOwner = 'none';
    this.draftStatus = new SetupData('', 0, 0, []);
  }
  ngOnInit() {
    // this.playerList = this.wannabeDAO.getPlayers('all', 'all');
    this.wannabeDAO.getDraftInfo().subscribe((response: OwnerRecord[]) => {
    this.teams = response;
    this.draftStatus.draftName = this.teams[0].draftName;
    this.draftStatus.budget = this.teams[0].remainingBudget;
    this.draftStatus.leagueSize = this.teams.length;
    this.draftStatus.teams = this.teams;
    });
  }

  selectChange() {
    let a = this.draftOwner;
    let b = a;
  }
  btnClick() {
    if(this.draftOwner == 'none') {
      alert ('Please choose your team before proceeding');
    } else {
    this.router.navigate(['/auction']);
    }
}

}
