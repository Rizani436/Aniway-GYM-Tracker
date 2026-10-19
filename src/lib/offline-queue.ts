/**
 * Antrean sesi latihan yang belum terkirim ke server.
 *
 * Dipakai saat offline: sesi disimpan di perangkat, lalu dikuras otomatis saat
 * online. Kunci `clientSessionId` dikirim ke server sebagai WorkoutSession.id
 * sehingga pengiriman ulang tidak pernah menghasilkan sesi ganda.
 */
import type { SaveWorkoutSessionInput } from '@/lib/validations';

const KEY = (userId: string) => `aniway_pending_sessions_${userId}`;

export interface QueuedSession extends SaveWorkoutSessionInput {
  clientSessionId: string;
  queuedAt: number;
}

function read(userId: string): QueuedSession[] {
  try {
    const raw = localStorage.getItem(KEY(userId));
    const arr = raw ? (JSON.parse(raw) as QueuedSession[]) : [];
    return Array.isArray(arr) ? arr : [];
  } catch {
    return [];
  }
}

function write(userId: string, items: QueuedSession[]) {
  try {
    localStorage.setItem(KEY(userId), JSON.stringify(items));
  } catch {
    // kuota penuh: biarkan, user akan diberi tahu lewat penghitung antrean
  }
}

export function enqueueSession(userId: string, sesi: Omit<QueuedSession, 'queuedAt'>) {
  const items = read(userId);
  if (items.some((i) => i.clientSessionId === sesi.clientSessionId)) return;
  items.push({ ...sesi, queuedAt: Date.now() });
  write(userId, items);
}

export function pendingCount(userId: string): number {
  return read(userId).length;
}

export function listPending(userId: string): QueuedSession[] {
  return read(userId);
}

/**
 * Kuras antrean. `sender` = fungsi yang benar-benar mengirim (biasanya
 * saveWorkoutSessionAction). Entri yang sukses / ditolak permanen dihapus;
 * entri yang gagal karena jaringan DIPERTAHANKAN untuk dicoba lagi.
 */
export async function flushQueue(
  userId: string,
  sender: (input: SaveWorkoutSessionInput) => Promise<unknown>
): Promise<{ sent: number; failed: number }> {
  const items = read(userId);
  if (items.length === 0) return { sent: 0, failed: 0 };

  const sisa: QueuedSession[] = [];
  let sent = 0;

  for (const item of items) {
    const { clientSessionId, queuedAt, ...payload } = item;
    try {
      await sender({ ...payload, id: clientSessionId });
      sent++;
    } catch (e) {
      const msg = String((e as Error)?.message ?? '');
      const masalahJaringan = /fetch|network|timeout|Failed to fetch|EAI_AGAIN|ENOTFOUND/i.test(msg);
      if (masalahJaringan) sisa.push(item); // coba lagi nanti
      else sent++; // ditolak permanen: jangan blokir antrean
    }
  }

  write(userId, sisa);
  return { sent, failed: sisa.length };
}
