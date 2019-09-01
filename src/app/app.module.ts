import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { HttpClientModule } from '@angular/common/http'; // replaces previous Http service
import { FormsModule } from '@angular/forms';
import { ReactiveFormsModule } from '@angular/forms';
import { NgModule } from '@angular/core';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatMenuModule } from '@angular/material/menu';
import {MatIconModule } from '@angular/material/icon';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatTableModule } from '@angular/material/table';
import { MatCardModule } from '@angular/material/card';
import { MatSelectModule } from '@angular/material/select';
import { MatSortModule } from '@angular/material/sort';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatTabsModule } from '@angular/material/tabs';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatDialogModule } from '@angular/material/dialog';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { MatGridListModule } from '@angular/material/grid-list';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { IgxExcelExporterService } from "igniteui-angular";
import { IgxGridModule } from "igniteui-angular";
import { ChartsModule } from 'ng2-charts';
import { DeviceDetectorModule } from 'ngx-device-detector';


import { LoginComponent } from './components/login/login.component';
import { WannabeDAOService } from './services/wannabe-dao.service';
import { SetupComponent } from './components/setup/setup.component';
import { RouterModule } from '@angular/router';
import { AuctionComponent } from './components/auction/auction.component';
import { DraftSelectionsComponent } from './components/draft-selections/draft-selections.component';
import { TeamStatisticsComponent } from './components/team-statistics/team-statistics.component';
import { OwnerSummaryComponent } from './components/owner-summary/owner-summary.component';
import { MenuComponent } from './components/menu/menu.component';
import { CookieService } from 'ngx-cookie-service';
import { OwnerDraftedPlayersComponent } from './components/owner-drafted-players/owner-drafted-players.component';
import { DialogSetupWarningDialog } from './components/setup/setup.component';
import { WatchlistComponent } from './components/watchlist/watchlist.component';
import { StatisticsComponent } from './components/statistics/statistics.component';
import { StatisticsService } from './services/statistics.service';
import { WannabeCsvDAOService } from './services/wannabe-csv-dao.service';

@NgModule({
  declarations: [
    AppComponent,
    LoginComponent,
    SetupComponent,
    AuctionComponent,
    DraftSelectionsComponent,
    TeamStatisticsComponent,
    OwnerSummaryComponent,
    MenuComponent,
    OwnerDraftedPlayersComponent,
    DialogSetupWarningDialog,
    WatchlistComponent,
    StatisticsComponent,
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    HttpClientModule,
    FormsModule,
    ReactiveFormsModule,
    DragDropModule,
    BrowserAnimationsModule,
    MatButtonModule,
    MatDialogModule,
    MatExpansionModule,
    MatAutocompleteModule,
    MatSortModule,
    MatGridListModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    MatMenuModule,
    MatCheckboxModule,
    MatTableModule,
    MatCardModule,
    MatToolbarModule,
    MatTabsModule,
    MatSelectModule,
    IgxGridModule,
    ChartsModule,
    DeviceDetectorModule.forRoot(),
    RouterModule.forRoot([
      { path: '', component: LoginComponent },
      { path: 'setup', component: SetupComponent },
      { path: 'auction', component: AuctionComponent },
      { path: 'login', component: LoginComponent },
      { path: 'status', component: DraftSelectionsComponent },
      { path: 'stats', component: TeamStatisticsComponent },
      { path: 'summary', component: OwnerSummaryComponent },
      { path: 'owner', component: OwnerDraftedPlayersComponent },
      { path: 'watchlist', component: WatchlistComponent },
      { path: 'statistics', component: StatisticsComponent }
    ],
    {onSameUrlNavigation: 'reload'})
  ],
  providers: [
    WannabeDAOService,
    WannabeCsvDAOService,
    IgxExcelExporterService,
    CookieService,
    StatisticsService],
  entryComponents: [DialogSetupWarningDialog],
  bootstrap: [AppComponent]
})
export class AppModule {
}
