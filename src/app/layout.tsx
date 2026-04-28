import type { Metadata } from 'next';
import { MantineProvider, createTheme } from '@mantine/core';
import { Notifications } from '@mantine/notifications';
import Provider from '@/store/Provider';
import '@mantine/core/styles.css';
import '@mantine/notifications/styles.css';

// Custom brown theme
const theme = createTheme({
  primaryColor: 'brown',
  colors: {
    brown: [
      '#faf7f0',
      '#f0e6d3',
      '#e0ccb3',
      '#d4a373',
      '#c4915a',
      '#b07d48',
      '#9a6a3d',
      '#8B6914',
      '#7a5a10',
      '#6b4f0d',
    ],
  },
  defaultRadius: 'md',
  fontFamily: 'system-ui, -apple-system, sans-serif',
});

export const metadata: Metadata = {
  title: 'Organization Hierarchy Manager',
  description: 'Manage your company\'s employee hierarchy',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <Provider>
          <MantineProvider theme={theme} defaultColorScheme="light">
            <Notifications position="top-right" />
            {children}
          </MantineProvider>
        </Provider>
      </body>
    </html>
  );
}