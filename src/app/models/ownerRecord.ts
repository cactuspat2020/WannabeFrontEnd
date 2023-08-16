export class OwnerRecord {
  public ownerName: string;
  public teamName: string;
  public budget: number;
  public draftOrder: number = 0;
  public isAdmin: boolean;
  public draftName: string;
  public hasCarryOver: boolean;

  public constructor(init?: Partial<OwnerRecord>) {
    this.budget = 200;
    this.draftName = 'n/a';
    this.ownerName = 'none';
    this.isAdmin = false;
    this.teamName = 'none';
    this.hasCarryOver = false;
    Object.assign(this, init);
}
}
