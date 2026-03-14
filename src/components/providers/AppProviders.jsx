"use client";

import { SessionProvider } from "next-auth/react";
import { MultiCartProvider } from "@/contexts/MultiCartContext";
import { SocketProvider } from "@/components/providers/SocketProvider";

export default function AppProviders({ children }) {
  return (
    <SessionProvider>
      <SocketProvider>
        <MultiCartProvider>{children}</MultiCartProvider>
      </SocketProvider>
    </SessionProvider>
  );
}
