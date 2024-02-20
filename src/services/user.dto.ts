export type RequestedUser = {
  name: string;
  password: string;
}

export type ResponseUser = {
  name: string;
  index: number;
  error: boolean;
}

export type ErrorResp = {
  error: boolean;
  errorText?: string;
}

