import { User } from '../db/db';
import { ShipDto } from './dto/game.dto';

export const SIMPLE_BOT: User = {
  name: 'Strong_bot',
  index: 'bot',
};

export const BOT_SHIPS: ShipDto[] = [
  { 'position': { 'x': 4, 'y': 1 }, 'direction': false, 'type': 'huge', 'length': 4 },
  {
    'position': { 'x': 8, 'y': 3 },
    'direction': true,
    'type': 'large',
    'length': 3,
  },
  { 'position': { 'x': 5, 'y': 7 }, 'direction': false, 'type': 'large', 'length': 3 },
  {
    'position': { 'x': 0, 'y': 0 },
    'direction': false,
    'type': 'medium',
    'length': 2,
  },
  { 'position': { 'x': 0, 'y': 8 }, 'direction': false, 'type': 'medium', 'length': 2 },
  {
    'position': { 'x': 5, 'y': 3 },
    'direction': true,
    'type': 'medium',
    'length': 2,
  },
  { 'position': { 'x': 9, 'y': 1 }, 'direction': false, 'type': 'small', 'length': 1 },
  {
    'position': { 'x': 8, 'y': 9 },
    'direction': true,
    'type': 'small',
    'length': 1,
  },
  { 'position': { 'x': 3, 'y': 8 }, 'direction': false, 'type': 'small', 'length': 1 },
  { 'position': { 'x': 6, 'y': 9 }, 'direction': true, 'type': 'small', 'length': 1 },
];

export class BotService {
}
