import {OwnerRecord} from './ownerRecord';

export class SetupData {

  constructor(
    public draftName: string = "",
    public budget: number = 0,
    public leagueSize: number = 0,
    public rosterSize: number = 14,
    public teams: OwnerRecord[] = []
  ) { }
}
