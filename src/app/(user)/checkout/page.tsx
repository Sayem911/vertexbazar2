// File: /app/(user)/checkout/page.tsx

"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import axios from 'axios';
import { useCart } from '@/contexts/CartContext';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import io from 'socket.io-client';

const socket = io('http://localhost:3001');

const CheckoutPage = () => {
  const [paymentMethod, setPaymentMethod] = useState<string>("");
  const [bkashNumber, setBkashNumber] = useState<string>("");
  const [bkashTxnId, setBkashTxnId] = useState<string>("");
  const [nagadNumber, setNagadNumber] = useState<string>("");
  const [upayNumber, setUpayNumber] = useState<string>("");
  const [name, setName] = useState<string>("");
  const [phone, setPhone] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [errors, setErrors] = useState<any>({});
  const [hasMounted, setHasMounted] = useState(false);

  const { data: session, status } = useSession();
  const { cartItems, clearCart } = useCart();
  const router = useRouter();

  useEffect(() => {
    setHasMounted(true);
  }, []);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/signin');
    }

    if (session?.user) {
      setName(session.user.name || "");
      setEmail(session.user.email || "");
    }

    interface Order {
      id: string;
      status: {
        value: string;
        rejectionReason?: string;
      };
    }

    socket.on('orderStatusUpdate', (order: Order) => {
      if (order.status.value === 'Approved') {
        toast.success(`Order ${order.id} has been approved by the admin.`);
      } else if (order.status.value === 'Rejected') {
        toast.error(`Order ${order.id} has been rejected. Reason: ${order.status.rejectionReason}`);
      }
    });
  }, [status, router, session]);

  const validateFields = () => {
    const newErrors: any = {};
    if (!name) newErrors.name = "Name is required.";
    if (!phone) {
      newErrors.phone = "Phone number is required.";
    } else if (!/^[0-9]{11}$/.test(phone)) {
      newErrors.phone = "Phone number must be 11 digits.";
    }
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = "Invalid email address.";
    }
    if (!paymentMethod) newErrors.paymentMethod = "Please select a payment method.";

    if (paymentMethod === "bkash") {
      if (!bkashNumber) newErrors.bkashNumber = "bKash number is required.";
      if (!/^[0-9]{11}$/.test(bkashNumber)) newErrors.bkashNumber = "bKash number must be 11 digits.";
      if (!bkashTxnId) newErrors.bkashTxnId = "Transaction ID is required.";
    }

    if (paymentMethod === "nagad" && !nagadNumber) {
      newErrors.nagadNumber = "Nagad number is required.";
    }

    if (paymentMethod === "upay" && !upayNumber) {
      newErrors.upayNumber = "Upay number is required.";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handlePlaceOrder = async () => {
    if (!validateFields()) {
      toast.warn("Please correct the errors in the form.");
      return;
    }

    try {
      const orderData = {
        userId: session?.user?.id,
        name,
        phone,
        email,
        paymentMethod,
        bkashNumber,
        bkashTxnId,
        nagadNumber,
        upayNumber,
        products: cartItems.map(item => ({
          productId: item._id,
          name: item.name,
          quantity: item.quantity,
          price: item.price,
        })),
        totalAmount: cartItems.reduce((total, item) => total + item.price * item.quantity, 0),
        status: {
          value: 'Pending',
          rejectionReason: 'N/A' // Initialize rejectionReason
        }
      };

      const response = await axios.post("/api/checkout", orderData);
      socket.emit('newOrder', response.data.order);
      toast.success("Your order has been placed. Admin will confirm the order within 2 hours.");

      // Clear the cart after placing the order
      clearCart();

      // Redirect to the order history page and replace the current entry to prevent going back to checkout
      setTimeout(() => {
        router.replace("/orders");
      }, 2000); // Giving time for the toast to appear before redirecting
    } catch (error) {
      if (axios.isAxiosError(error)) {
        if (error.response) {
          // Request made and server responded
          console.error("Server Response Error:", error.response.data);
          toast.error(`Failed to place order: ${error.response.data.message || "Unknown error occurred"}`);
        } else if (error.request) {
          // The request was made but no response was received
          console.error("No Response Error:", error.request);
          toast.error("No response received from server. Please check your network and try again.");
        } else {
          // Something happened in setting up the request that triggered an Error
          console.error("Request Setup Error:", error.message);
          toast.error(`Error: ${error.message}`);
        }
      } else {
        console.error("Unexpected Error:", error);
        toast.error("An unexpected error occurred. Please try again.");
      }
    }
  };

  const totalAmount = cartItems.reduce((total, item) => total + item.price * item.quantity, 0);

  if (!hasMounted) {
    return null;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <ToastContainer />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Billing Details */}
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">Billing Details</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="mb-4">
              <Label htmlFor="name">Name *</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter your name"
              />
              {errors.name && <p className="text-red-600 text-sm">{errors.name}</p>}
            </div>
            <div className="mb-4">
              <Label htmlFor="phone">Phone *</Label>
              <Input
                id="phone"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="Enter your phone number"
              />
              {errors.phone && <p className="text-red-600 text-sm">{errors.phone}</p>}
            </div>
            <div className="mb-4">
              <Label htmlFor="email">Email address (optional)</Label>
              <Input
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
              />
              {errors.email && <p className="text-red-600 text-sm">{errors.email}</p>}
            </div>
          </CardContent>
        </Card>

        {/* Order Summary and Payment Methods */}
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">Your Order</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="mb-4">
              <div className="font-bold">Products</div>
              {cartItems.map((item, index) => (
                <div key={`${item._id}-${index}`} className="flex justify-between">
                  <span>{item.name} - {item.quantity} x ৳{item.price}</span>
                  <span>৳{(item.price * item.quantity).toFixed(2)}</span>
                </div>
              ))}
              <div className="font-bold mt-4">Total: ৳{totalAmount.toFixed(2)}</div>
            </div>

            {/* Payment Methods */}
            <div className="mb-4">
              <Label className="block mb-2 font-semibold">Select Payment Method</Label>
              <div className="space-y-2">
                <div>
                  <input
                    type="radio"
                    id="bkash"
                    name="paymentMethod"
                    value="bkash"
                    checked={paymentMethod === "bkash"}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    className="mr-2"
                  />
                  <Label htmlFor="bkash">bKash Personal</Label>
                </div>
                <div>
                  <input
                    type="radio"
                    id="nagad"
                    name="paymentMethod"
                    value="nagad"
                    checked={paymentMethod === "nagad"}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    className="mr-2"
                  />
                  <Label htmlFor="nagad">Nagad Personal</Label>
                </div>
                <div>
                  <input
                    type="radio"
                    id="upay"
                    name="paymentMethod"
                    value="upay"
                    checked={paymentMethod === "upay"}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    className="mr-2"
                  />
                  <Label htmlFor="upay">Upay Personal</Label>
                </div>
              </div>
              {errors.paymentMethod && <p className="text-red-600 text-sm">{errors.paymentMethod}</p>}
            </div>

            {/* Conditional Payment Details */}
            {paymentMethod === "bkash" && (
              <div className="mb-4">
                <Label className="block mb-2 font-semibold text-green-600">
                  Please send ৳{totalAmount} to bKash Personal Number: 01934458799 and provide the following details:
                </Label>
                <div className="mb-2">
                  <Label htmlFor="bkashNumber">Your bKash Account Number</Label>
                  <Input
                    id="bkashNumber"
                    value={bkashNumber}
                    onChange={(e) => setBkashNumber(e.target.value)}
                    placeholder="Enter your bKash number"
                  />
                  {errors.bkashNumber && <p className="text-red-600 text-sm">{errors.bkashNumber}</p>}
                </div>
                <div className="mb-2">
                  <Label htmlFor="bkashTxnId">bKash Transaction ID</Label>
                  <Input
                    id="bkashTxnId"
                    value={bkashTxnId}
                    onChange={(e) => setBkashTxnId(e.target.value)}
                    placeholder="Enter Transaction ID"
                  />
                  {errors.bkashTxnId && <p className="text-red-600 text-sm">{errors.bkashTxnId}</p>}
                </div>
              </div>
            )}

            {paymentMethod === "nagad" && (
              <div className="mb-4">
                <Label className="block mb-2 font-semibold text-orange-600">
                  Please send the payment to Nagad Personal Number: 01934458799.
                </Label>
                <div className="mb-2">
                  <Label htmlFor="nagadNumber">Your Nagad Account Number</Label>
                  <Input
                    id="nagadNumber"
                    value={nagadNumber}
                    onChange={(e) => setNagadNumber(e.target.value)}
                    placeholder="Enter your Nagad number"
                  />
                  {errors.nagadNumber && <p className="text-red-600 text-sm">{errors.nagadNumber}</p>}
                </div>
              </div>
            )}

            {paymentMethod === "upay" && (
              <div className="mb-4">
                <Label className="block mb-2 font-semibold text-blue-600">
                  Please send the payment using Upay.
                </Label>
                <div className="mb-2">
                  <Label htmlFor="upayNumber">Your Upay Account Number</Label>
                  <Input
                    id="upayNumber"
                    value={upayNumber}
                    onChange={(e) => setUpayNumber(e.target.value)}
                    placeholder="Enter your Upay number"
                  />
                  {errors.upayNumber && <p className="text-red-600 text-sm">{errors.upayNumber}</p>}
                </div>
              </div>
            )}

            {/* Place Order Button */}
            <Button className="w-full mt-4" onClick={handlePlaceOrder}>
              Place Order
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default CheckoutPage;
