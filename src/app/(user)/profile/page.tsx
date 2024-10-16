// File: src/app/user/profile/page.tsx

"use client";

import { useSession } from 'next-auth/react';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';

const ProfilePage = () => {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "unauthenticated") {
      // Redirect unauthenticated users to the sign-in page
      router.push('/signin');
    }
  }, [status, router]);

  if (status === "loading") {
    // Display loading indicator while checking authentication status
    return <div className="text-center mt-8">Loading...</div>;
  }

  if (status === "unauthenticated" || !session?.user) {
    // Fallback message in case redirection fails
    return <div className="text-center mt-8 text-red-500">You need to sign in to view your profile.</div>;
  }

  // Render the profile page for authenticated users
  return (
    <div className="container mx-auto px-4 py-8">
      <Card className="max-w-4xl mx-auto">
        <CardHeader>
          <CardTitle className="text-2xl">Profile Information</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <strong>Name:</strong> {session.user.name || "N/A"}
            </div>
            <div>
              <strong>Email:</strong> {session.user.email || "N/A"}
            </div>
            {/* Add any other user-specific information here */}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ProfilePage;
