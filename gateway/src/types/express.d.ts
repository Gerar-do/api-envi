// src/express.d.ts

import * as express from 'express';

declare global {
  namespace Express {
    interface Request {
      user?: any;  // `user` puede ser de cualquier tipo, por ejemplo, un objeto con el ID del usuario
    }
  }
}
