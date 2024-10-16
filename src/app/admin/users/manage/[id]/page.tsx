// File Path: src/app/admin/users/[id]/page.tsx

'use client';

import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/components/ui/use-toast";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import axios from "axios";

interface IUser {
  _id: string;
  username: string;
  email: string;
  vbPoints: number;
  role: string;
  isEmailVerified: boolean;
  totalOrders: number;
  orderHistory: Array<{ orderId: string; date: string; amount: number }>;
}

const API_URL = "/api/users";

async function fetchUserById(id: string): Promise<IUser> {
  const response = await axios.get(`${API_URL}/${id}`);
  return response.data;
}

async function updateUserDetails(id: string, userDetails: Partial<IUser>): Promise<IUser> {
  const response = await axios.put(`${API_URL}/${id}`, userDetails);
  return response.data;
}

export default function ManageUserById() {
  const [user, setUser] = useState<Partial<IUser>>({});
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const { toast } = useToast();
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  useEffect(() => {
    loadUser();
  }, []);

  const loadUser = async () => {
    try {
      const fetchedUser = await fetchUserById(id);
      setUser(fetchedUser);
    } catch (err) {
      toast({
        title: "Error",
        description: "Failed to load user. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const { name, value } = e.target;
    setUser((prev) => ({ ...prev, [name]: value }));
  };

  const handleCheckboxChange = (name: string, checked: boolean) => {
    setUser((prev) => ({ ...prev, [name]: checked }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsSubmitting(true);
      await updateUserDetails(id, { vbPoints: user.vbPoints });
      toast({
        title: "Success",
        description: "User details updated successfully.",
      });
      router.push("/admin/users");
    } catch (err) {
      toast({
        title: "Error",
        description: "Failed to update user. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Manage User</h1>
      <form id="userForm" onSubmit={handleSubmit} className="space-y-4">
        <div>
          <Label htmlFor="username">Username</Label>
          <Input
            id="username"
            name="username"
            value={user.username || ""}
            disabled
          />
        </div>
        <div>
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            name="email"
            type="email"
            value={user.email || ""}
            disabled
          />
        </div>
        <div>
          <Label htmlFor="vbPoints">VB Points</Label>
          <Input
            id="vbPoints"
            name="vbPoints"
            type="number"
            value={user.vbPoints !== undefined ? user.vbPoints : 0}
            onChange={(e) =>
              setUser((prev) => ({ ...prev, vbPoints: parseInt(e.target.value) }))
            }
          />
        </div>
        <div className="flex items-center space-x-2">
          <Checkbox
            id="isEmailVerified"
            checked={user.isEmailVerified !== undefined ? user.isEmailVerified : false}
            disabled
          />
          <Label htmlFor="isEmailVerified">Email Verified</Label>
        </div>
        <div>
          <Label>Total Orders</Label>
          <Input
            id="totalOrders"
            name="totalOrders"
            type="number"
            value={user.totalOrders || 0}
            disabled
          />
        </div>
        <div>
          <Label>Order History</Label>
          {user.orderHistory?.length ? (
            <ul className="list-disc pl-5">
              {user.orderHistory.map((order, index) => (
                <li key={index}>
                  Order ID: {order.orderId}, Date: {order.date}, Amount: ${order.amount}
                </li>
              ))}
            </ul>
          ) : (
            <p>No order history available.</p>
          )}
        </div>
        <Button type="submit" form="userForm" disabled={isSubmitting}>
          {isSubmitting ? "Saving..." : "Save Changes"}
        </Button>
        <Button className="ml-3">
          <Link href="/admin/users">Go Back</Link>
        </Button>
      </form>
    </div>
  );
}
