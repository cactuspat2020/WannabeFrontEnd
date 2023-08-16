import {Component, NgZone, OnInit} from '@angular/core';
import { Auth } from 'aws-amplify';
import {Router} from '@angular/router';

@Component({
  selector: 'app-logout',
  templateUrl: './logout.component.html',
  styleUrls: ['./logout.component.css']
})
export class LogoutComponent implements OnInit {
  ngZone: NgZone;
  router: Router;

  constructor(ngZone: NgZone, router: Router) {
    this.ngZone = ngZone;
    this.router = router;
  }

  ngOnInit() {
    Auth.signOut().then(x => {
      console.log('user signed out');
      this.ngZone.run(() => this.router.navigate(['/login']));
    });
  }
}
