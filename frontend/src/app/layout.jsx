
import "./globals.css";
import AppLayout from "../components/layout/AppLayout";

export const metadata = {
  title: "LibraDesk | Library Management",
  description:
    "Manage your library books, members, borrowing, and returns with LibraDesk.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <AppLayout>{children}</AppLayout>
      </body>
    </html>
  );
}
