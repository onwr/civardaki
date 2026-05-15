"use client";

import { SessionProvider } from "next-auth/react";
import { MultiCartProvider } from "@/contexts/MultiCartContext";
import { LocationProvider } from "@/contexts/LocationContext";
import { SocketProvider } from "@/components/providers/SocketProvider";

export default function AppProviders({ children }) {
  return (
    <SessionProvider refetchOnWindowFocus refetchInterval={0}>
      <LocationProvider>
        <SocketProvider>
          <MultiCartProvider>{children}</MultiCartProvider>
        </SocketProvider>
      </LocationProvider>
    </SessionProvider>
  );
}
