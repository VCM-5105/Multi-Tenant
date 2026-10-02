import "./globals.css";
import { AuthProvider } from "../context/AuthContext";

export const metadata = {
  title: "AppZex — Multi-Tenant Agency SaaS",
  description: "Modern, isolated multi-tenant management platform for agencies and clients.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-slate-50 text-slate-900 antialiased">
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
