// File Path: src/app/admin/users/manage/page.tsx

'use client';

import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { useRouter } from "next/navigation";
import Link from "next/link";

interface IUser {
  _id: string;
  username: string;
  email: string;
  vbPoints: number;
}

const API_URL = "/api/users";

async function fetchUsers(): Promise<IUser[]> {
  const response = await fetch(`${API_URL}`);
  if (!response.ok) throw new Error("Failed to fetch users");
  return response.json();
}

export default function ManageUsers() {
  const [users, setUsers] = useState<IUser[]>([]);
  const { toast } = useToast();
  const router = useRouter();

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      const fetchedUsers = await fetchUsers();
      setUsers(fetchedUsers);
    } catch (err) {
      toast({
        title: "Error",
        description: "Failed to load users. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Manage Users</h1>
      <div className="space-y-4">
        {users.map((user) => (
          <div key={user._id} className="border rounded p-4 flex justify-between items-center">
            <div>
              <div className="font-bold">{user.username}</div>
              <div>Email: {user.email}</div>
              <div>VB Points: {user.vbPoints}</div>
            </div>
            <div>
              <Button variant="default">
                <Link href={`/admin/users/manage/${user._id}`}>Manage</Link>
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
