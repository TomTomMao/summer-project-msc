import React from "react";
 
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
      <section>{children}</section>
    )
  }
  
