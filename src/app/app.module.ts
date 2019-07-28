import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { HttpClientModule } from '@angular/common/http'; // replaces previous Http service
import { FormsModule } from '@angular/forms';
import { ReactiveFormsModule } from '@angular/forms';
import { NgModule } from '@angular/core';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { MatButtonModule } from '@angular/material';
import { MatFormFieldModule } from '@angular/material';
import { MatInputModule } from '@angular/material';
import { MatRippleModule } from '@angular/material';
import { MatCheckboxModule } from '@angular/material';
import { MatTableModule } from '@angular/material';
import { MatCardModule } from '@angular/material';
import { MatSelectModule } from '@angular/material';
import { MatSortModule } from '@angular/material';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatTabsModule } from '@angular/material/tabs';
import {MatDialogModule} from '@angular/material/dialog';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { MatGridListModule } from '@angular/material/grid-list';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { IgxExcelExporterService } from "igniteui-angular";
import { IgxGridModule } from "igniteui-angular";

//I keep the new line
import { DraftHomeComponent } from './components/draft-home/draft-home.component';
import { WannabeDAOService } from './services/wannabe-dao.service';
import { SetupComponent } from './components/setup/setup.component';
import { RouterModule } from '@angular/router';
import { AuctionComponent } from './components/auction/auction.component';
import { DraftSelectionsComponent } from './components/draft-selections/draft-selections.component';
import { TeamStatisticsComponent } from './components/team-statistics/team-statistics.component';
import { PlayersComponent } from './components/players/players.component';
import { MenuComponent } from './components/menu/menu.component';

@NgModule({
  declarations: [
    AppComponent,
    DraftHomeComponent,
    SetupComponent,
    AuctionComponent,
    DraftSelectionsComponent,
    TeamStatisticsComponent,
    PlayersComponent,
    MenuComponent
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
    MatAutocompleteModule,
    MatSortModule,
    MatGridListModule,
    MatFormFieldModule,
    MatInputModule,
    MatRippleModule,
    MatCheckboxModule,
    MatTableModule,
    MatCardModule,
    MatToolbarModule,
    MatTabsModule,
    MatSelectModule,
    IgxGridModule,
    RouterModule.forRoot([
      { path: '', component: DraftHomeComponent },
      { path: 'setup', component: SetupComponent },
      { path: 'auction', component: AuctionComponent },
      { path: 'login', component: DraftHomeComponent },
      { path: 'status', component: DraftSelectionsComponent },
      { path: 'stats', component: TeamStatisticsComponent },
      { path: 'players', component: PlayersComponent },
    ])
  ],
  providers: [WannabeDAOService, IgxExcelExporterService],
  bootstrap: [AppComponent]
})
export class AppModule {
}
