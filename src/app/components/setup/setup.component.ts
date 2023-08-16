import { Component, OnInit, Inject } from '@angular/core';
import { SetupData } from '../../models/setupData';
import { FormBuilder } from '@angular/forms';
import { WannabeDAOService } from '../../services/wannabe-dao.service';
import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import { OwnerRecord } from 'src/app/models/ownerRecord';
import { Router } from '@angular/router';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { LoginComponent } from 'src/app/components/login/login.component';

export interface DialogData {
  proceedWithSetup: boolean;
}
@Component({
  selector: 'app-setup',
  templateUrl: './setup.component.html',
  styleUrls: ['./setup.component.css']
})
export class SetupComponent implements OnInit {
  draftData: SetupData = new SetupData('Initial', 200, 12, []);
  wannabeDAO: WannabeDAOService;
  router: Router;
  index: number;
  draftOrderIndex = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];
  selectorIndex = this.draftOrderIndex;
  dialog: MatDialog;
  isLoaded = false;

  constructor(wannabeDAO: WannabeDAOService, dialog: MatDialog, router: Router) {
    this.wannabeDAO = wannabeDAO;
    this.router = router;
    this.dialog = dialog;
  }

  changeLeagueSize() {
    if (this.draftData.leagueSize > this.draftData.teams.length) {
      let i = this.draftData.teams.length;
      for (i; i < this.draftData.leagueSize; i++) {
        this.draftData.teams.push(new OwnerRecord({
          ownerName: 'Owner ' + (i + 1),
          teamName: 'Team ' + (i + 1),
          draftOrder: i + 1
        }));
      }
    }
    this.selectorIndex = this.draftOrderIndex.slice(0, this.draftData.leagueSize);
  }
  submit() {
    this.draftData.teams = this.draftData.teams.slice(0, this.draftData.leagueSize);
    this.wannabeDAO.storeSetupData(this.draftData).subscribe(
      next => { },
      response => {
        // error condition
        console.log("POST call in error", response);
      },
      () => {
        // success condition
        this.wannabeDAO.fetchDraftedPlayers();
        this.router.navigate(['/auction']);
      }
    );
  }

  openDialog(): void {
    const dialogRef = this.dialog.open(DialogSetupWarningDialog, {
      width: '250px'
    });

    dialogRef.afterClosed().subscribe(result => {
      console.log('The dialog was closed. result = ' + result);
      if (result) {
        this.submit();
      }
    });
  }


  ngOnInit() {
    this.draftData.budget = 200;
    this.draftData.leagueSize = 12;
    let i = 0;
    for (i; i < 12; i++) {
      const owner = new OwnerRecord();
      owner.ownerName = 'new';
      this.draftData.teams.push(new OwnerRecord(owner));
    }
    this.wannabeDAO.fetchTeams().subscribe((response: OwnerRecord[]) => {
      if (response.length !== 0) {
        const tst = response.sort((a, b) => {
          if (a.draftOrder > b.draftOrder) { return 1; }
          if (a.draftOrder < b.draftOrder) { return -1; }
          return 0;
        });
        this.draftData.teams = response;

        // Just to jumpstart. Comment otherwise
        this.draftData.teams = this.wannabeDAO.getTeams();

        this.draftData.budget = response[0].budget;
        this.draftData.leagueSize = response.length;
        this.draftData.draftName = response[0].draftName;
        this.isLoaded = true;
      }
    });
    this.wannabeDAO.storeAuditRecord('Setup');
  }
  drop(event: CdkDragDrop<string[]>) {
    moveItemInArray(this.draftData.teams, event.previousIndex, event.currentIndex);
    let index = 1;
    this.draftData.teams.forEach((value) => {
      value.draftOrder = index;
      index++;
    });
  }
}

@Component({
  selector: 'dialog-setup-warning-dialog',
  templateUrl: 'dialog-setup-warning-dialog.html',
  styleUrls: ['./setup.component.css']
})
export class DialogSetupWarningDialog {

  constructor(
    public dialogRef: MatDialogRef<DialogSetupWarningDialog>,
    @Inject(MAT_DIALOG_DATA) public data: DialogData) { }
}

