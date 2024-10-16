// File: /app/api/admin/order/[id]/route.ts

import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Order from '@/models/Order';
import { io } from '../../../../../../server'; // Import Socket.IO instance properly

// PATCH request handler for updating an order by ID (Admin use)
export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  await dbConnect();

  try {
    const { id } = params;
    if (!id) {
      return NextResponse.json({ message: 'Order ID is required' }, { status: 400 });
    }

    const { status } = await req.json();
    console.log("Received Status and Rejection Reason:", status); // Log the entire status object

    if (!status.value) {
      return NextResponse.json({ message: 'Status value is required' }, { status: 400 });
    }

    // Update order with status and rejectionReason (if applicable)
    const updateData = {
      status: {
        value: status.value,
        rejectionReason: status.value === 'Rejected' ? status.rejectionReason : '', // Add rejectionReason if rejected
      },
    };

    const updatedOrder = await Order.findByIdAndUpdate(id, updateData, { new: true });

    if (!updatedOrder) {
      return NextResponse.json({ message: 'Order not found' }, { status: 404 });
    }

    // Emit socket event for order status update
    io.emit('orderStatusUpdate', updatedOrder);

    return NextResponse.json(updatedOrder, { status: 200 });
  } catch (error: any) {
    console.error('Error updating order:', error.message);
    return NextResponse.json({ message: 'Error updating order', error: error.message }, { status: 500 });
  }
}
