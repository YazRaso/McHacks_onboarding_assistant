import "./globals.css";
import Link from "next/link";

export const metadata = {
  title: "Backboard Dashboard",
  description: "Web App dashboard for Backboard.io",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <div className="min-h-screen flex">
          <aside className="w-72 bg-white border-r p-4">
            <h1 className="text-xl font-semibold mb-4">Backboard</h1>
            <nav className="flex flex-col gap-2">
              <Link
                className="px-3 py-2 rounded hover:bg-gray-100"
                href="/memory"
              >
                Memory Overview
              </Link>
              <Link
                className="px-3 py-2 rounded hover:bg-gray-100"
                href="/connected"
              >
                Connected Apps
              </Link>
              <Link
                className="px-3 py-2 rounded hover:bg-gray-100"
                href="/query"
              >
                Query
              </Link>
              <Link
                className="px-3 py-2 rounded hover:bg-gray-100"
                href="/settings"
              >
                API Settings
              </Link>
            </nav>
          </aside>

          <main className="flex-1 p-6">{children}</main>
        </div>
      </body>
    </html>
  );
}
