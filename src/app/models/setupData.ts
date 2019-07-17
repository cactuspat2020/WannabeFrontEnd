import {OwnerRecord} from './ownerRecord';

export class SetupData {

  constructor(
    public draftName: string,
    public budget: number,
    public leagueSize: number,
    public teams: OwnerRecord[]
  ) { }
}
