import { ReactNode } from "react";
import "./globals.css";

export const metadata = {
  title: "ModerIA Dashboard",
  description: "AI-driven mentor-student matching platform",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <head />
      <body className="main-window">{children}</body>
    </html>
  );
}
