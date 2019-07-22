import { Component } from '@angular/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'wannabe';
  links = ['setup', 'Login', 'auction', 'status', 'stats'];
  activeLink = this.links[0];
  background = 'primary';
}
