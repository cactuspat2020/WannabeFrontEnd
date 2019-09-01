import { Component, OnInit } from '@angular/core';
import { WannabeDAOService } from '../../services/wannabe-dao.service';
import { WannabeCsvDAOService } from '../../services/wannabe-csv-dao.service';
import { OwnerRecord } from '../../models/ownerRecord';
import { Router } from '@angular/router';
import { SetupData } from '../../models/setupData';
import { CookieService } from 'ngx-cookie-service';


@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {
  wannabeDAO: WannabeDAOService;
  wannabeCsvDAO: WannabeCsvDAOService;
  router: Router;
  cookieService: CookieService;
  teams: OwnerRecord[] = [];
  draftOwner: string;
  password;
  isLoaded = false;
  passwordList: { [user: string]: string } =
    {
      'Gunslingers': 'owner',
      'Smack': 'admin',
      'Diablos': 'wannabe',
      'Vogue': 'wannabe',
      'Davids Revenge': 'wannabe',
      'Smokey': 'wannabe',
      'Bud Light Man': 'wannabe',
      'SKOL': 'wannabe',
      'Mr. Suck It': 'wannabe',
      'Corn Bread': 'wannabe',
      'Bud Heavy': 'wannabe',
      'Big Daddy': 'wannabe',
    };

  constructor(wannabeDAO: WannabeDAOService, cookieService: CookieService, router: Router, csvDao: WannabeCsvDAOService) {
    this.wannabeDAO = wannabeDAO;
    this.wannabeCsvDAO = csvDao;
    this.router = router;
    this.draftOwner = 'none';
    this.cookieService = cookieService;
  }
  ngOnInit() {
    this.wannabeDAO.fetchTeams().subscribe((response: OwnerRecord[]) => {
      this.teams = response;
      this.isLoaded = true;
    });
  }

  selectChange() {
    this.wannabeDAO.setDraftOwner(this.draftOwner);
    this.cookieService.set('loginTeam', this.draftOwner, 1);
  }

  login() {
    if (this.draftOwner === 'none') {
      alert('Please choose your team before proceeding');
    } else if (this.passwordList[this.draftOwner] === this.password ||
      (this.password === 'wannabe' && this.draftOwner !== 'Gunslingers')) {
      const isAdmin = this.teams.filter(team => team.teamName === this.draftOwner)[0].isAdmin;
      this.wannabeDAO.forceNewWatchList();

      if (isAdmin) {
        this.router.navigate(['/setup']);
      } else {
        this.router.navigate(['/status']);
      }
    } else {
      alert('Invalid Password. Please try again');
    }
  }
}
