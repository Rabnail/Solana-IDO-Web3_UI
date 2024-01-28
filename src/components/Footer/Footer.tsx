import Link from 'next/link'
import React from 'react'

export default function Footer() {
    return (
        <>
            <div className='w-full grow px-5 sm:px-[100px] py-6 sm:py-[50px] flex items-start justify-start custom-lg:items-center custom-lg:justify-center bg-sky-200 '>
                <div className='w-full max-w-[1440px] flex flex-col gap-6 custom-lg:gap-0 custom-lg:flex-row items-center custom-lg:justify-between text-stone-800 font-semibold'>
                    <div className='flex flex-col'>
                        <div className='flex justify-start'>
                            <img
                                src='/icons/logo_big.png'
                                alt='logo'
                                className='h-[100px] mb-4 float-left object-fill'
                            />
                        </div>
                        <div className='text-secondary-400 text-xl mb-8'>
                            CREATE YOUR <b>TOKEN</b><br /> AND MAKE YOUR NEW <b>FORTUNE</b>
                        </div>
                        <div className='flex items-center gap-4'>
                            <Link href="/token-presale">
                                <button className='bg-primary-200 rounded-xl px-6 py-2 flex items-center justify-center gap-2'>
                                    <div className=''>
                                        Token Presale
                                    </div>
                                </button>
                            </Link>
                            <Link href="/create-market">
                                <button className='bg-primary-200 rounded-xl px-6 py-2 flex items-center justify-center gap-2'>
                                    <div className=''>
                                        Create Market
                                    </div>
                                </button>
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
            <div className='w-full px-5 sm:px-[100px] py-4 border-t border-t-secondary-600 flex items-center justify-center bg-cyan-300 '>
                <div className='w-full max-w-[1440px] flex-col custom-lg:flex-row gap-4 flex items-center justify-between text-secondary-400 text-sm font-semibold'>
                    <div className=' hidden custom-lg:block'>
                        ©2024 Token Presale 
                    </div>
                    <div className='flex items-center gap-4'>
                        <div>
                            Terms & Conditions
                        </div>
                        <div>
                            Privacy Policy
                        </div>
                    </div>
                    <div className=' flex w-full justify-between custom-lg:hidden'>
                        <div className=''>
                            ©2024 Token Presale 
                        </div>
                    </div>
                </div>
            </div>
        </>
    )
}
