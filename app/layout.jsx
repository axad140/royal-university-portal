export const metadata = {
  title: 'Elite University Portal',
  description: 'Premium Admission System',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
