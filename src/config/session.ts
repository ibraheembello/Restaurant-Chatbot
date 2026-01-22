import session from 'express-session';
import MongoStore from 'connect-mongo';

export const createSessionConfig = () => {
  const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/restaurant-chatbot';
  const sessionSecret = process.env.SESSION_SECRET || 'default-secret-change-in-production';
  const isProduction = process.env.NODE_ENV === 'production';

  return session({
    secret: sessionSecret,
    resave: false,
    saveUninitialized: true,
    store: MongoStore.create({
      mongoUrl: mongoUri,
      collectionName: 'sessions',
      ttl: 24 * 60 * 60, // 1 day
    }),
    cookie: {
      secure: isProduction,
      httpOnly: true,
      maxAge: 24 * 60 * 60 * 1000, // 1 day
      sameSite: isProduction ? 'strict' : 'lax',
    },
    name: 'restaurant.sid',
  });
};
