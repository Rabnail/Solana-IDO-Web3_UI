'use client';
import { useState, useRef } from 'react';
import Image from "next/image";
import { toMetaplexFileFromBrowser } from '@metaplex-foundation/js';
import { createSPLToken } from '@/contexts/createSPLToken';
import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import LandingHeader from '@/components/LandingHeader/LandingHeader';
import { useRouter } from 'next/navigation';
import { createMarket } from '@/contexts/createMarket';
import { PublicKey } from '@solana/web3.js';
import { revokeMintAuthority } from '@/contexts/revokeMintAuthority';
import { revokeFreezeAuthority } from '@/contexts/revokeFreezeAuthority';
import { createLiquidity } from '@/contexts/createLiquidity';
import { Snackbar } from '@material-ui/core'
import Alert from '@material-ui/lab/Alert'
interface AlertState {
    open: boolean
    message: string
    severity: 'success' | 'info' | 'warning' | 'error' | undefined
}

let marketId: PublicKey | null = null;
let lpMint: PublicKey | null | undefined = null;

export default function Home() {
    const wallet = useWallet()
    const { connection } = useConnection()
    const router = useRouter();
    const [mintAddress, setMintAddress] = useState<PublicKey | undefined>(undefined);
    const [tokenName, setTokenName] = useState("")
    const [tokenSymbol, setTokenSymbol] = useState("")
    const [tokenLogo, setTokenLogo] = useState<File | null>()
    const [imageUrl, setImageUrl] = useState<string | null>(null);
    const [tokenDecimal, setTokenDecimal] = useState(9)
    const [tokenToPut, setTokenToPut] = useState(0)
    const [solBalance, setSolBalance] = useState('0')
    const [alertState, setAlertState] = useState<AlertState>({
        open: false,
        message: "",
        severity: undefined,
    })

    const [step, setStep] = useState(1);

    const handleCreateToken = async () => {
        if (
            tokenName != "" &&
            tokenSymbol != "" &&
            tokenLogo != null &&
            tokenToPut != 0
        ) {
            if (!wallet.publicKey) return;
            const _file = await toMetaplexFileFromBrowser(tokenLogo);
            console.log("wallet publicKey ===>", wallet.publicKey, wallet);
            setAlertState({
                open: true,
                message: 'Transaction is in progress...',
                severity: 'info',
            })
            const mintResult = await createSPLToken(wallet.publicKey, wallet, connection, tokenToPut, tokenDecimal, true, tokenName, tokenSymbol, "", "", _file, "string");
            if (mintResult == undefined)
                console.log("Token creation result unknown, because of either delay or error");
            if (mintResult?.mint != undefined) {
                setMintAddress(mintResult.mint);
            }
            if (mintResult?.signature != undefined) {
                setAlertState({
                    open: true,
                    message: `Token creation done. Visit https://solscan.io/address/${mintResult.signature}?cluster=devnet`,
                    severity: 'info',
                })
            }
        } else {
            setAlertState({
                open: true,
                message: 'Invalid params',
                severity: 'error',
            })
            return;
        }
        setStep(2);
    }

    const handleCreateMarket = async () => {
        if (mintAddress == undefined) {
            setAlertState({
                open: true,
                message: 'Mint Address Not Set',
                severity: 'error',
            })
            return;
        }
        if (wallet.publicKey == null) {
            setAlertState({
                open: true,
                message: 'Wallet Not Configured',
                severity: 'error',
            })
            return;
        }
        const quoteMint = new PublicKey("So11111111111111111111111111111111111111112");
        const quoteDecimal = 9;
        const orderSize = 1;
        const tickSize = 0.01;
        setAlertState({
            open: true,
            message: 'Loading...',
            severity: 'info',
        })
        marketId = await createMarket(connection, wallet, mintAddress, tokenDecimal, quoteMint, quoteDecimal, orderSize, tickSize);
        console.log("creating market id ====>", marketId?.toString());
        setAlertState({
            open: false,
            message: `Market created. Visit https://solscan.io/address/${marketId?.toString()}?cluster=devnet`,
            severity: 'info',
        })
        setStep(5);
    }
    const handleMintChange = (value: string) => {
        if (value.length == 44 || value.length == 43) {
            console.log("Mint set, ", value);
            setMintAddress(new PublicKey(value));
        }
    }
    const handleNameChange = (value: string) => {
        setTokenName(value)
    }
    const handleSymbolChange = (value: string) => {
        setTokenSymbol(value)
    }
    const handleLogoFileChange = (files: FileList | null) => {
        if (files) {
            setTokenLogo(files[0])
            if (files[0]) {
                const imageUrls = Object.values(files).map((file) => URL.createObjectURL(file));
                setImageUrl(imageUrls[0]);
            }
        } else {
            setImageUrl('');
            setTokenLogo(null)
        }
    }
    const handleDecimalChange = (value: string) => {
        setTokenDecimal(parseInt(value))
    }
    const handleBalanceChange = (value: string) => {
        setTokenToPut(parseInt(value))
    }
    const handleSolBalanceChange = (value: string) => {
        setSolBalance(value);
    }

    const clickRevokeMint = async () => {
        if (mintAddress == undefined) {
            setAlertState({
                open: true,
                message: 'Mint Address Not Set',
                severity: 'error',
            })
            return;
        }
        if (wallet.publicKey == null) {
            setAlertState({
                open: true,
                message: 'Wallet Not Configured',
                severity: 'error',
            })
            return;
        }
        const mint = mintAddress;
        console.log("revoke mint :mint ===>", mint.toBase58())
        setAlertState({
            open: true,
            message: 'Transaction is in progress...',
            severity: 'info',
        })
        await revokeMintAuthority(connection, wallet, mint);
        setAlertState({
            open: true,
            message: 'Revoked mint authority.',
            severity: 'info',
        })
        setStep(3);
    }
    const clickRevokeFreeze = async () => {
        if (mintAddress == undefined) {
            setAlertState({
                open: true,
                message: 'Mint Address Not Set',
                severity: 'error',
            })
            return;
        }
        const mint = mintAddress;
        console.log("revoke freeze: mint ==>", mint.toBase58());
        setAlertState({
            open: true,
            message: 'Transaction is in progress...',
            severity: 'info',
        })
        await revokeFreezeAuthority(connection, wallet, mint);
        setAlertState({
            open: true,
            message: 'Revoked freeze authority.',
            severity: 'info',
        })
        setStep(4);
    }

    const clickAddLiquidity = async () => {
        if (marketId == undefined) {
            setAlertState({
                open: true,
                message: 'MarketID not Set',
                severity: 'error',
            })
            return;
        }
        if (mintAddress == undefined) {
            setAlertState({
                open: true,
                message: 'Mint Address Not Set',
                severity: 'error',
            })
            return;
        }
        if (tokenToPut <= 0) {
            setAlertState({
                open: true,
                message: 'Token Amonut not set',
                severity: 'error',
            })
            return;
        }
        console.log("Liquidity marketId ====>", marketId);
        try {
            const baseDecimal = tokenDecimal;
            const quoteMint = new PublicKey("So11111111111111111111111111111111111111112");
            const quoteDecimal = 9;
            const orderSize = 1;
            const tickSize = 0.01;
            console.log("mintaddress ==>", mintAddress.toBase58());
            console.log("solbalance ===>", parseFloat(solBalance));
            setAlertState({
                open: true,
                message: 'Transaction is in progress...',
                severity: 'info',
            })
            console.log("🚀 ~ clickAddLiquidity ~ tokenToPut:", tokenToPut)
            lpMint = await createLiquidity(connection, wallet, mintAddress, baseDecimal, quoteMint, quoteDecimal, orderSize, tickSize, marketId, tokenToPut, parseFloat(solBalance));
            setAlertState({
                open: true,
                message: `Successfully added liquidity. Visit https://solscan.io/address/${lpMint?.toString()}?cluster=devnet`,
                severity: 'info',
            })
            router.push('my-token');
        } catch (error) {
            console.log("Error in adding liquidity. ", error)
            setAlertState({
                open: true,
                message: 'Error in adding liquidity',
                severity: 'error',
            })
        }
    }

    const fileInputRef = useRef<HTMLInputElement>(null);
    const handleBig = () => {
        if (fileInputRef.current) {
            fileInputRef.current.click();
        }
    };
    return (
        <div className="w-full h-full min-h-screen flex flex-col items-start pt-6 sm:pt-0 sm:items-center justify-center bg-sky-200  sm:bg-sky-300">
            <LandingHeader />
            {
                step == 1 && (
                    <div className="flex flex-col max-w-[480px] w-full bg-sky-200 rounded-xl p-6 gap-6">
                        <div className='flex items-center justify-between'>
                            <div className='text-stone-800 text-2xl font-semibold'>
                                Create Token
                            </div>
                        </div>
                        <div className='flex flex-col gap-1'>
                            <p className="text-sm text-secondary-400">Name</p>
                            <input
                                className="w-full rounded-xl text-sm bg-sky-100 py-3 px-4 placeholder:text-secondary-700 text-stone-800 focus:ring-0 focus:border-0 focus:outline-none"
                                placeholder="Token Name"
                                onChange={(e) => handleNameChange(e.target.value)}
                                value={tokenName}
                            />
                        </div>
                        <div className='flex flex-col gap-1'>
                            <p className="text-sm text-secondary-400">Symbol</p>
                            <input
                                className="w-full rounded-xl text-sm bg-sky-100 py-3 px-4 placeholder:text-secondary-700 text-stone-800 focus:ring-0 focus:border-0 focus:outline-none"
                                placeholder="Token Symbol"
                                onChange={(e) => handleSymbolChange(e.target.value)}
                                value={tokenSymbol}
                            />
                        </div>
                        <div className='flex flex-col gap-1'>
                            <p className="text-sm text-secondary-400">Token Logo</p>
                            <div className='w-full relative bg-sky-100 flex flex-col items-center px-4 py-3 gap-3'>
                                <div className='flex flex-col items-center z-10'>
                                    <div className='text-stone-800 text-sm font-normal'>
                                        Token Symbol
                                    </div>
                                    <div className='text-secondary-700 text-xs font-normal'>
                                        Token Name
                                    </div>
                                </div>
                                <button className='bg-sky-800 rounded-xl text-stone-800 px-4 py-2 text-sm text-white font-semibold z-10' onClick={handleBig}>
                                    Upload File
                                    <input
                                        type="file"
                                        className='opacity-0 min-h-full min-w-full'
                                        accept='image/png, image/jpeg'
                                        ref={fileInputRef} style={{ display: 'none' }}
                                        onChange={(e) => handleLogoFileChange(e.target.files)}
                                    />
                                </button>
                                {
                                    imageUrl && (
                                        <div className='absolute border-2 border-white rounded-lg z-0 '>
                                            <img
                                                src={imageUrl}
                                                alt='fox'
                                                className='object-cover object-center max-h-[90px] aspect-square '
                                            />
                                        </div>
                                    )
                                }
                            </div>
                        </div>
                        <div className='w-full flex items-center justify-between gap-4'>
                            <div className='w-full flex flex-col gap-1'>
                                <p className="text-sm text-secondary-400">Decimal</p>
                                <input
                                    type="number"
                                    className="w-full rounded-xl text-sm bg-sky-100 py-3 px-4 placeholder:text-secondary-700 text-stone-800 focus:ring-0 focus:border-0 focus:outline-none"
                                    onChange={(e) => handleDecimalChange(e.target.value)}
                                    value={tokenDecimal}
                                />
                            </div>
                            <div className='w-full flex flex-col gap-1'>
                                <p className="text-sm text-secondary-400">
                                    Token to Mint
                                </p>
                                <input
                                    type="number"
                                    className="w-full rounded-xl text-sm bg-sky-100 py-3 px-4 placeholder:text-secondary-700 text-stone-800 focus:ring-0 focus:border-0 focus:outline-none"
                                    onChange={(e) => handleBalanceChange(e.target.value)}
                                    value={tokenToPut}
                                />
                            </div>
                        </div>
                        <div className='flex items-center justify-between'>
                            <div className='text-secondary-400 text-sm font-normal'>
                                Create Token Fee
                            </div>
                            <div className='text-stone-800 font-semibold text-sm'>
                                0.62 Sol
                            </div>
                        </div>
                        <div className='flex items-center justify-between'>
                            <button
                                className="w-full py-3 px-6 text-[white] text-sm font-semibold text-center rounded-xl bg-primary-200 mr-1"
                                onClick={handleCreateToken}

                            >
                                Create
                            </button>
                            <button
                                className="w-full py-3 px-6 text-[white] text-sm font-semibold text-center rounded-xl bg-primary-200 ml-1"
                                onClick={() => setStep(2)}
                            >
                                I have my token
                            </button>
                        </div>
                    </div>
                )
            }
            {
                step == 2 && (
                    <div className="flex flex-col max-w-[480px] w-full bg-sky-200 rounded-xl p-6 gap-8">
                        <div className='flex items-center justify-center'>
                            <div className='text-stone-800 text-2xl font-semibold'>
                                Revoke Mint Authority
                            </div>
                        </div>
                        <div className='flex flex-col items-center gap-1'>
                            <p className="text-sm text-secondary-400">Your Wallet Address</p>
                            <div className='p-2 w-full gap-2 flex items-center text-stone-800 rounded-xl bg-sky-300'>
                                <Image
                                    src="/icons/avatar-image.png"
                                    alt="avatar image"
                                    width={32}
                                    height={32}
                                    className='object-cover object-center w-8 h-8'
                                />
                                <p className='truncate w-[90%] text-sm'>
                                    {wallet.publicKey?.toBase58()}
                                </p>
                            </div>
                        </div>
                        <div className='flex flex-col items-center gap-1'>
                            <p className="text-sm text-secondary-400">Token Mint Address</p>
                            <div className='p-2 w-full gap-2 flex items-center text-stone-800 rounded-xl bg-sky-300'>
                                <Image
                                    src="/icons/Polygon_token.png"
                                    alt="avatar image"
                                    width={32}
                                    height={32}
                                    className='object-cover object-center w-8 h-8'
                                />
                                <input
                                    type="string"
                                    className="w-full rounded-xl text-sm bg-sky-100 py-3 px-4 placeholder:text-secondary-700 text-stone-800 focus:ring-0 focus:border-0 focus:outline-none"
                                    onChange={(e) => handleMintChange(e.target.value)}
                                    placeholder='Paste your token mint address to revoke authorities.'
                                    value={mintAddress?.toString()}
                                />
                                {/* </p> */}
                            </div>
                        </div>
                        <div className='flex items-center gap-4'>
                            <button
                                className="w-full py-3 px-6 text-[white] text-sm font-semibold text-center rounded-xl bg-primary-200"
                                onClick={clickRevokeMint}
                            >
                                Revoke it
                            </button>
                            <button
                                className="w-full py-3 px-6 text-[white] text-sm font-semibold text-center rounded-xl bg-primary-800"
                                onClick={() => setStep(1)}
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                )
            }
            {
                step == 3 && (
                    <div className="flex flex-col max-w-[480px] w-full bg-sky-200 rounded-xl p-6 gap-8">
                        <div className='flex items-center justify-center'>
                            <div className='text-stone-800 text-2xl font-semibold'>
                                Revoke Freezing Authority
                            </div>
                        </div>
                        <div className='flex flex-col items-center gap-1'>
                            <p className="text-sm text-secondary-400">Token Mint Address</p>
                            <div className='p-2 w-full gap-2 flex items-center text-stone-800 rounded-xl bg-sky-300'>
                                <Image
                                    src="/icons/Polygon_token.png"
                                    alt="token image"
                                    width={32}
                                    height={32}
                                    className='object-cover object-center w-8 h-8'
                                />
                                <p className='truncate w-[90%] text-sm'>
                                    {mintAddress == undefined ? "Token not set" : mintAddress.toString()}
                                </p>
                            </div>
                        </div>
                        <div className='flex items-center gap-4'>
                            <button
                                className="w-full py-3 px-6 text-[white] text-sm font-semibold text-center rounded-xl bg-primary-200"
                                onClick={clickRevokeFreeze}
                            >
                                Confirm
                            </button>
                            <button
                                className="w-full py-3 px-6 text-[white] text-sm font-semibold text-center rounded-xl bg-primary-800"
                                onClick={() => setStep(2)}
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                )
            }
            {
                step == 4 && (
                    <div className="flex flex-col max-w-[480px] w-full bg-sky-200 rounded-xl p-6 gap-6">
                        <div className='flex items-center justify-between'>
                            <div className='text-stone-800 text-2xl font-semibold'>
                                Create The Market
                            </div>
                        </div>
                        <div className='flex flex-col gap-1 items-center'>
                            <p className="text-sm text-secondary-400">Your Wallet Address</p>
                            <div className='p-2 w-full gap-2 flex items-center text-stone-800 rounded-xl bg-sky-300'>
                                <Image
                                    src="/icons/avatar-image.png"
                                    alt="avatar image"
                                    width={32}
                                    height={32}
                                    className='object-cover object-center w-8 h-8'
                                />
                                <p className='truncate w-[90%]'>
                                    {wallet.publicKey?.toBase58()}
                                </p>
                            </div>
                        </div>
                        <div className='flex flex-col gap-1 items-center'>
                            <p className="text-sm text-secondary-400">Token Mint Address</p>
                            <div className='p-2 w-full gap-2 flex items-center text-stone-800 rounded-xl bg-sky-300'>
                                <Image
                                    src="/icons/Polygon_token.png"
                                    alt="token image"
                                    width={32}
                                    height={32}
                                    className='object-cover object-center w-8 h-8'
                                />
                                <p className='truncate w-[90%]'>
                                    {mintAddress == undefined ? "Token not set" : mintAddress.toString()}
                                </p>
                            </div>
                        </div>
                        <div className='flex items-center justify-between'>
                            <div className='text-secondary-400 text-sm font-normal'>
                                Create Market Fee
                            </div>
                            <div className='text-stone-800 font-semibold text-sm'>
                                2.7 Sol
                            </div>
                        </div>
                        <button
                            className="w-full py-3 px-6 text-[white] text-sm font-semibold text-center rounded-xl bg-primary-200"
                            onClick={handleCreateMarket}
                        >
                            Create Market
                        </button>
                    </div>
                )
            }
            {
                step == 5 && (
                    <div className="flex flex-col max-w-[480px] w-full bg-sky-200 rounded-xl p-6 gap-6">
                        <div className='flex items-center justify-between'>
                            <div className='text-stone-800 text-2xl font-semibold'>
                                Add LP
                            </div>
                        </div>
                        <div className='flex flex-col gap-1'>
                            <p className="text-sm text-secondary-400">Wallet Address</p>
                            <div className='p-2 w-full gap-2 flex items-center text-stone-800 rounded-xl bg-sky-300'>
                                <Image
                                    src="/icons/avatar-image.png"
                                    alt="avatar image"
                                    width={32}
                                    height={32}
                                    className='object-cover object-center w-8 h-8'
                                />
                                <p className='truncate w-[90%] text-sm'>
                                    {wallet.publicKey?.toBase58()}
                                </p>
                            </div>
                        </div>
                        <div className='w-full flex flex-col gap-1'>
                            <p className="text-sm text-secondary-400">
                                SOL Amount To Put In Pool
                            </p>
                            <div className='w-full relative'>
                                <input
                                    type="number"
                                    id="sol-balance"
                                    className="w-full rounded-xl text-sm bg-sky-100 py-3 px-4 placeholder:text-secondary-700 text-stone-800 focus:ring-0 focus:border-0 focus:outline-none"
                                    onChange={(e) => handleSolBalanceChange(e.target.value)}
                                    value={solBalance}
                                />
                                <p className='absolute right-4 top-[10px] text-secondary-700'>$sol</p>
                            </div>
                        </div>
                        <div className='w-full flex flex-col gap-1'>
                            <p className="text-sm text-secondary-400">
                                Token Amount To Put In Pool
                            </p>
                            <div className='w-full relative'>
                                <input
                                    type="number"
                                    id="sol-balance"
                                    className="w-full rounded-xl text-sm bg-sky-100 py-3 px-4 placeholder:text-secondary-700 text-stone-800 focus:ring-0 focus:border-0 focus:outline-none"
                                    onChange={(e) => setTokenToPut(parseFloat(e.target.value))}
                                    value={tokenToPut}
                                />
                                <p className='absolute right-4 top-[10px] text-secondary-700'>$sol</p>
                            </div>
                        </div>
                        <button
                            className="w-full py-3 px-6 text-[white] text-sm font-semibold text-center rounded-xl bg-primary-200"
                            onClick={clickAddLiquidity}
                        >
                            Add Liquidity
                        </button>
                    </div>
                )
            }
            
            <div  className="inline-flex">
                <button className="bg-transparent hover:bg-blue-500 text-blue-700 font-semibold hover:text-white py-2 px-4 border border-blue-500 hover:border-transparent rounded-l" onClick={() => setStep(1)}>
                    1
                </button>
                <button className="bg-transparent hover:bg-blue-500 text-blue-700 font-semibold hover:text-white py-2 px-4 border border-blue-500 hover:border-transparent rounded-l" onClick={() => setStep(2)}>
                    2
                </button>
                <button className="bg-transparent hover:bg-blue-500 text-blue-700 font-semibold hover:text-white py-2 px-4 border border-blue-500 hover:border-transparent rounded-l" onClick={() => setStep(3)}>
                    3
                </button>
                <button className="bg-transparent hover:bg-blue-500 text-blue-700 font-semibold hover:text-white py-2 px-4 border border-blue-500 hover:border-transparent rounded-l" onClick={() => setStep(4)}>
                    4
                </button>
                <button className="bg-transparent hover:bg-blue-500 text-blue-700 font-semibold hover:text-white py-2 px-4 border border-blue-500 hover:border-transparent rounded-l" onClick={() => setStep(5)}>
                    5
                </button>
            </div>
            <Snackbar
                open={alertState.open}
                autoHideDuration={6000}
                onClose={() => setAlertState({ ...alertState, open: false })}
            >
                <Alert
                    onClose={() => setAlertState({ ...alertState, open: false })}
                    severity={alertState.severity}
                    className='text-[red]'
                >
                    {alertState.message}
                </Alert>
            </Snackbar>
        </div>
    );
}
