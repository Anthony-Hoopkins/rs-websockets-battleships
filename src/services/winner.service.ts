import { DBEntities, getDatabaseEntity, Winner } from '../db/db';

const WINNERS: Winner[] = getDatabaseEntity(DBEntities.Winners) as Winner[];

export class WinnerService {
  getWinnersList() {
    return WINNERS;
  }
}
