import { Component, OnInit } from '@angular/core';
import { WannabeDAOService } from 'src/app/services/wannabe-dao.service';
import { Router } from '@angular/router';
import { CookieService } from 'ngx-cookie-service';

interface MenuItem {
  label: string;
  link: string;
  disabled: boolean;
}

@Component({
  selector: 'app-menu',
  templateUrl: './menu.component.html',
  styleUrls: ['./menu.component.css']
})
export class MenuComponent implements OnInit {
  title = 'wannabe';
  ownerLinks: MenuItem[] = [
    {label: 'Login', link: '/login', disabled: false},
    {label: 'Setup', link: '/setup', disabled: false},
    {label: 'Auction', link: '/auction', disabled: false},
    {label: 'Status', link: '/status', disabled: false},
    {label: 'Summary', link: '/summary', disabled: false},
    {label: 'Watchlist', link: '/watchlist', disabled: false},
  ];
  adminLinks: MenuItem[] = [
    {label: 'Login', link: '/login', disabled: false},
    {label: 'Setup', link: '/setup', disabled: false},
    {label: 'Auction', link: '/auction', disabled: false},
    {label: 'Status', link: '/status', disabled: false},
    {label: 'Summary', link: '/summary', disabled: false},
    {label: 'Watchlist', link: '/watchlist', disabled: false},
  ];
  userLinks: MenuItem[] = [
    {label: 'Login', link: '/login', disabled: false},
    {label: 'Setup', link: '/setup', disabled: false},
    {label: 'Auction', link: '/auction', disabled: false},
    {label: 'Status', link: '/status', disabled: false},
    {label: 'Summary', link: '/summary', disabled: false},
    {label: 'Watchlist', link: '/watchlist', disabled: false},
  ];
  links: MenuItem[] = [];
  activeLink = this.links[0];
  background = 'primary';
  wannabeDAO: WannabeDAOService;
  router: Router;
  cookieService: CookieService;

  constructor(wannabeDAO: WannabeDAOService, router: Router, cookieService: CookieService) {
    this.wannabeDAO = wannabeDAO;
    this.router = router;
    this.cookieService = cookieService;

    const loggedInOwner = this.cookieService.get('loginTeam');
    this.wannabeDAO.setDraftOwner(loggedInOwner);
  }

  ngOnInit() {
    const loggedInOwner = this.cookieService.get('loginTeam');
    if (!loggedInOwner) {
      this.router.navigate(['/login']);
    }

    if (loggedInOwner === 'Gunslingers') {
      this.links = this.ownerLinks;
    } else if (loggedInOwner === 'Smack') {
      this.links = this.adminLinks;
    } else {
      this.links = this.userLinks;
    }
  }
}
    // this.wannabeDAO.fetchTeams().subscribe((response: OwnerRecord[]) => {
      // const teamRecord = response.filter(x => x.teamName === loggedInOwner)[0];

      // set privledged links
      // this.links[1].disabled = !teamRecord.isAdmin;
      // this.links[2].disabled = !teamRecord.isAdmin;

      // if (loggedInOwner === 'Gunslingers') {
        // this.links[4].disabled = !teamRecord.isAdmin;
      // }

    // });
