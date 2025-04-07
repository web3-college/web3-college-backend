import 'express-session';
import { SiweMessage } from 'siwe';

declare module 'express-session' {
  interface Session {
    nonce?: string;
    siwe?: SiweMessage;
  }
  }
