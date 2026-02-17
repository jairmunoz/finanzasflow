import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';
import { versionPlugin } from './plugins/vite-plugin-version';

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, '.', '');
    return {
      server: {
        port: 3000,
        host: '0.0.0.0',
      },
      plugins: [
        react(),
        versionPlugin(),
        VitePWA({
          registerType: 'autoUpdate',
          includeAssets: [
            'favicon.ico',
            'apple-touch-icon.png',
            'masked-icon.svg',
            'android-launchericon-48-48.png',
            'android-launchericon-72-72.png',
            'android-launchericon-96-96.png',
            'android-launchericon-144-144.png',
            'android-launchericon-192-192.png',
            'android-launchericon-512-512.png'
          ],
          manifest: {
            id: '/',
            name: 'Finance App',
            short_name: 'Finance',
            description: 'A simple app to manage your finances',
            theme_color: '#4F46E5',
            background_color: '#FFFFFF',
            icons: [
              {
                src: 'android-launchericon-48-48.png',
                sizes: '48x48',
                type: 'image/png'
              },
              {
                src: 'android-launchericon-72-72.png',
                sizes: '72x72',
                type: 'image/png'
              },
              {
                src: 'android-launchericon-96-96.png',
                sizes: '96x96',
                type: 'image/png'
              },
              {
                src: 'android-launchericon-144-144.png',
                sizes: '144x144',
                type: 'image/png'
              },
              {
                src: 'android-launchericon-192-192.png',
                sizes: '192x192',
                type: 'image/png'
              },
              {
                src: 'android-launchericon-512-512.png',
                sizes: '512x512',
                type: 'image/png'
              }
            ],
            screenshots: [
              {
                src: 'android-launchericon-512-512.png',
                sizes: '512x512',
                type: 'image/png',
                form_factor: 'wide',
                label: 'Desktop'
              },
              {
                src: 'android-launchericon-512-512.png',
                sizes: '512x512',
                type: 'image/png',
                label: 'Mobile'
              }
            ]
          }
        })
      ],
      define: {
        'process.env.API_KEY': JSON.stringify(env.GEMINI_API_KEY),
        'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY)
      },
      resolve: {
        alias: {
          '@': path.resolve(__dirname, '.'),
        }
      }
    };
});
