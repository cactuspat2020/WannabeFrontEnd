import { Component, OnInit } from '@angular/core';
import { SetupData } from '../../models/setupData';
import { FormBuilder } from '@angular/forms';
import { WannabeDAOService } from '../../services/wannabe-dao.service';
import {CdkDragDrop, moveItemInArray} from '@angular/cdk/drag-drop';
import { OwnerRecord } from 'src/app/models/ownerRecord';


@Component({
  selector: 'app-setup',
  templateUrl: './setup.component.html',
  styleUrls: ['./setup.component.css']
})
export class SetupComponent implements OnInit {
  draftData: SetupData = new SetupData('Initial', 200, 12, []);
  wannabeDAO: WannabeDAOService;
  index: number;
  draftOrderIndex = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];
  selectorIndex = this.draftOrderIndex;

  constructor(wannabeDAO: WannabeDAOService) {
      this.wannabeDAO = wannabeDAO;
   }

   changeLeague() {
    this.selectorIndex = this.draftOrderIndex.slice(0, this.draftData.leagueSize);
   }
   onSubmit() {
     this.wannabeDAO.storeSetupData(this.draftData);
   }
  ngOnInit() {
    this.draftData = this.wannabeDAO.getDraftInfo();
  }
  drop(event: CdkDragDrop<string[]>) {
    moveItemInArray(this.draftData.teams, event.previousIndex, event.currentIndex);
    let index = 1;
    this.draftData.teams.forEach(function (value) {
      value.draftOrder = index;
      index++;
    })
  }

}
