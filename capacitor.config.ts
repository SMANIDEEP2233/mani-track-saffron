import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'app.lovable.e125ff9079334e75bf1d8e481bb65f5e',
  appName: 'mani-track-saffron',
  webDir: 'dist',
  server: {
    url: 'https://e125ff90-7933-4e75-bf1d-8e481bb65f5e.lovableproject.com?forceHideBadge=true',
    cleartext: true
  },
  plugins: {
    Camera: {
      permissions: ['camera', 'photos']
    }
  }
};

export default config;