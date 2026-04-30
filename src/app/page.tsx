import { unstable_cache } from 'next/cache';
import { getDailySeed } from '@/lib/baseRpc';
import { GamePage } from '@/components/GamePage';

// Cache is keyed by date string so cache auto-invalidates when the date changes
const getCachedSeed = unstable_cache(
  (dateStr: string) => getDailySeed(new Date(dateStr)),
  ['daily-seed'],
  { revalidate: 60 }
);

export default async function Home() {
  const today = new Date();
  const dateStr = today.toISOString().slice(0, 10); // YYYY-MM-DD (UTC)

  const { seed, blockNumber } = await getCachedSeed(dateStr);

  return (
    <GamePage
      seed={seed}
      blockNumber={blockNumber}
      date={dateStr}
    />
  );
}
