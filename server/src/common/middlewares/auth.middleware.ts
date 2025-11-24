import { Request, Response, NextFunction } from 'express';
import { IUser } from '../../modules/auth/User.model';
export const isAuthenticated = (req: Request, res: Response, next: NextFunction): void => {
    if (req.isAuthenticated()) {
        return next();
    }
    res.status(401).json({ message: 'Unauthorized: You must be logged in to access this resource.' });
};
export const isAdmin = (req: Request, res: Response, next: NextFunction) => {
    if (!req.isAuthenticated()) {
        return res.status(401).json({ error: 'Unauthorized' });
    }
    const user = req.user as IUser;
    if (user.role !== 'admin') {
        return res.status(403).json({ error: 'Forbidden: Admins only.' });
    }

    next();
}