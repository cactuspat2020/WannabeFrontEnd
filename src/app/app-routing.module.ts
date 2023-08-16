import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuctionComponent } from './components/auction/auction.component';
import { LoginComponent } from './components/login/login.component';
import { LogoutComponent } from './components/logout/logout.component';
import { SetupComponent } from './components/setup/setup.component';
import { PlayerSearchComponent } from './components/player-search/player-search.component';
import { DraftSelectionsComponent } from './components/draft-selections/draft-selections.component';
import { TeamStatisticsComponent } from './components/team-statistics/team-statistics.component';
import { OwnerSummaryComponent } from './components/owner-summary/owner-summary.component';
import { WatchlistComponent } from './components/watchlist/watchlist.component';
import { StatisticsComponent } from './components/statistics/statistics.component';
import { BudgetsComponent } from './components/budgets/budgets.component';

const routes: Routes = [
  { path: '', component: LoginComponent, },
  { path: 'login', component: LoginComponent },
  { path: 'auction', component: AuctionComponent },
  { path: 'setup', component: SetupComponent },
  { path: 'auction', component: AuctionComponent },
  { path: 'players', component: PlayerSearchComponent },
  { path: 'login', component: LoginComponent },
  { path: 'logout', component: LogoutComponent },
  { path: 'status', component: DraftSelectionsComponent },
  { path: 'stats', component: TeamStatisticsComponent },
  { path: 'summary', component: OwnerSummaryComponent },
  { path: 'budgets', component: BudgetsComponent },
  { path: 'watchlist', component: WatchlistComponent },
  { path: 'statistics', component: StatisticsComponent }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
