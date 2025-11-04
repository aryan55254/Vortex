import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import { User } from "../models/User.model";
import { env } from "./env";

passport.serializeUser((user: any, done) => {
    done(null, user.id);
});
passport.deserializeUser(async (id, done) => {
    try {
        const user = await User.findById(id);
        done(null, user);
    } catch (error) {
        done(error, null);
    }
});
passport.use(new GoogleStrategy({
    clientID: env.GOOGLE_CLIENT_ID,
    clientSecret: env.GOOGLE_CLIENT_SECRET,
    callbackURL: "https://localhost:8080/api/auth/google/callback"
},
    async (_accessToken, _refreshToken, profile, done) => {
        try {
            let user = await User.findOne({
                googleId: profile.id
            });
            if (user) {
                return done(null, user);
            }
            else {
                user = await User.create({
                    googleId: profile.id,
                    displayName: profile.displayName,
                    email: profile.emails?.[0]?.value || '',
                    avatar: profile.photos?.[0]?.value || '',
                });
                return done(null, user);
            }
        }
        catch (error) {
            return done(error, false);
        }
    }
)
)