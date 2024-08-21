import { JwtPayload } from 'jsonwebtoken';

export interface DecodedToken {
  id?: string;
  sub?: string;
  [key: string]: any;
}
