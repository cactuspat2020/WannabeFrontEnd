import { Component, OnInit } from '@angular/core';
import { WannabeDAOService } from 'src/app/services/wannabe-dao.service';
import { Router } from '@angular/router';
import { CookieService } from 'ngx-cookie-service';
import { DeviceDetectorService } from 'ngx-device-detector';
import { MatButtonModule } from '@angular/material/button';
import {MatMenuModule} from '@angular/material/menu';

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
    {label: 'Setup', link: '/setup', disabled: false},
    {label: 'Auction', link: '/auction', disabled: false},
    {label: 'DraftBoard', link: '/status', disabled: false},
    {label: 'MyDraft', link: '/summary', disabled: false},
    {label: 'MyWatchlist', link: '/watchlist', disabled: false},
    {label: 'Budgets', link: '/budgets', disabled: false},
    {label: 'Statistics', link: '/statistics', disabled: false},
    {label: 'Logout', link: '/logout', disabled: false},
  ];
  adminLinks: MenuItem[] = [
    {label: 'Setup', link: '/setup', disabled: false},
    {label: 'Auction', link: '/auction', disabled: false},
    {label: 'DraftBoard', link: '/status', disabled: false},
    {label: 'MyDraft', link: '/summary', disabled: false},
    {label: 'MyWatchlist', link: '/watchlist', disabled: false},
    {label: 'Budgets', link: '/budgets', disabled: false},
    {label: 'Statistics', link: '/statistics', disabled: false},
    {label: 'Logout', link: '/logout', disabled: false},
  ];
  userLinks: MenuItem[] = [
    {label: 'Auction', link: '/auction', disabled: false},
    {label: 'DraftBoard', link: '/status', disabled: false},
    {label: 'MyDraft', link: '/summary', disabled: false},
    {label: 'MyWatchlist', link: '/watchlist', disabled: false},
    {label: 'Budgets', link: '/budgets', disabled: false},
    {label: 'Statistics', link: '/statistics', disabled: false},
    {label: 'Logout', link: '/logout', disabled: false},
  ];
  links: MenuItem[] = [];
  activeLink = this.links[0];
  background = 'primary';
  wannabeDAO: WannabeDAOService;
  router: Router;
  cookieService: CookieService;
  isMobile = false;
  isDesktop = false;
  isTablet = false;

  constructor(wannabeDAO: WannabeDAOService, router: Router, cookieService: CookieService,
              deviceService: DeviceDetectorService) {
    this.wannabeDAO = wannabeDAO;
    this.router = router;
    this.cookieService = cookieService;
    this.isMobile = deviceService.isMobile();
    this.isDesktop = deviceService.isDesktop();
    this.isTablet = deviceService.isTablet();
    console.log('Detected' + (this.isMobile ? ' Mobile' : '') + (this.isDesktop ? ' Desktop' : '') + (this.isTablet ? ' Tablet' : '') + ' configuration');
    const loggedInOwner = this.cookieService.get('loginTeam');
  }

  ngOnInit() {
    const loggedInOwner = this.cookieService.get('loginTeam');

    if (loggedInOwner === 'Gunslingers') {
      this.links = this.ownerLinks;
    } else if (loggedInOwner === 'Smack') {
      this.links = this.adminLinks;
    } else {
      this.links = this.userLinks;
    }

    let currentRoute = '/login';
    const pathSegments = document.location.href.split('/');
    if (pathSegments.length > 3) {
      currentRoute = '/' + pathSegments[3];
    }

    if (loggedInOwner && this.isValidRoute(currentRoute)) {
      this.router.navigate([currentRoute]);
    } else {
      this.router.navigate(['/login']);
    }
  }

  isValidRoute(route: string) {
    for (const menuItem of this.links) {
      if (menuItem.link === route) {
        return true;
      }
    }
    return false;
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
