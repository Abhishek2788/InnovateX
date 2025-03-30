import { IronSessionOptions } from "iron-session";

export const sessionOptions = {
  password: process.env.SESSION_SECRET,
  cookieName: "finance-session",
  cookieOptions: {
    secure: process.env.NODE_ENV === "production",
  },
};
