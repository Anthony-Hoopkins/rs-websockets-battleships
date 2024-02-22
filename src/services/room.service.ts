import { DBEntities, getDatabaseEntity, Room } from '../db/db';
import { UserDto } from './dto/user.dto';
import { ErrorResp } from './dto/error.dto';
import { AddToRoomDto, respRoomDto } from './dto/room.dto';

const ROOMS: Room[] = getDatabaseEntity(DBEntities.Rooms) as Room[];

export class RoomService {
  getAllRooms(): respRoomDto[] {
    return ROOMS;
  }

  getAllNotFullRooms(): respRoomDto[] {
    return ROOMS.reduce((collected: Room[], room: Room) => {
      if (room.roomUsers.length < 2) {
        collected.push(room);
      }

      return collected;
    }, []);
  }

  createNewRoom(user: UserDto): ErrorResp {
    const roomId = crypto.randomUUID();
    const isAlreadyInRoom = ROOMS.find((room) => {
      return room.roomUsers.find(roomUser => roomUser.index === user.index);
    });

    if (!isAlreadyInRoom) {
      ROOMS.push({ roomId, roomUsers: [user] });

      return { error: false };
    }

    return { error: true, errorText: 'This user already in room' };
  }

  addUserToRoom(user: UserDto, roomData: AddToRoomDto): ErrorResp | respRoomDto {
    const room = ROOMS.find((room) => room.roomId === roomData.indexRoom);

    const isAlreadyInRoom = room?.roomUsers.find(roomUser => roomUser.index === user.index);

    if (!isAlreadyInRoom) {
      this.removeRoomIfHasOwn(user.index);
      room?.roomUsers.push(user);

      return room;
    }

    return { error: true, errorText: 'This user already in room' };
  }

  getCompetitorIdFromRoom(currentIndex: string, room: respRoomDto): string {
    return room.roomUsers.find((user: UserDto) => user.index !== currentIndex)?.index;
  }

  private removeRoomIfHasOwn(index: string): void {
    const roomIndex = ROOMS.findIndex((room) => {
      return room.roomUsers.find((user) => user.index === index);
    });

    if (roomIndex >= 0) {
      ROOMS.splice(roomIndex, 1);
    }
  }
}
