import React from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { RiWallet2Fill } from "react-icons/ri";
import {
  SelectTokenChainCard,
  TokenSwapCard,
  WalletAddressCard,
} from "../components/TokenSwapCard";

const Page = () => {
  return (
    <main className="m-3">
      <div className="checkout-container text-secondary">
        <div className="checkout-header font-headings">
          <Image
            className="logo"
            src={"/assets/logo.jpg"}
            width={100}
            height={100}
            alt="Logo"
          />
          <span>Pay with heekowave</span>
        </div>
        <div className="checkout-card">
          <div className="checkout-card__header">
            <Button className="btn-secondary p-0 transparent ml-auto">
              <span className="mr-1">Connect Wallet</span>{" "}
              <RiWallet2Fill size={18} />
            </Button>
            <h3 className="title">Checkout</h3>
          </div>
          <div className="checkout-card__body">
            <TokenSwapCard network={"Tron"} token={"DASH"} amount={30000} />
            {/* <TokenSwapCard
              network={"Tron"}
              token={"DASH"}
              amount={30000}
              isPayCard
            /> */}
            <SelectTokenChainCard />
            <WalletAddressCard network={"Tron"} token={"DASH"} />
            <Button className="btn-primary bg-secondary text-black uppercase w-full hover:bg-black hover:text-secondary">
              <span className="mr-3">Connect Wallet</span>
              <RiWallet2Fill size={18} />
            </Button>
          </div>
          <div className="checkout-card__footer"></div>
        </div>
      </div>
    </main>
  );
};

export default Page;
