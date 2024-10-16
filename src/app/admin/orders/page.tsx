// File: /app/admin/orders/page.tsx

"use client";

import React, { useEffect, useState } from 'react';
import axios from 'axios';
import io from 'socket.io-client';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from '@/components/ui/input';

const socket = io('http://localhost:3001'); // Connect to your backend server

interface Order {
  _id: string;
  orderId: string; // Add orderId field
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
  const [rejectionReason, setRejectionReason] = useState<{ [key: string]: string }>({});

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
          rejectionReason: newStatus === 'Rejected' ? rejectionReason[orderId] || 'No reason provided' : '',
        },
      };

      // Add logging to check the updateData
      console.log("Updating order with data:", updateData);

      const response = await axios.patch(`/api/admin/order/${orderId}`, updateData);
      const updatedOrder = response.data;
      setOrders((prevOrders) =>
        prevOrders.map((order) =>
          order._id === updatedOrder._id ? updatedOrder : order
        )
      );
      toast.success(`Order ${orderId} has been updated to ${newStatus}.`);

    } catch (error) {
      console.error(`Failed to update order ${orderId}:`, error);
      toast.error(`Failed to update order ${orderId}.`);
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
                    {/* Display orderId instead of _id */}
                    <td className="border-b p-4">{order.orderId}</td> 
                    <td className="border-b p-4">{order.name}</td>
                    <td className="border-b p-4">৳{order.totalAmount}</td>
                    <td className="border-b p-4">{order.paymentMethod}</td>
                    <td className="border-b p-4">{order.bkashTxnId || "N/A"}</td>
                    <td className="border-b p-4">{order.status.value}</td>
                    <td className="border-b p-4">{order.status.value === 'Rejected' ? order.status.rejectionReason || 'N/A' : 'N/A'}</td>
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
                          <div className="flex items-center">
                            <Input
                              type="text"
                              placeholder="Rejection reason"
                              value={rejectionReason[order._id] || ''}
                              onChange={(e) => setRejectionReason({ ...rejectionReason, [order._id]: e.target.value })}
                              className="mr-2"
                            />
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleOrderStatusChange(order._id, 'Rejected')}
                            >
                              Reject
                            </Button>
                          </div>
                        </>
                      )}
                      {order.status.value === 'Approved' && (
                        <>
                          <span className="text-green-600 font-semibold">Approved (Confirmed)</span>
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
                        <span className="text-red-600 font-semibold">Rejected (Not Confirmed)</span>
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
