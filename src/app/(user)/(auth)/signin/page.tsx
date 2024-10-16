'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { signIn, useSession } from 'next-auth/react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Label } from "@/components/ui/label";

export default function SignIn() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const { data: session, status } = useSession();

  // Redirect if user is already logged in
  useEffect(() => {
    if (session && status === 'authenticated') {
      router.push('/profile');
    }
  }, [session, status, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    try {
      const result = await signIn('credentials', {
        redirect: false,
        email,
        password,
      });

      if (result?.error) {
        setError(result.error);
      } else {
        router.push('/profile');
      }
    } catch (error) {
      setError("An unexpected error occurred. Please try again later.");
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      const result = await signIn('google', { redirect: false, callbackUrl: '/profile' });
      if (result?.error) {
        setError(result.error);
      } else {
        router.push('/profile');
      }
    } catch (error) {
      setError("Failed to sign in with Google. Please try again.");
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100">
      <Card className="w-[350px]">
        <CardHeader>
          <CardTitle className="text-center text-2xl font-bold">Sign In</CardTitle>
          <CardDescription className="text-center text-gray-500">Enter your credentials to access your account</CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent>
            <div className="grid w-full items-center gap-4">
              <div className="flex flex-col space-y-1.5">
                <Label htmlFor="email" className="font-semibold">Email</Label>
                <Input 
                  id="email" 
                  type="email" 
                  placeholder="Your email" 
                  value={email} 
                  onChange={(e) => setEmail(e.target.value)} 
                  required 
                  className="mt-1 w-full p-2 border rounded-md"
                />
              </div>
              <div className="flex flex-col space-y-1.5">
                <Label htmlFor="password" className="font-semibold">Password</Label>
                <Input 
                  id="password" 
                  type="password" 
                  placeholder="Your password" 
                  value={password} 
                  onChange={(e) => setPassword(e.target.value)} 
                  required 
                  className="mt-1 w-full p-2 border rounded-md"
                />
              </div>
              {error && (
                <div className="text-red-500 text-sm mt-2">
                  {error}
                </div>
              )}
            </div>
          </CardContent>
          <CardFooter className="flex flex-col space-y-4 mt-4">
            <Button type="submit" className="w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700">
              Sign In
            </Button>
            <Button 
              onClick={handleGoogleSignIn} 
              type="button"
              className="w-full bg-red-500 text-white py-2 rounded-md hover:bg-red-600 flex items-center justify-center"
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" width="24" height="24" className="mr-2">
                <path fill="#EA4335" d="M24 9.5c3.5 0 6.5 1.5 8.7 3.9l6.4-6.4C34.4 3.4 29.5 1 24 1 14.8 1 7.3 6.4 3.8 14l7.9 6.1C13.3 13.3 18.2 9.5 24 9.5z" />
                <path fill="#34A853" d="M23.5 48c5.9 0 10.8-2.4 14.3-6.3l-7.3-6c-2.1 1.4-4.7 2.2-7.5 2.2-5.8 0-10.6-4.6-11.4-10.4H3.8v6.5C7.3 42.1 14.8 48 23.5 48z" />
                <path fill="#4A90E2" d="M47.6 24.5c0-1.5-.2-2.9-.5-4.3H24v8.2h13.3c-.7 3.3-2.6 6-5.4 7.9l7.3 6C45.6 38.5 47.6 31.8 47.6 24.5z" />
              </svg>
              Sign in with Google
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
