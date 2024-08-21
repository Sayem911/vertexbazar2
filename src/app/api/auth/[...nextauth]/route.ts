import NextAuth, { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import bcrypt from 'bcryptjs';
import User from '@/models/User';
import dbConnect from '@/lib/db';
import { signJwtAccessToken } from '@/lib/jwt';

 const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        await dbConnect();

        const user = await User.findOne({ email: credentials.email }).select('+password');
        if (!user) {
          return null;
        }

        const isPasswordCorrect = await bcrypt.compare(credentials.password, user.password);
        if (!isPasswordCorrect) {
          return null;
        }

        const { password: _, ...userWithoutPassword } = user.toObject();
        return userWithoutPassword;
      }
    }),
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  callbacks: {
    async jwt({ token, user, account }) {
      if (user) {
        if (account?.provider === 'credentials') {
          token.id = user.id || user._id;
          token.accessToken = signJwtAccessToken({ id: user.id || user._id });
        } else if (account?.provider === 'google') {
          token.id = user.googleId || user.id;
        }
        token.provider = account?.provider;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.provider = token.provider as string;
        if (token.accessToken) {
          session.accessToken = token.accessToken as string;
        }
      }
      return session;
    },
    async signIn({ user, account, profile }) {
      if (account?.provider === 'google') {
        await dbConnect();
        
        let existingUser = await User.findOne({ googleId: profile.sub });
        if (!existingUser && profile.email) {
          existingUser = await User.findOne({ email: profile.email });
        }

        if (existingUser) {
          // Update existing user
          existingUser.provider = 'google';
          existingUser.googleId = profile.sub;
          if (profile.email && !existingUser.email) {
            existingUser.email = profile.email;
          }
          if (profile.name && !existingUser.username) {
            existingUser.username = profile.name;
          }
          if (profile.picture && !existingUser.profileImage) {
            existingUser.profileImage = profile.picture;
          }
          existingUser.isEmailVerified = true;
          await existingUser.save();
          user.id = existingUser.googleId;
          user.googleId = existingUser.googleId;
        } else {
          // Create new user
          const newUser = await User.create({
            username: profile.name || `user_${profile.sub}`,
            email: profile.email,
            provider: 'google',
            googleId: profile.sub,
            isEmailVerified: true,
            profileImage: profile.picture,
            role: 'user',
          });
          user.id = newUser.googleId;
          user.googleId = newUser.googleId;
        }
      }
      return true;
    },
  },
  pages: {
    signIn: '/signin',
  },
  session: {
    strategy: 'jwt',
  },
  secret: process.env.NEXTAUTH_SECRET,
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST, authOptions };