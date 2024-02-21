import { ErrorDto } from './error.dto';

export type RequestedUser = {
  name: string,
  password: string,
}

export type UserDto = {
  name: string,
  index: number,
}

export type ResponseUser = UserDto & ErrorDto
