import "./globals.css";

export const metadata = {
  title: "Shipping 3D",
  description: "A product viewer you're allowed to deploy.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="antialiased">{children}</body>
    </html>
  );
}
