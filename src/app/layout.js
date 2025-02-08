'use client';
import { SocketProvider } from "@/context/context";
import { Suspense } from "react";
export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <Suspense fallback={<div><h1>Loading...</h1></div>}>
          <SocketProvider>
            {children}
          </SocketProvider>
        </Suspense>
      </body>
    </html>
  );
}
