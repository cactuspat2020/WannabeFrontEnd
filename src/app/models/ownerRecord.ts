export class OwnerRecord {
  public ownerName: string;
  public teamName: string;
  public remainingBudget: number;
  public draftOrder: number;
  public isAdmin: boolean;
  public draftName: string;

  public constructor(init?:Partial<OwnerRecord>) {
    Object.assign(this, init);
}
}
