export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <main className="flex flex-col items-center justify-between sm:justify-center w-full min-h-dvh gap-4 p-4 bg-gray-100">
      {children}
    </main>
  );
}
