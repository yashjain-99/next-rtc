export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <main className="flex flex-col w-full min-h-screen bg-gray-100">
      <header className="flex w-full sticky top-0 items-center bg-slate-300 p-4 shadow-md">
        <div className="text-xl font-bold text-indigo-600 font-roboto">
          NextRTC
        </div>
      </header>
      {children}
    </main>
  );
}
