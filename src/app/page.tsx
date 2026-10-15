import { getAuthenticatedUser } from '@/lib/supabase/server';
import { getHomeDataAction } from '@/app/actions/latihan-actions';
import { HomeClient } from '@/components/home/home-client';

export const dynamic = 'force-dynamic';

export default async function HomePage() {
  // getAuthenticatedUser() di-cache React, jadi tidak query dua kali
  // walau juga dipanggil di dalam getHomeDataAction().
  const [user, data] = await Promise.all([getAuthenticatedUser(), getHomeDataAction()]);

  return <HomeClient data={data} user={user} />;
}
