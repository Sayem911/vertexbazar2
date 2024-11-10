'use client';
import { useState, useEffect } from 'react';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Toaster, toast } from 'react-hot-toast';

export default function SignUp() {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isUsernameAvailable, setIsUsernameAvailable] = useState<boolean | null>(null);
  const [checkingUsername, setCheckingUsername] = useState(false);
  const router = useRouter();

  useEffect(() => {
    if (username.length > 0) {
      const checkUsername = async () => {
        setCheckingUsername(true);
        try {
          const response = await axios.post('/api/auth/check-username', { username });
          setIsUsernameAvailable(response.data.available);
        } catch (error) {
          console.error('Error checking username:', error);
          setIsUsernameAvailable(false);
        }
        setCheckingUsername(false);
      };

      const timeoutId = setTimeout(() => {
        checkUsername();
      }, 500);

      return () => clearTimeout(timeoutId);
    } else {
      setIsUsernameAvailable(null);
    }
  }, [username]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!isUsernameAvailable) {
      setErrorMessage("The username is already taken. Please choose another one.");
      return;
    }

    try {
      const response = await axios.post('/api/auth/signup', { username, email, password });

      toast.success("Sign up successful! Your account has been created successfully. You are now logged in.");

      router.push('/signin');
    } catch (error: any) {
      if (error.response && error.response.data && error.response.data.error) {
        setErrorMessage(error.response.data.error);
      } else {
        setErrorMessage("There was an error creating your account. Please try again.");
      }
      console.error("Sign up error:", error.message);
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100">
      <Toaster />
      <Card className="w-[350px]">
        <CardHeader>
          <CardTitle>Sign Up</CardTitle>
          <CardDescription>Create a new account</CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent>
            <div className="grid w-full items-center gap-4">
              <div className="flex flex-col space-y-1.5">
                <Label htmlFor="username">Username</Label>
                <Input 
                  id="username" 
                  placeholder="Your username" 
                  value={username} 
                  onChange={(e) => setUsername(e.target.value)} 
                  required 
                />
                {checkingUsername && (
                  <div className="text-gray-500 text-sm mt-1">Checking availability...</div>
                )}
                {isUsernameAvailable === false && !checkingUsername && (
                  <div className="text-red-500 text-sm mt-1">This username is already taken.</div>
                )}
                {isUsernameAvailable === true && !checkingUsername && (
                  <div className="text-green-500 text-sm mt-1">This username is available!</div>
                )}
              </div>
              <div className="flex flex-col space-y-1.5">
                <Label htmlFor="email">Email</Label>
                <Input 
                  id="email" 
                  type="email" 
                  placeholder="Your email" 
                  value={email} 
                  onChange={(e) => setEmail(e.target.value)} 
                  required 
                />
              </div>
              <div className="flex flex-col space-y-1.5">
                <Label htmlFor="password">Password</Label>
                <Input 
                  id="password" 
                  type="password" 
                  placeholder="Choose a password" 
                  value={password} 
                  onChange={(e) => setPassword(e.target.value)} 
                  required 
                />
              </div>
              {errorMessage && (
                <div className="text-red-500 text-sm mt-2">
                  {errorMessage}
                </div>
              )}
            </div>
          </CardContent>
          <CardFooter>
            <Button type="submit" className="w-full">Sign Up</Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
