'use client';

import { useQuery, type QueryClient } from '@tanstack/react-query';
import { getHomeDataAction } from '@/app/actions/latihan-actions';

export type HomeData = Awaited<ReturnType<typeof getHomeDataAction>>;

/** Data Home dengan cache klien: instan saat revisit, refresh di background. */
export function useHomeData(initialData?: HomeData) {
  return useQuery({
    queryKey: ['home'],
    queryFn: () => getHomeDataAction(),
    initialData,
    staleTime: 60_000, // 1 menit dianggap fresh — tap ulang Home tidak loading
    gcTime: 10 * 60_000,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
  });
}

export function prefetchHomeData(queryClient: QueryClient) {
  return queryClient.prefetchQuery({
    queryKey: ['home'],
    queryFn: () => getHomeDataAction(),
  });
}
