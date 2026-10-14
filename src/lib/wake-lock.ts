// Screen Wake Lock API agar layar HP tidak mati otomatis saat mode latihan gym

type WakeLockSentinelType = {
  release: () => Promise<void>;
  addEventListener: (type: string, listener: () => void) => void;
};

let wakeLockSentinel: WakeLockSentinelType | null = null;
let isRequested = false;

export async function requestScreenWakeLock(): Promise<boolean> {
  if (typeof window === 'undefined' || !('wakeLock' in navigator)) {
    return false;
  }

  try {
    isRequested = true;
    const nav = navigator as unknown as {
      wakeLock: { request: (type: string) => Promise<WakeLockSentinelType> };
    };
    wakeLockSentinel = await nav.wakeLock.request('screen');

    wakeLockSentinel.addEventListener('release', () => {
      wakeLockSentinel = null;
    });

    return true;
  } catch {
    return false;
  }
}

export async function releaseScreenWakeLock(): Promise<void> {
  isRequested = false;
  if (wakeLockSentinel) {
    try {
      await wakeLockSentinel.release();
    } catch {
      // ignore
    } finally {
      wakeLockSentinel = null;
    }
  }
}

// Re-acquire wake lock jika user kembali ke tab setelah minimize
if (typeof document !== 'undefined') {
  document.addEventListener('visibilitychange', async () => {
    if (document.visibilityState === 'visible' && isRequested && !wakeLockSentinel) {
      await requestScreenWakeLock();
    }
  });
}
