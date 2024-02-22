import { UserDto } from './user.dto';

export type respRoomDto = {
  roomId: string,
  roomUsers: UserDto[],
}

export type createRoomDto = {
  roomId: string,
  roomUsers: UserDto[],
}

export type AddToRoomDto = {
  indexRoom: string,
}
