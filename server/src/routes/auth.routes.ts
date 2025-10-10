import { Router } from 'express';
import passport from 'passport';

const authRouter = Router();

authRouter.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));
authRouter.get('/google/callback', passport.authenticate('google', {
    failureRedirect: '/login-failed',
    successRedirect: '/',
}));
authRouter.post('/logout', (req, res, next) => {
    req.logout((err) => {
        if (err) { return next(err); }
        res.status(200).json({ message: 'Logged out successfully' });
    });
});
authRouter.get('/me', (req, res) => {
    res.status(200).json(req.user || null);
});

export default authRouter;
