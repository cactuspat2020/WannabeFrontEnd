export class OwnerRecord {
  public ownerName: string;
  public teamName: string;
  public budget: number;
  public draftOrder: number;
  public isAdmin: boolean;
  public draftName: string;

  public constructor(init?: Partial<OwnerRecord>) {
    this.budget = 200;
    this.draftName = 'n/a';
    this.ownerName = 'none';
    this.isAdmin = false;
    this.teamName = 'none';
    Object.assign(this, init);
}
}
