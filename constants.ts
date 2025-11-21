
import React from 'react';

// Simple SVG Icons
export const ICONS = {
  Dashboard: (props: React.SVGProps<SVGSVGElement>) => (
    React.createElement("svg", { ...props, fill: "none", viewBox: "0 0 24 24", stroke: "currentColor" },
      React.createElement("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 1.5, d: "M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" })
    )
  ),
  Notes: (props: React.SVGProps<SVGSVGElement>) => (
    React.createElement("svg", { ...props, fill: "none", viewBox: "0 0 24 24", stroke: "currentColor" },
      React.createElement("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 1.5, d: "M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" })
    )
  ),
  Calendar: (props: React.SVGProps<SVGSVGElement>) => (
    React.createElement("svg", { ...props, fill: "none", viewBox: "0 0 24 24", stroke: "currentColor" },
      React.createElement("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 1.5, d: "M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" })
    )
  ),
  Wallet: (props: React.SVGProps<SVGSVGElement>) => (
    React.createElement("svg", { ...props, fill: "none", viewBox: "0 0 24 24", stroke: "currentColor" },
      React.createElement("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 1.5, d: "M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" })
    )
  ),
  CRM: (props: React.SVGProps<SVGSVGElement>) => (
    React.createElement("svg", { ...props, fill: "none", viewBox: "0 0 24 24", stroke: "currentColor" },
      React.createElement("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 1.5, d: "M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" })
    )
  ),
  Goals: (props: React.SVGProps<SVGSVGElement>) => (
    React.createElement("svg", { ...props, fill: "none", viewBox: "0 0 24 24", stroke: "currentColor" },
      React.createElement("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 1.5, d: "M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" })
    )
  ),
  Files: (props: React.SVGProps<SVGSVGElement>) => (
    React.createElement("svg", { ...props, fill: "none", viewBox: "0 0 24 24", stroke: "currentColor" },
      React.createElement("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 1.5, d: "M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" })
    )
  ),
  Send: (props: React.SVGProps<SVGSVGElement>) => (
    React.createElement("svg", { ...props, fill: "none", viewBox: "0 0 24 24", stroke: "currentColor" },
      React.createElement("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 1.5, d: "M12 19l9 2-9-18-9 18 9-2zm0 0v-8" })
    )
  ),
  AI: (props: React.SVGProps<SVGSVGElement>) => (
    React.createElement("svg", { ...props, fill: "none", viewBox: "0 0 24 24", stroke: "currentColor" },
      React.createElement("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 1.5, d: "M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" })
    )
  ),
  Settings: (props: React.SVGProps<SVGSVGElement>) => (
    React.createElement("svg", { ...props, fill: "none", viewBox: "0 0 24 24", stroke: "currentColor" },
      React.createElement("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 1.5, d: "M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" }),
      React.createElement("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 1.5, d: "M15 12a3 3 0 11-6 0 3 3 0 016 0z" })
    )
  ),
  LogOut: (props: React.SVGProps<SVGSVGElement>) => (
    React.createElement("svg", { ...props, fill: "none", viewBox: "0 0 24 24", stroke: "currentColor" },
      React.createElement("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 1.5, d: "M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" })
    )
  )
};
