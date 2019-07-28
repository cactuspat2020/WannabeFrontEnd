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
  teams: OwnerRecord[] = [];
  draftOwner: string;
  password;
  passwordList: {[user: string]: string } =
     {
       'Gunslingers': 'owner',
       'Smack': 'admin',
       'Diablos': 'wannabe',
       'En Vogue': 'wannabe',
       'Davids Revenge': 'wannabe',
       'Smokey': 'wannabe',
       'Bud Light Man': 'wannabe',
       'SKOL': 'wannabe',
       'Boss Man II': 'wannabe',
       'Corn Bread': 'wannabe',
       'Bud Heavy': 'wannabe',
       'Big Daddy': 'wannabe',
      };

  constructor(wannabeDAO: WannabeDAOService, router: Router ) {
    this.wannabeDAO = wannabeDAO;
    this.router = router;
    this.draftOwner = 'none';
  }
  ngOnInit() {
    // this.wannabeDAO.fetchTeams().subscribe((response: OwnerRecord[]) => {
    //   this.teams = response;
    // });
    this.teams = this.wannabeDAO.getTeams();
  }

  selectChange() {
      this.wannabeDAO.setDraftOwner(this.draftOwner);
  }

  btnClick() {
    if (this.draftOwner === 'none') {
      alert ('Please choose your team before proceeding');
    } else if (this.passwordList[this.draftOwner] !== this.password) {
      alert ('Invalid Password. Please try again');
    } else {
      const isAdmin = this.teams.filter(team => team.teamName === this.draftOwner)[0].isAdmin;

      if ( isAdmin ) {
        this.router.navigate(['/setup']);
      } else {
        this.router.navigate(['/status']);
      }
    }
  }
}
