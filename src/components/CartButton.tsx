"use client";

import { useCart } from '@/contexts/CartContext';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { useEffect, useState } from 'react';

function CartButton() {
  const { cartItems } = useCart();
  const [hasMounted, setHasMounted] = useState(false);

  // Set hasMounted to true after component mounts
  useEffect(() => {
    setHasMounted(true);
  }, []);

  // Calculate total items in the cart
  const totalItems = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  if (!hasMounted) {
    // Render nothing on the server-side to avoid mismatch
    return null;
  }

  return (
    <Link href="/cart">
      <Button className="bg-blue-500 text-white px-4 py-2 rounded">
        Cart ({totalItems})
      </Button>
    </Link>
  );
}

export default CartButton;
