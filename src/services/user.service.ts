import { DB, DBEntities, Users } from '../db/db';
import { ErrorResp, RequestedUser, ResponseUser } from './user.dto';

const USERS: Users[] = DB[DBEntities.Users];

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

  getAllUsers(): RequestedUser[] {
    return USERS;
  }
}
