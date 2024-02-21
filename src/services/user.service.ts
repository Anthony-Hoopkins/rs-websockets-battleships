import { DBEntities, getDatabaseEntity, User } from '../db/db';
import { RequestedUser, ResponseUser, UserDto } from './dto/user.dto';
import { ErrorResp } from './dto/error.dto';

// const USERS: User[] = DB[DBEntities.Users];
const USERS: User[] = getDatabaseEntity(DBEntities.Users) as User[];

export class UserService {
  registrationOrLogin(user: RequestedUser): ResponseUser | ErrorResp {
    if (!user || !user.name || !user.password) {
      return { error: true, errorText: 'Invalid user data' };
    }

    const existedUser = USERS.find(item => item.name === user.name);

    if (!existedUser) {
      const index = USERS.length;
      const newUser = { ...user, index };
      USERS.push(newUser);
      console.log(USERS); // todo

      return { name: newUser.name, index, error: false };
    }

    // todo create logic for already connected users;

    if (existedUser?.password === user.password) {
      console.log(USERS);
      return { ...existedUser, error: false };
    } else {
      return { error: true, errorText: 'Invalid user creds' };
    }
  }

  getAllUsers(): UserDto[] {
    return USERS;
  }
}
