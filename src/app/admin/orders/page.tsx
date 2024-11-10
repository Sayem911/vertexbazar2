// File: /app/admin/orders/page.tsx

"use client";

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import io from 'socket.io-client';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger } from '@/components/ui/dialog';

const socket = io('http://localhost:3001'); // Connect to your backend server

interface Order {
  _id: string;
  orderId: string;
  userId: string;
  name: string;
  paymentMethod: string;
  totalAmount: number;
  status: {
    value: string;
    rejectionReason: string;
  };
  bkashTxnId?: string;
  products: {
    productId: string;
    name: string;
    quantity: number;
    price: number;
  }[];
}

const AdminOrdersPage = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [rejectionReason, setRejectionReason] = useState<string>(''); // State for rejection reason
  const [showRejectionDialog, setShowRejectionDialog] = useState<boolean>(false); // State to control dialog visibility
  const [orderIdToReject, setOrderIdToReject] = useState<string | null>(null); // Order ID for rejection

  // Fetch orders from API
  const fetchOrders = async () => {
    try {
      const response = await axios.get('/api/admin/order');
      setOrders(response.data);
    } catch (error) {
      console.error('Failed to fetch orders:', error);
    }
  };

  useEffect(() => {
    // Fetch initial orders data
    fetchOrders();

    // Listen to new orders and order status updates
    socket.on('newOrder', (order: Order) => {
      toast.info(`New order placed by ${order.name}.`);
      setOrders((prevOrders) => [order, ...prevOrders]);
    });

    socket.on('orderStatusUpdate', (updatedOrder: Order) => {
      setOrders((prevOrders) =>
        prevOrders.map((order) =>
          order._id === updatedOrder._id ? updatedOrder : order
        )
      );
      toast.success(`Order ${updatedOrder.orderId} has been updated to ${updatedOrder.status.value}.`);
    });

    return () => {
      socket.off('newOrder');
      socket.off('orderStatusUpdate');
    };
  }, []);

  // Handle approve or reject order
  const handleOrderStatusChange = async (orderId: string, newStatus: string) => {
    try {
      const updateData: any = {
        status: {
          value: newStatus,
          rejectionReason: newStatus === 'Rejected' ? rejectionReason || 'No reason provided' : '',
        },
      };

      const response = await axios.patch(`/api/admin/order/${orderId}`, updateData);
      const updatedOrder = response.data;
      setOrders((prevOrders) =>
        prevOrders.map((order) =>
          order._id === updatedOrder._id ? updatedOrder : order
        )
      );
      toast.success(`Order ${orderId} has been updated to ${newStatus}.`);

      // Close modal and reset reason after rejection
      setShowRejectionDialog(false);
      setRejectionReason('');

    } catch (error) {
      console.error(`Failed to update order ${orderId}:`, error);
      toast.error(`Failed to update order ${orderId}.`);
    }
  };

  // Open the rejection dialog and store the order ID
  const openRejectionDialog = (orderId: string) => {
    setOrderIdToReject(orderId);
    setShowRejectionDialog(true);
  };

  // Handle rejection with reason
  const handleRejectOrder = () => {
    if (rejectionReason.trim() === '') {
      toast.error('Rejection reason cannot be empty.');
      return;
    }
    if (orderIdToReject) {
      handleOrderStatusChange(orderIdToReject, 'Rejected');
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <ToastContainer />
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">Manage Orders</CardTitle>
        </CardHeader>
        <CardContent>
          {orders.length === 0 ? (
            <p className="text-center text-gray-500">No orders available</p>
          ) : (
            <table className="w-full table-auto border-collapse">
              <thead>
                <tr>
                  <th className="border-b p-4 text-left">Order ID</th>
                  <th className="border-b p-4 text-left">User Name</th>
                  <th className="border-b p-4 text-left">Total Amount</th>
                  <th className="border-b p-4 text-left">Payment Method</th>
                  <th className="border-b p-4 text-left">Transaction ID</th>
                  <th className="border-b p-4 text-left">Status</th>
                  <th className="border-b p-4 text-left">Rejection Reason</th>
                  <th className="border-b p-4 text-left">Actions</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((order) => (
                  <tr key={order._id}>
                    <td className="border-b p-4">{order.orderId}</td>
                    <td className="border-b p-4">{order.name}</td>
                    <td className="border-b p-4">৳{order.totalAmount}</td>
                    <td className="border-b p-4">{order.paymentMethod}</td>
                    <td className="border-b p-4">{order.bkashTxnId || "N/A"}</td>
                    <td className="border-b p-4">{order.status.value}</td>
                    {/* Show rejection reason if the order is rejected */}
                    <td className="border-b p-4">
                      {order.status.value === 'Rejected' ? order.status.rejectionReason : 'N/A'}
                    </td>
                    <td className="border-b p-4">
                      {order.status.value === 'Pending' && (
                        <>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleOrderStatusChange(order._id, 'Approved')}
                            className="mr-2"
                          >
                            Approve
                          </Button>
                          <Dialog open={showRejectionDialog} onOpenChange={setShowRejectionDialog}>
                            <DialogTrigger asChild>
                              <Button variant="outline" size="sm" onClick={() => openRejectionDialog(order._id)}>
                                Reject
                              </Button>
                            </DialogTrigger>
                            <DialogContent>
                              <DialogHeader>
                                <DialogTitle>Reject Order</DialogTitle>
                              </DialogHeader>
                              <Input
                                type="text"
                                placeholder="Rejection reason"
                                value={rejectionReason}
                                onChange={(e) => setRejectionReason(e.target.value)}
                                className="my-4"
                              />
                              <DialogFooter>
                                <Button variant="outline" onClick={() => setShowRejectionDialog(false)}>
                                  Cancel
                                </Button>
                                <Button variant="default" onClick={handleRejectOrder}>
                                  Confirm Rejection
                                </Button>
                              </DialogFooter>
                            </DialogContent>
                          </Dialog>
                        </>
                      )}
                      {order.status.value === 'Approved' && (
                        <>
                          <span className="text-green-600 font-semibold">Approved</span>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleOrderStatusChange(order._id, 'Pending')}
                            className="ml-2"
                          >
                            Edit Status
                          </Button>
                        </>
                      )}
                      {order.status.value === 'Rejected' && (
                        <>
                          <span className="text-red-600 font-semibold">Rejected</span>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleOrderStatusChange(order._id, 'Pending')}
                            className="ml-2"
                          >
                            Edit Status
                          </Button>
                        </>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminOrdersPage;
