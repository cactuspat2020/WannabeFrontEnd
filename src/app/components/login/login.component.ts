import {Component, NgZone, OnInit} from '@angular/core';
import { WannabeDAOService } from '../../services/wannabe-dao.service';
import { WannabeCsvDAOService } from '../../services/wannabe-csv-dao.service';
import { OwnerRecord } from '../../models/ownerRecord';
import { Router } from '@angular/router';
import { CookieService } from 'ngx-cookie-service';
import { Hub, Logger, Auth } from 'aws-amplify';

const logger = new Logger('My-Logger');


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
  userName: string;
  password: string;
  newPassword = '';
  authCode: string;
  isLoaded = false;
  displayReset = false;
  displayLogin = true;
  displayvalidate = false;
  displayPasswordChange = false;
  auth_object;

  ngZone: NgZone;

  constructor(ngZone: NgZone, wannabeDAO: WannabeDAOService, cookieService: CookieService, router: Router, csvDao: WannabeCsvDAOService) {
    this.wannabeDAO = wannabeDAO;
    this.wannabeCsvDAO = csvDao;
    this.router = router;
    this.draftOwner = 'none';
    this.cookieService = cookieService;
    this.ngZone = ngZone;
    this.auth_object = Auth;
  }

  ngOnInit() {
    this.wannabeDAO.fetchTeams().subscribe((response: OwnerRecord[]) => {
      this.teams = response;
      this.isLoaded = true;
      Hub.listen('auth', this.createAuthListener());

      if (this.cookieService.check('loginTeam')) {
        this.draftOwner = this.cookieService.get('loginTeam');
        this.wannabeDAO.setDraftOwner(this.draftOwner);
        this.ngZone.run(() => this.router.navigate(['/summary']));
      }
    });
  }

  createAuthListener() {
    const listener = (data) => {
      switch (data.payload.event) {
        case 'signIn':
          console.log('user signed in');
          Auth.currentUserPoolUser().then(
            authEntity => {
              const ownerRecord = this.teams.filter(name => (name.teamName.toLowerCase().split(' ').join('_') == authEntity.username));
              if (ownerRecord) {
                this.draftOwner = ownerRecord[0].teamName;
                this.wannabeDAO.setDraftOwner(this.draftOwner);
                this.wannabeDAO.forceNewWatchList();
                this.cookieService.set('loginTeam', this.draftOwner, 1);
                this.ngZone.run(() => this.router.navigate(['/summary']));
              } else {
                alert('Couldn\'t match your login to your team. Contact technical support');
              }
            });
          break;
        case 'signOut':
          logger.info('user signed out');
          console.log('user signed out');
          this.cookieService.delete('loginTeam');
          this.ngZone.run(() => this.router.navigate(['/']));
          break;
      }
    };
    return listener;
  }
  selectChange() {
    this.wannabeDAO.setDraftOwner(this.draftOwner);
    this.cookieService.set('loginTeam', this.draftOwner, 7);
  }
  displayResetDiv() {
    this.displayReset = true;
    this.displayLogin = false;
  }
  resetPassword() {
   Auth.forgotPassword(this.userName).then(x => {
     this.displayReset = false;
     this.displayvalidate = true;
   }, err => {
     alert (err.message);
   });
  }
  setPassword() {
    Auth.forgotPasswordSubmit(this.userName, this.authCode, this.password).then(x => {
      alert('Success! You can log in with your new password');
      this.displayvalidate = false;
      this.displayLogin = true;
      this.password = '';
    }, err => {
      alert (err.message);
    });
  }

  returnToLogin() {
    this.displayReset = false;
    this.displayLogin = true;
    this.displayvalidate = false;
    this.displayPasswordChange = false;
  }

  login() {
    Auth.signIn(this.userName, this.password).then(x => {
      if (x.challengeName === 'NEW_PASSWORD_REQUIRED') {
        if (this.newPassword === '') {
          this.displayPasswordChange = true;
        } else {
          Auth.completeNewPassword(x, this.newPassword).then(user => {
            alert('Success!');
            this.displayvalidate = false;
            this.displayLogin = true;
          }, err => {
            const a = 11;
            console.log(err.message);
            alert (err.message);
          });
        }
      }
    }, err => {
      alert(err.message);
    });
  }
}
