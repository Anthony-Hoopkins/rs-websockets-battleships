import { DBEntities, getDatabaseEntity, User } from '../db/db';
import { RequestedUser, ResponseUser, UserDto } from './dto/user.dto';
import { ErrorResp } from './dto/error.dto';
import { SIMPLE_BOT } from './bot.service';

const USERS: User[] = getDatabaseEntity(DBEntities.Users) as User[];

export class UserService {
  constructor() {
    this.setNewUser(SIMPLE_BOT);
  }

  registration(user: RequestedUser): ResponseUser | ErrorResp {
    if (!user || !user.name || !user.password) {
      return { error: true, errorText: 'Invalid user data' };
    }

    const existedUser = USERS.find(item => item.name === user.name);

    if (!existedUser) {
      const index = crypto.randomUUID();
      const newUser = { ...user, index };
      USERS.push(newUser);

      return { name: newUser.name, index, error: false };
    } else {
      return { error: true, errorText: 'The user already exists' };
    }
  }

  getAllUsers(): UserDto[] {
    return USERS;
  }

  getUserById(id: string): UserDto {
    return USERS.find(item => item.index === id);
  }

  removeUserById(id: string) {
    const index = USERS.findIndex(item => item.index === id);

    if (index !== -1) {
      USERS.splice(index, 1);
      console.log(USERS); // todo
    }
  }

  private setNewUser(user: UserDto): void {
    USERS.push(user);
  }
}
