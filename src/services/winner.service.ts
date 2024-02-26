import { DBEntities, getDatabaseEntity, Winner } from '../db/db';
import { UserDto } from './dto/user.dto';
import { WinnerDto } from './dto/winner.dto';

const WINNERS: Winner[] = getDatabaseEntity(DBEntities.Winners) as Winner[];

export class WinnerService {
  getWinnersList(): WinnerDto[] {
    return WINNERS;
  }

  updateWinners(user: UserDto): WinnerDto[] {
    if (!user) {
      return;
    }

    const winner = WINNERS.find((winner) => winner.name === user.name);

    if (winner) {
      winner.wins = winner.wins + 1;
    } else {
      WINNERS.push({ name: user.name, wins: 1 });
    }

    return WINNERS.sort((a: Winner, b: Winner) => {
       return a.wins < b.wins ? 1 : -1;
    });
  }
}
