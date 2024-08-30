import React from "react";
import Image from "next/image";
import { Tab } from "./CheckoutComponent";
import { Token } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { contractAddress } from "@/lib/data";

interface Props {
  network: string;
  token: Token;
  amount: number;
  isPayCard?: boolean;
  setActiveTab?: (value: Tab) => void;
}

interface WalletAddressCardProps {
  network: string;
  token: Token;
}

interface SelectTokenChainCardProps {
  setActiveTab: (value: Tab) => void;
}

export const TokenSwapCard = ({
  network,
  token,
  amount,
  isPayCard,
  setActiveTab,
}: Props) => {
  return (
    <div className="token-swap-card my-3">
      {isPayCard && <h4>You pay</h4>}
      <div className="swap-area pb-3">
        <span className="token-swap__amount">{amount}</span>
        <div className="token-swap__details">
          <div className="token-image-details">
            <Image
              src={token.imageUrl}
              className="token-image"
              alt="token"
              width={40}
              height={40}
            />
            <Image
              src={"/assets/tokens/trx.svg"}
              className="network-image"
              alt="token"
              width={20}
              height={20}
            />
          </div>
          <div className="token-name-details">
            <div className="token-name">{token.name}</div>
            <div className="network-name">on {network}</div>
          </div>
        </div>
      </div>
      <div className="fiat-area flex justify-between items-center pt-3">
        <span>
          ${100 * 0.159} USDT on {network}
        </span>
        {isPayCard && (
          <Button
            className="btn-secondary p-0 change-token-btn"
            style={{ padding: "8px 12px", borderRadius: "17px" }}
            onClick={() => setActiveTab && setActiveTab("SELECT_TOKEN")}
          >
            <span className="mr-1">Change token | chain</span>
          </Button>
        )}
      </div>
    </div>
  );
};

export const SelectTokenChainCard = ({
  setActiveTab,
}: SelectTokenChainCardProps) => {
  return (
    <div
      className="token-swap-card my-3 select-token"
      onClick={() => setActiveTab("SELECT_TOKEN")}
    >
      <h4>You pay</h4>
      <div className="swap-area empty pb-3">
        <span className="token-swap__text">Select chain/ token</span>
      </div>
      <div className="fiat-area pt-3">
        {/* <span>$35,652 USDT on {network}</span> */}
      </div>
    </div>
  );
};

export const WalletAddressCard = ({
  network,
  token,
}: WalletAddressCardProps) => {
  return (
    <div className="token-swap-card my-3">
      <h4>Send to wallet address</h4>
      <div className="swap-area pb-3">
        <span className="token-swap__amount">{`${contractAddress.substring(
          0,
          5
        )}...${contractAddress.substring(30)}`}</span>
        <div className="token-swap__details">
          <div className="token-image-details">
            <Image
              src={token.imageUrl}
              className="token-image"
              alt="token"
              width={40}
              height={40}
            />
            <Image
              src={"/assets/tokens/trx.svg"}
              className="network-image"
              alt="token"
              width={20}
              height={20}
            />
          </div>
          <div className="token-name-details">
            <div className="token-name">{token.name}</div>
            <div className="network-name">on {network}</div>
          </div>
        </div>
      </div>
      {/* <div className="fiat-area pt-3">
        <span>$35,652 USDT on {network}</span>
      </div> */}
    </div>
  );
};
