// Required by Next.js: every app needs a root layout that wraps all pages.
export const metadata = {
  title: "Irish Rail Live Times",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body style={{ margin: 0, background: "#0d1117", color: "#e6edf3" }}>
        {children}
      </body>
    </html>
  );
}