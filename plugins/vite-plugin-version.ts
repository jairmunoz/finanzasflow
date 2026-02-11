import fs from 'fs';
import path from 'path';
import type { Plugin } from 'vite';

interface VersionData {
  version: string;
  buildNumber: number;
  buildDate: string;
}

export function versionPlugin(): Plugin {
  const versionPath = path.resolve(__dirname, '../version.json');

  return {
    name: 'vite-plugin-version',
    buildStart() {
      // Solo incrementar en modo build (no en dev)
      if (process.env.NODE_ENV === 'production' || process.argv.includes('build')) {
        try {
          const versionData: VersionData = JSON.parse(fs.readFileSync(versionPath, 'utf-8'));
          
          // Incrementar build number
          versionData.buildNumber += 1;
          
          // Actualizar fecha de build
          versionData.buildDate = new Date().toISOString();
          
          // Incrementar versión patch automáticamente cada 10 builds
          const [major, minor, patch] = versionData.version.split('.').map(Number);
          if (versionData.buildNumber % 10 === 0) {
            versionData.version = `${major}.${minor}.${patch + 1}`;
          }
          
          fs.writeFileSync(versionPath, JSON.stringify(versionData, null, 2));
          console.log(`\n📦 Build version: ${versionData.version} (Build #${versionData.buildNumber})\n`);
        } catch (error) {
          console.error('Error updating version:', error);
        }
      }
    },
    config() {
      try {
        const versionData: VersionData = JSON.parse(fs.readFileSync(versionPath, 'utf-8'));
        return {
          define: {
            '__APP_VERSION__': JSON.stringify(versionData.version),
            '__BUILD_NUMBER__': JSON.stringify(versionData.buildNumber),
            '__BUILD_DATE__': JSON.stringify(versionData.buildDate || new Date().toISOString()),
          }
        };
      } catch {
        return {
          define: {
            '__APP_VERSION__': JSON.stringify('0.0.0'),
            '__BUILD_NUMBER__': JSON.stringify(0),
            '__BUILD_DATE__': JSON.stringify(new Date().toISOString()),
          }
        };
      }
    }
  };
}
