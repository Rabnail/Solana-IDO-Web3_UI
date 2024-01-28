'use client';
import LandingHeader from '@/components/LandingHeader/LandingHeader';
import Main from '@/components/Footer/Footer';

export default function Home() {

  return (
    <main className='w-full flex flex-col min-w-[100vw] h-full min-h-screen'>
      <LandingHeader />
      <Main />
    </main>
  );
}
