import { UserDto } from './user.dto';

export type respRoomDto = {
  roomId: number,
  roomUsers: UserDto[],
}

export type createRoomDto = {
  roomId: number,
  roomUsers: UserDto[],
}

export type AddToRoomDto = {
  indexRoom: number,
}
