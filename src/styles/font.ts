import { Inter } from "next/font/google";

/**
 * Sets --font-inter on the element that receives `inter.variable`.
 * globals.css maps that variable onto font-sans.
 */
export const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});
