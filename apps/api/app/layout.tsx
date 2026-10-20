export const metadata = {
  title: 'CALSIO API',
  description: 'Backend for the CALSIO native shoe-commerce app. Agra se. Aapke kadmon tak.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en-IN">
      <body
        style={{
          fontFamily: 'Inter, system-ui, sans-serif',
          background: '#F7F1E8',
          color: '#1C1B1A',
          margin: 0,
        }}
      >
        {children}
      </body>
    </html>
  );
}
