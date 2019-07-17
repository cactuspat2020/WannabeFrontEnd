import { Component, OnInit } from '@angular/core';
import { SetupData } from '../../models/setupData';
import { FormBuilder } from '@angular/forms';
import { WannabeDAOService } from '../../services/wannabe-dao.service';
import {CdkDragDrop, moveItemInArray} from '@angular/cdk/drag-drop';


@Component({
  selector: 'app-setup',
  templateUrl: './setup.component.html',
  styleUrls: ['./setup.component.css']
})
export class SetupComponent implements OnInit {
  draftData: SetupData = new SetupData('initial',0,0,[]);
  wannabeDAO: WannabeDAOService;
  index: number;
  draftOrderIndex = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];
  selectorIndex = this.draftOrderIndex;

  constructor(wannabeDAO: WannabeDAOService) {
      this.wannabeDAO = wannabeDAO;

      this.draftData = wannabeDAO.getFakeSetup();
      this.wannabeDAO.getDraftInfo().subscribe((response: SetupData) => {
     this.draftData = response;
      console.log('The draft name inside response is ' + this.draftData.draftName);
     });
      console.log('The draft name outside response is ' + this.draftData.draftName);
   }

   changeLeague() {
    this.selectorIndex = this.draftOrderIndex.slice(0, this.draftData.leagueSize);
   }
   onSubmit() {
     this.wannabeDAO.storeSetupData(this.draftData);
   }
  ngOnInit() {
     this.wannabeDAO.getDraftInfo().subscribe((response: SetupData) => {
     this.draftData = response;
     });
  }
  drop(event: CdkDragDrop<string[]>) {
    moveItemInArray(this.draftData.teams, event.previousIndex, event.currentIndex);
  }

}
