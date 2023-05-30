import { Request as ExpressRequest } from 'express';
import { Admin } from '../app/models/admin';

export interface Request extends ExpressRequest {
    user?: number,
    admin?: Admin
}