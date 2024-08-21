
"use client"

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import axios from 'axios';

interface UserProfile {
  username: string;
  email: string;
  role: string;
  provider: string;
}

const ProfilePage = () => {
  const { data: session, status } = useSession();
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const router = useRouter();

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/signin');
    } else if (status === 'authenticated' && session) {
      fetchUserProfile();
    }
  }, [status, session, router]);

  const fetchUserProfile = async () => {
    try {
      const response = await axios.get('/api/user/profile', {
        headers: {
          Authorization: `Bearer ${session?.accessToken}`
        }
      });
      setUserProfile(response.data.user);
    } catch (error) {
      console.error('Failed to fetch user profile:', error);
      // Handle error (e.g., show error message)
    }
  };

  if (status === 'loading') {
    return <div>Loading...</div>;
  }

  if (!userProfile) {
    return <div>Loading profile...</div>;
  }

  return (
    <div>
      <h1>Profile</h1>
      <p>Username: {userProfile.username}</p>
      <p>Email: {userProfile.email}</p>
      <p>Role: {userProfile.role}</p>
      <p>Provider: {userProfile.provider}</p>
    </div>
  );
};

export default ProfilePage;