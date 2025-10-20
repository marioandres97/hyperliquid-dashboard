'use client';

import { SWRConfiguration } from 'swr';

const defaultFetcher = async (url: string) => {
  const res = await fetch(url);
  if (!res.ok) {
    const error = new Error('An error occurred while fetching the data.');
    throw error;
  }
  return res.json();
};

export const swrConfig: SWRConfiguration = {
  revalidateOnFocus: false,
  revalidateOnReconnect: true,
  dedupingInterval: 5000,
  errorRetryCount: 3,
  errorRetryInterval: 5000,
  focusThrottleInterval: 5000,
  loadingTimeout: 3000,
  suspense: false,
  keepPreviousData: true,
  fetcher: defaultFetcher,
};
