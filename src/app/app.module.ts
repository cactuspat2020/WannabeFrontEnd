import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { FormsModule } from '@angular/forms';
import { ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http'; // replaces previous Http service
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';


// Stuff I imported
// import  { CognitoUserPool, AuthenticationDetails, CognitoUser } from 'amazon-cognito-identity-js'
import { Amplify } from 'aws-amplify'
import { CookieService } from 'ngx-cookie-service';
import { DeviceDetectorService } from 'ngx-device-detector'
import { IgxExcelExporterService } from "igniteui-angular"
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatButton, MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatDialogModule } from '@angular/material/dialog';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatGridListModule } from '@angular/material/grid-list';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatMenuModule } from '@angular/material/menu';
import { MatSelectModule } from '@angular/material/select';
import { MatSortModule } from '@angular/material/sort';
import { MatTableModule } from '@angular/material/table';
import { MatTabsModule } from '@angular/material/tabs';
import { MatToolbarModule } from '@angular/material/toolbar';
import { NgChartsModule } from 'ng2-charts'

// Stuff I built
import { StatisticsService } from './services/statistics.service';
import { WannabeDAOService } from './services/wannabe-dao.service';
import { WannabeCsvDAOService } from './services/wannabe-csv-dao.service';
import { MenuComponent } from './components/menu/menu.component';
import { AuctionComponent } from './components/auction/auction.component';
import { LoginComponent } from './components/login/login.component';
import { LogoutComponent } from './components/logout/logout.component';
import { SetupComponent } from './components/setup/setup.component';
import { PlayerSearchComponent } from './components/player-search/player-search.component';
import { DraftSelectionsComponent } from './components/draft-selections/draft-selections.component';
import { TeamStatisticsComponent } from './components/team-statistics/team-statistics.component';
import { OwnerSummaryComponent } from './components/owner-summary/owner-summary.component';
import { DialogSetupWarningDialog } from './components/setup/setup.component';
import { WatchlistComponent } from './components/watchlist/watchlist.component';
import { StatisticsComponent } from './components/statistics/statistics.component';
import { BudgetsComponent } from './components/budgets/budgets.component';

Amplify.configure({
  Auth: {
    region: 'us-west-2',
    userPoolId: 'us-west-2_J11Utme53',
    userPoolWebClientId: '6m8chq35fnokj8gq0dg2t0paem',
    mandatorySignIn: false,
    signUpVerificationMethod: 'code', // 'code' | 'link'
    // cookieStorage: {
    //   domain: '.wannabe-draft.org',
    //   path: '/',
    //   expires: 365,
    //   sameSite: 'lax',
    //   secure: false,
    // },
    oauth: {
      domain: 'https://wannabe.auth.us-west-2.amazoncognito.com',
      scope: [
        'email'
      ],
      redirectSignIn: 'http://localhost/auction',
      redirectSignOut: 'http://localhost/login',
      responseType: 'code', // or 'token', note that REFRESH token wil0l only be generated when the responseType is code
    },
  },
});

@NgModule({
  declarations: [
    AppComponent,
    MenuComponent,
    LoginComponent,
    AuctionComponent,
    LogoutComponent,
    SetupComponent,
    AuctionComponent,
    PlayerSearchComponent,
    DraftSelectionsComponent,
    TeamStatisticsComponent,
    OwnerSummaryComponent,
    MenuComponent,
    DialogSetupWarningDialog,
    WatchlistComponent,
    StatisticsComponent,
    BudgetsComponent,
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    DragDropModule,
    FormsModule,
    ReactiveFormsModule,
    HttpClientModule,
    BrowserAnimationsModule,
    MatDialogModule,
    MatButtonModule,
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
    NgChartsModule
  ],
  providers: [
    // CognitoUserPool, AuthenticationDetails, CognitoUser,
    CookieService,
    IgxExcelExporterService,
    DeviceDetectorService,
    StatisticsService,
    WannabeCsvDAOService, 
    WannabeDAOService
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
