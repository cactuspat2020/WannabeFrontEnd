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
  draftOwner: string;

  constructor(wannabeDAO: WannabeDAOService, router: Router ) {
    this.wannabeDAO = wannabeDAO;
    this.router = router;
    this.draftOwner = 'none';
  }
  ngOnInit() {
    this.teams = this.wannabeDAO.getTeams();
  }

  selectChange() {
      this.wannabeDAO.setDraftOwner(this.draftOwner);
  }

  btnClick() {
    if (this.draftOwner === 'none') {
      alert ('Please choose your team before proceeding');
    } else {
      this.router.navigate(['/auction']);
    }
}

}
