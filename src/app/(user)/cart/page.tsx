// File: CartPage.tsx
"use client";

import React, { useState, useEffect } from "react";
import { useCart } from "@/contexts/CartContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const CartPage = () => {
  const [hasMounted, setHasMounted] = useState(false);
  const {
    cartItems,
    removeFromCart,
    clearCart,
    increaseQuantity,
    decreaseQuantity,
  } = useCart();
  const router = useRouter();
  const [showLoginDialog, setShowLoginDialog] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  useEffect(() => {
    setHasMounted(true);
  }, []);

  if (!hasMounted) {
    return null;
  }

  if (cartItems.length === 0) {
    return <div className="text-center mt-8">Your cart is empty</div>;
  }

  const handleCheckout = async () => {
    if (cartItems.length === 0) {
      alert(
        "Your cart is empty. Please add items to your cart before proceeding to checkout."
      );
      return;
    }

    try {
      const response = await fetch("/api/auth/session");
      const session = await response.json();

      if (!session || !session.user) {
        setShowLoginDialog(true);
        return;
      }

      router.push("/checkout");
    } catch (error) {
      console.error("Error during checkout:", error);
      alert(
        "There was an error while proceeding to checkout. Please try again."
      );
    }
  };

  const handleLogin = async () => {
    try {
      const result = await signIn("credentials", {
        redirect: false,
        email,
        password,
      });

      if (result?.error) {
        alert("Login failed: " + result.error);
      } else {
        setShowLoginDialog(false);
        router.push("/checkout");
      }
    } catch (error) {
      console.error("Error during login:", error);
      alert("Login failed. Please try again.");
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <Card className="max-w-4xl mx-auto">
        <CardHeader>
          <CardTitle className="text-2xl">Your Cart</CardTitle>
        </CardHeader>
        <CardContent>
          {cartItems.map((item) => (
            <div
              key={item._id}
              className="flex justify-between items-center mb-4"
            >
              <div className="flex items-center">
                <span className="font-medium mr-4">{item.name}</span>
                <div className="flex items-center">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => decreaseQuantity(item._id)}
                  >
                    -
                  </Button>
                  <span className="mx-2">{item.quantity}</span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => increaseQuantity(item._id)}
                  >
                    +
                  </Button>
                </div>
              </div>
              <div className="flex items-center">
                <span className="mr-4">
                  ৳{(item.price * item.quantity).toFixed(2)}
                </span>
                <Button
                  variant="outline"
                  onClick={() => removeFromCart(item._id)}
                >
                  Remove
                </Button>
              </div>
            </div>
          ))}

          <div className="flex justify-between mt-4">
            <Button variant="outline" onClick={clearCart}>
              Clear Cart
            </Button>
            <Button onClick={handleCheckout}>Proceed to Checkout</Button>
          </div>
        </CardContent>
      </Card>

      <Dialog open={showLoginDialog} onOpenChange={setShowLoginDialog}>
        <DialogContent className="max-w-lg mx-auto p-6">
          <DialogHeader>
            <DialogTitle>Login to Continue</DialogTitle>
            <DialogDescription>
              Please log in to proceed with the checkout.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <Label htmlFor="email" className="font-semibold">
                Email *
              </Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                required
                className="mt-1 w-full p-2 border rounded-md"
              />
            </div>
            <div>
              <Label htmlFor="password" className="font-semibold">
                Password *
              </Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                required
                className="mt-1 w-full p-2 border rounded-md"
              />
            </div>
          </div>

          <DialogFooter className="mt-6">
            <Button
              type="button"
              onClick={handleLogin}
              className="w-full bg-blue-500 text-white py-2 rounded-md hover:bg-blue-600"
            >
              Login
            </Button>
            <Button
              type="button"
              onClick={() => signIn("google")}
              className="w-full mt-4 bg-red-500 text-white py-2 rounded-md hover:bg-red-600 flex items-center justify-center"
            >
              Login with Google
            </Button>
            <Button
              variant="link"
              onClick={() => router.push("/signup")}
              className="mt-4 w-full text-center text-blue-600 hover:text-blue-800"
            >
              New? Sign Up
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CartPage;
