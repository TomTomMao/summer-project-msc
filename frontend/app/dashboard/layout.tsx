import React from "react";

const LAYOUT_WIDTH = 1654.43
const LAYOUT_HEIGHT = 798.511
export const metadata = {
    title: 'dashboard',
    description: 'dashboard',
  }
  
  export default function DashboardLayout({
    children,
  }: {
    children: React.ReactNode
  }) {
    //ref: https://nextjs.org/docs/app/building-your-application/routing/pages-and-layouts#nesting-layouts
    return (
      <section style={{width: LAYOUT_WIDTH, height: LAYOUT_HEIGHT}}>{children}</section>
    )
  }
  
