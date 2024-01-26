"use client";
import { useState, useRef } from "react";
import { PublicKey } from "@solana/web3.js";
import { createSPLToken } from "@/contexts/createSPLToken";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { toMetaplexFileFromBrowser } from "@metaplex-foundation/js";
import { createMarket } from "@/contexts/createMarket";
import { revokeMintAuthority } from "@/contexts/revokeMintAuthority";
import { revokeFreezeAuthority } from "@/contexts/revokeFreezeAuthority";
import { createLiquidity } from "@/contexts/createLiquidity";
import ConnectButton from "@/components/ConnectButton";

export default function Home() {
  const wallet = useWallet();
  const { connection } = useConnection();
  const [tokenName, setTokenName] = useState("");
  const [tokenSymbol, setTokenSymbol] = useState("");
  const [tokenLogo, setTokenLogo] = useState<File | null>();
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [tokenDecimal, setTokenDecimal] = useState(9);
  const [tokenBalance, setTokenBalance] = useState(0);
  const [solBalance, setSolBalance] = useState("0");
  const [mint, setMint] = useState<PublicKey | null>(null);
  const [marketId, setMarketId ] = useState<PublicKey | null>(null);
  const [tokenToPut, setTokenToPut] = useState(0);

  const handleCreateToken = async () => {
    if (
      tokenName != "" &&
      tokenSymbol != "" &&
      tokenLogo != null &&
      tokenBalance != 0
    ) {
      if (!wallet.publicKey) {
        console.log("Wallet not connected");
        return;
      }
      const _file = await toMetaplexFileFromBrowser(tokenLogo);
      console.log("file ====>", _file);
      console.log("wallet publicKey ===>", wallet.publicKey, wallet);
      console.log("connection ===>", connection);
      console.log("tokenBalance ===>", tokenBalance);
      console.log("tokenName ===>", tokenName);
      console.log("tokenSymbol ===>", tokenSymbol);
      await createSPLToken(wallet.publicKey, wallet, connection, tokenBalance, tokenDecimal, true, tokenName, tokenSymbol, "", "", _file, "string")
    } else {
      console.log("invalid params");
      return;
    }
  };

  const clickRevokeMint = async () => {
    if(mint == null) {
      console.log("Mint incorrect");
      return;
    }
    if (wallet.publicKey == null) {
      console.log("wallet is not configured");
      return;
    }

    console.log("revoke mint :mint ===>", mint.toBase58())
    console.log("Transaction in progress");
    await revokeMintAuthority(connection, wallet, mint);
    console.log("Success");
  };

  const clickRevokeFreeze = async () => {
    if(mint == null) {
      console.log("Mint incorrect");
      return;
    }
    console.log("revoke freeze: mint ==>", mint.toBase58());
    console.log("Transaction in progress");
    await revokeFreezeAuthority(connection, wallet, mint);
    console.log("Success");
  };

  const handleCreateMarket = async () => {
    if(mint == null) {
      console.log("Mint incorrect");
      return;
    }
    const quoteMint = new PublicKey("So11111111111111111111111111111111111111112");
    const quoteDecimal = 9;
    const orderSize = 1;
    const tickSize = 0.01;
    const  madeMarketId = await createMarket(connection, wallet, mint, tokenDecimal, quoteMint, quoteDecimal, orderSize, tickSize);
    setMarketId(madeMarketId);
    console.log("Created market id ====>", madeMarketId?.toString());
    console.log("Success");
  };

  const clickAddLiquidity = async () => {
    if (marketId == undefined) {
      console.log("marketId is not set");
      return;
    }
    console.log("Liquidity marketId ====>", marketId);
    const baseDecimal = tokenDecimal;
    const quoteMint = new PublicKey(
      "So11111111111111111111111111111111111111112"
    );
    const quoteDecimal = 9;
    const orderSize = 1;
    const tickSize = 0.01;
    
    if(mint == null) {
      console.log("Mint incorrect");
      return;
    }
    console.log("mintaddress ==>", mint.toBase58());
    console.log("solbalance ===>", parseFloat(solBalance));
    console.log("Transaction in progress");
    let lpMint = await createLiquidity(
      connection,
      wallet,
      mint,
      baseDecimal,
      quoteMint,
      quoteDecimal,
      orderSize,
      tickSize,
      marketId,
      tokenToPut,
      parseFloat(solBalance)
    );
    console.log("LP mint successfully received", lpMint?.toString());
    console.log("Success")
  };
  const handleNameChange = (value: string) => {
    setTokenName(value);
  };
  const handleSymbolChange = (value: string) => {
    setTokenSymbol(value);
  };
  const handleLogoFileChange = (files: FileList | null) => {
    if (files) {
      setTokenLogo(files[0]);
      if (files[0]) {
        const imageUrls = Object.values(files).map((file) =>
          URL.createObjectURL(file)
        );
        setImageUrl(imageUrls[0]);
      }
    } else {
      setImageUrl("");
      setTokenLogo(null);
    }
  };
  const handleDecimalChange = (value: string) => {
    setTokenDecimal(parseInt(value));
  };
  const handleBalanceChange = (value: string) => {
    setTokenBalance(parseInt(value));
  };
  const handleSolBalanceChange = (value: string) => {
    setSolBalance(value);
  };
  const handleMintAddress = (value: string) => {
    if(value.length == 44) {
      setMint(new PublicKey(value));
      console.log("Mint address set, ", value);
    }
  };
  const handleTokenToPut = (value: number) => {
    setTokenToPut(value);
  }

  const fileInputRef = useRef<HTMLInputElement>(null);
  const handleBig = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };
  return (
    <div style={{ padding: 50 }}>
      <ConnectButton />
      <div>
        <div className = "unit-box">
          <b>Create Token</b>
          <p>Name</p>
          <input
            placeholder="Token Name"
            onChange={(e) => handleNameChange(e.target.value)}
            value={tokenName}
          />
          <p>Symbol</p>
          <input
            placeholder="Token Symbol"
            onChange={(e) => handleSymbolChange(e.target.value)}
            value={tokenSymbol}
          />
          <p>Token Logo</p>
          <div>
            <button onClick={handleBig}>
              Upload File
              <input
                type="file"
                accept="image/png, image/jpeg"
                ref={fileInputRef}
                style={{ display: "none" }}
                onChange={(e) => handleLogoFileChange(e.target.files)}
              />
            </button>
            {imageUrl && (
              <div>
                <img src={imageUrl} alt="fox" />
              </div>
            )}
          </div>
          <div>
            <p>Decimal</p>
            <input
              type="number"
              onChange={(e) => handleDecimalChange(e.target.value)}
              value={tokenDecimal}
              disabled
            />
            <p>Token to Mint</p>
            <input
              type="number"
              onChange={(e) => handleBalanceChange(e.target.value)}
              value={tokenBalance}
            />
          </div>
          <div>Create Token Fee</div>
          <button onClick={handleCreateToken}>Create</button>
        </div>
        <div style={{ border: "1px solid #3333", padding: 10 }}>
          <b style={{paddingRight: 20}}>Input token mint address here</b>
          <input
            type="text"
            value={mint?.toString()}
            onChange={(e) => handleMintAddress(e.target.value)}
          />
        </div>
        <div className = "unit-box">
          <b style={{marginRight: 10}}>Revoke Mint Authority</b>
          <button onClick={clickRevokeMint}>Revoke it</button>
        </div>

        <div className = "unit-box">
          <div>Revoke Freezing Authority</div>
          <button onClick={clickRevokeFreeze}>Confirm</button>
        </div>

        <div className = "unit-box">
          <div>Create The Market</div>
          <button onClick={handleCreateMarket}>Create Market</button>
        </div>

        <div className = "unit-box">
          <h3>Add Liquidity Pool</h3>

          <div>
            <p>SOL amount</p>
            <input
              type="number"
              id="sol-balance"
              onChange={(e) => handleSolBalanceChange(e.target.value)}
              value={solBalance}
            />
            <span>SOL</span>
            <div>
            <p>Token amount</p>
            <input
            onChange={(e) => setTokenToPut(Number(e.target.value))}
            value={tokenSymbol}
          />
          </div>
          </div>
          <button onClick={clickAddLiquidity}>Add Liquidity</button>
        </div>

      </div>
    </div>
  );
}
