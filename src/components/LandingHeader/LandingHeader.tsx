import Image from 'next/image'
import Link from 'next/link'
import React from 'react'
import ConnectButton from './ConnectButton'
import { usePathname } from 'next/navigation'
export default function LandingHeader() {
    const pathname = usePathname()
    const [pathName, setPathName] = React.useState('');
    React.useEffect(() => {
        if (pathname) {
            setPathName(pathname);
        }
    }, [pathname])
    return (
        <div className='w-full top-0 z-20 bg-sky-900'>
            <div className='h-full grow px-5 md:px-[100px] py-4 md:py-6 bg-sky-300 flex flex-col items-center justify-center w-full '>
                <div className='max-w-[1440px] w-full flex justify-between items-center'>
                    <Link href='/'>
                        <Image
                            src='/icons/logo.png'
                            alt='Logo Icon'
                            width={147}
                            height={39}
                        />
                    </Link>
                    <div className='hidden md:flex text-xs lg:text-sm xl:text-base items-center text-[white] font-semibold'>
                        <Link href='/create-token' className={` ${pathName == '/create-token' && 'text-primary-200'} py-2 px-2 xl:px-4 hover:text-primary-200`}>
                            Create Token
                        </Link>
                        <Link href='/my-token' className={` ${pathName == '/my-token' && 'text-primary-200'} py-2 px-2 xl:px-4 hover:text-primary-200`}>
                            My Tokens
                        </Link>
                        <Link href='/' className={` ${pathName == '/' && 'text-primary-200'} py-2 px-2 xl:px-4 hover:text-primary-200`}>
                            Main Page
                        </Link>
                    </div>
                    <div className='flex items-center gap-2 lg:gap-4'>
                        <ConnectButton />
                    </div >
                </div >
            </div >
        </div>
    )
}
