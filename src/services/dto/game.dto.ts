export type StartedGameDto = {
  ships: ShipDto[];
  currentPlayerIndex: number,
  gameId?: string;
}

export type AddShipsDto = {
  gameId: string,
  ships: ShipDto[];
  indexPlayer: string, /* id of the player in the current game session */
}

export type ShipDto = {
  position: Coords,
  direction: boolean,
  length: number,
  type: 'small' | 'medium' | 'large' | 'huge',
}

export type AttackDto = {
  gameId: string,
  x: number,
  y: number,
  indexPlayer: string, /* id of the player in the current game session */
}

export type RandomAttackDto = {
  gameId: string,
  indexPlayer: string, /* id of the player in the current game session */
}

export type AttackRespDto = {
  position: Coords,
  currentPlayer: string, /* id of the player in the current game session */
  status: AttackStatus,
}

export type Coords = {
  x: number,
  y: number,
}

export type TurnDto = {
  currentPlayer: string, /* id of the player in the current game session */
}

export type FinishDto = {
  winPlayer: string, /* id of the player in the current game session */
}

export type AttackStatus = 'miss' | 'killed' | 'shot' | 'no';
