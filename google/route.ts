import NextAuth from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';
import User from '@/models/User';
import dbConnect from '@/lib/db';
import { NextAuthOptions } from 'next-auth';
import { NextApiRequest, NextApiResponse } from 'next';

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  callbacks: {
    async signIn({ user, account, profile }) {
      await dbConnect();

      let existingUser = await User.findOne({ email: user.email });

      if (!existingUser) {
        existingUser = new User({
          username: profile?.name || user.email,
          email: user.email,
          googleId: profile?.sub, // Use `sub` as Google provides the user ID here
          isEmailVerified: true, // Google verified emails can be marked as verified
        });
        await existingUser.save();
      } else {
        if (!existingUser.googleId) {
          existingUser.googleId = profile?.sub;
          await existingUser.save();
        }
      }

      return true; // Continue the sign-in process
    },
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
      }
      return token;
    },
    async session({ session, token }) {
      if (token) {
        session.user = {
          ...session.user, // Spread existing properties
          id: token.id as string,
          role: token.role as string,
        };
      }
      return session;
    },
  },
  session: {
    strategy: 'jwt',
  },
  secret: process.env.NEXTAUTH_SECRET!,
};

export async function POST(req: NextApiRequest, res: NextApiResponse) {  
  return NextAuth(req, res, authOptions);
}
