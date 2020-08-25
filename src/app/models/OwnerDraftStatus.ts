import {DraftStatus} from './DraftStatus';

export class OwnerDraftStatus {
  public remainingBudget = 200;
  public totalDraftedPlayers = 0;
  public positions = new Map<string, DraftStatus>();
}
