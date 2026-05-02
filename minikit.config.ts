const ROOT_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://chain-minesweeper.vercel.app';

export const minikitConfig = {
  accountAssociation: {
    header: 'eyJmaWQiOjIxMTE4OSwidHlwZSI6ImF1dGgiLCJrZXkiOiIweDMxOTk5REZCMzI1NkQzMjNDQTA1N0RkMjBhREI1NkI4RUQ0NTE3NzQifQ',
    payload: 'eyJkb21haW4iOiJjaGFpbi1taW5lc3dlZXBlci52ZXJjZWwuYXBwIn0',
    signature: 'k+8T7dBtRuXk+kO2JseU9QQZSJnfA4Az9XRGKp68m4xCf7B9RmB4gX/KKco80vbA689RkXj2HfNwbGDLuj6NlRs=',
  },
  miniapp: {
    version: '1',
    name: 'Chain Minesweeper',
    subtitle: 'Daily onchain puzzle',
    description: 'A daily Minesweeper where the board is seeded by the Base blockchain. Same board for everyone, every day.',
    iconUrl: `${ROOT_URL}/icon.png`,
    splashImageUrl: `${ROOT_URL}/splash.png`,
    splashBackgroundColor: '#EDEAD9',
    homeUrl: ROOT_URL,
    webhookUrl: `${ROOT_URL}/api/webhook`,
    primaryCategory: 'games',
    tags: ['game', 'puzzle', 'base', 'daily', 'minesweeper'],
    heroImageUrl: `${ROOT_URL}/og-image.png`,
    screenshotUrls: [
      `${ROOT_URL}/screenshot1.png`,
      `${ROOT_URL}/screenshot2.png`,
      `${ROOT_URL}/screenshot3.png`,
    ],
    tagline: 'Sweep the chain.',
    ogTitle: 'Chain Minesweeper',
    ogDescription: 'Daily Minesweeper seeded by Base blockchain.',
    ogImageUrl: `${ROOT_URL}/og-image.png`,
    noindex: false,
    requiredChains: ['eip155:8453'],
    requiredCapabilities: [],
  },
} as const;
