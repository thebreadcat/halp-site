import { getDefaultConfig } from '@rainbow-me/rainbowkit';
import {
  base,
} from 'wagmi/chains';

export const config = getDefaultConfig({
  appName: 'HALP App',
  projectId: 'YOUR_PROJECT_ID',
  chains: [
    base,
  ],
  ssr: true,
});