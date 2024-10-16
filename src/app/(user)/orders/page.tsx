// File: /app/(user)/order/page.tsx

"use client";

import React, { useEffect, useState } from "react";
import axios from "axios";
import { useSession } from "next-auth/react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { toast, ToastContainer } from "react-toastify";
import 'react-toastify/dist/ReactToastify.css';

// Ensure 'orderId' is part of the interface
interface IOrder {
  _id: string;
  orderId: string; // Add this line to represent the custom order ID
  name: string;
  phone: string;
  email: string;
  paymentMethod: string;
  products: Array<{
    productId: string;
    name: string;
    quantity: number;
    price: number;
  }>;
  totalAmount: number;
  status: {
    value: string;
    rejectionReason?: string; // Updated for status with rejectionReason
  };
  createdAt: string;
}

const OrdersPage = () => {
  const [orders, setOrders] = useState<IOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const { data: session, status } = useSession();

  // Check if userId exists and session is authenticated
  const userId = session?.user?.id;

  useEffect(() => {
    if (status === "loading") return; // Wait for session to load
    if (status === "unauthenticated") {
      toast.error("You need to sign in to view your orders.");
      return;
    }

    const fetchOrders = async () => {
      try {
        if (!userId) {
          toast.error("User ID is missing.");
          return;
        }

        const response = await axios.get<IOrder[]>(`/api/userOrder/${userId}`);
        setOrders(response.data);
      } catch (error) {
        console.error("Error fetching orders:", error);
        toast.error("Failed to load orders. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    if (userId) {
      fetchOrders();
    }
  }, [session, status, userId]);

  if (loading) {
    return <div className="text-center mt-8">Loading your orders...</div>;
  }

  if (orders.length === 0) {
    return <div className="text-center mt-8">You have no orders yet.</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <ToastContainer />
      <h1 className="text-3xl font-bold mb-6">Your Orders</h1>
      <div className="grid grid-cols-1 gap-6">
        {orders.map((order) => (
          <Card key={order._id} className="flex flex-col">
            <CardHeader>
              {/* Ensure orderId exists */}
              <CardTitle>Order ID: {order.orderId || "N/A"}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="mb-4">
                <Label className="font-semibold">Order Date:</Label> {new Date(order.createdAt).toLocaleString()}
              </div>
              <div className="mb-4">
                <Label className="font-semibold">Name:</Label> {order.name}
              </div>
              <div className="mb-4">
                <Label className="font-semibold">Phone:</Label> {order.phone}
              </div>
              <div className="mb-4">
                <Label className="font-semibold">Email:</Label> {order.email}
              </div>
              <div className="mb-4">
                <Label className="font-semibold">Payment Method:</Label> {order.paymentMethod}
              </div>
              <div className="mb-4">
                <Label className="font-semibold">Order Status:</Label> {order.status.value}
              </div>
              {/* Only show rejection reason if the status is "Rejected" */}
              {order.status.value === "Rejected" && (
                <div className="mb-4">
                  <Label className="font-semibold">Rejection Reason:</Label> {order.status.rejectionReason}
                </div>
              )}
              <div className="mb-4">
                <Label className="font-semibold">Products:</Label>
                <ul className="list-disc pl-6">
                  {order.products.map((product, index) => (
                    <li key={index}>
                      {product.name} - {product.quantity} x ৳{product.price} = ৳{(product.quantity * product.price).toFixed(2)}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="font-bold mt-4">
                <Label className="font-semibold">Total Amount:</Label> ৳{order.totalAmount.toFixed(2)}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default OrdersPage;
