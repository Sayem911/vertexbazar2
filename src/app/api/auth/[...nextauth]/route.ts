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
          throw new Error('Missing email or password.');
        }

        await dbConnect();

        const user = await User.findOne({ email: credentials.email }).select('+password');
        if (!user) {
          throw new Error('No user found with this email.');
        }

        // Check if the user registered with Google
        if (user.provider === 'google') {
          throw new Error('This account uses Google Sign-In. Please sign in with Google.');
        }

        const isPasswordCorrect = await bcrypt.compare(credentials.password, user.password);
        if (!isPasswordCorrect) {
          throw new Error('Invalid email or password.');
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
    async signIn({ user, account, profile, credentials }) {
      await dbConnect();

      // Google Sign-In Attempt
      if (account?.provider === 'google') {
        const existingUser = await User.findOne({ email: profile?.email });

        if (existingUser) {
          // If the user exists but registered with credentials
          if (existingUser.provider === 'credentials') {
            throw new Error('This account uses credentials. Please sign in with your email and password.');
          }

          // If user exists but doesn't have a Google ID, update the user
          if (!existingUser.googleId) {
            existingUser.provider = 'google';
            existingUser.googleId = profile?.sub;
            existingUser.isEmailVerified = true;
            if (profile?.name && !existingUser.username) {
              existingUser.username = profile?.name;
            }
            if (profile?.picture && !existingUser.profileImage) {
              existingUser.profileImage = profile?.picture;
            }
            await existingUser.save();
          }

          user.id = existingUser._id;
          user.googleId = existingUser.googleId;
        } else {
          // Create a new user if they do not exist
          const newUser = await User.create({
            username: profile?.name || `user_${profile?.sub}`,
            email: profile?.email,
            provider: 'google',
            googleId: profile?.sub,
            isEmailVerified: true,
            profileImage: profile?.picture,
            role: 'user',
          });
          user.id = newUser._id;
          user.googleId = newUser.googleId;
        }
      }

      // Credentials Sign-In Attempt
      if (account?.provider === 'credentials') {
        const existingUser = await User.findOne({ email: credentials?.email });

        if (existingUser && existingUser.provider === 'google') {
          throw new Error('This account uses Google Sign-In. Please sign in with Google.');
        }
      }

      return true;
    },
  },
  pages: {
    signIn: '/signin',
    error: '/error', // Custom error page
  },
  session: {
    strategy: 'jwt',
  },
  secret: process.env.NEXTAUTH_SECRET,
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST, authOptions };
