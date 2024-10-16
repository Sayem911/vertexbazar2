'use client';

import { useRouter } from 'next/navigation';
import { useSearchParams } from 'next/navigation';
import { Button } from "@/components/ui/button";

export default function ErrorPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const error = searchParams?.get('error');

  const getErrorMessage = () => {
    switch (error) {
      case 'CredentialsSignin':
        return 'This account uses credentials. Please sign in with your email and password.';
      case 'GoogleSignin':
        return 'This account uses Google Sign-In. Please sign in with Google.';
      default:
        return 'An unknown error occurred. Please try again.';
    }
  };

  return (
    <div className="flex flex-col justify-center items-center min-h-screen bg-gray-100">
      <h1 className="text-2xl font-bold mb-4">Sign In Error</h1>
      <p className="mb-6">{getErrorMessage()}</p>
      <Button onClick={() => router.push('/auth/signin')}>Back to Sign In</Button>
    </div>
  );
}
