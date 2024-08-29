import React from "react";
import { Tab } from "./CheckoutComponent";
import { BiLeftArrowAlt, BiSearchAlt } from "react-icons/bi";
import Image from "next/image";

interface SelectTokenProps {
  setActiveTab: (value: Tab) => void;
}

export const SelectToken = ({ setActiveTab }: SelectTokenProps) => {
  return (
    <>
      <div
        className="pay-with-header mt-3 mb-4"
        onClick={() => setActiveTab("DEFAULT")}
      >
        <BiLeftArrowAlt size={30} />
        <span>Pay with</span>
        <span></span>
      </div>
      <div className="network-options mb-4">
        <div className="network">
          <Image
            src={"/assets/dash.svg"}
            className="network-image"
            alt="token"
            width={100}
            height={100}
          />
        </div>
      </div>
      <div className="search-form">
        <input type="text" placeholder="Enter token name or address" />
        <BiSearchAlt size={30} />
      </div>
      <div className="tokens-list mt-8">
        <div className="token-details">
          <Image
            src={"/assets/dash.svg"}
            className="token-image"
            alt="token"
            width={100}
            height={100}
          />
          <div className="w-full">
            <div className="token-symbol">DASH</div>
            <div className="token-name">TrueDash</div>
          </div>
        </div>
        <div className="token-details">
          <Image
            src={"/assets/trx.svg"}
            className="token-image"
            alt="token"
            width={100}
            height={100}
          />
          <div className="w-full">
            <div className="token-symbol">DASH</div>
            <div className="token-name">TrueDash</div>
          </div>
        </div>
        <div className="token-details">
          <Image
            src={"/assets/eth.svg"}
            className="token-image"
            alt="token"
            width={100}
            height={100}
          />
          <div className="w-full">
            <div className="token-symbol">DASH</div>
            <div className="token-name">TrueDash</div>
          </div>
        </div>
        <div className="token-details">
          <Image
            src={"/assets/dash.svg"}
            className="token-image"
            alt="token"
            width={100}
            height={100}
          />
          <div className="w-full">
            <div className="token-symbol">DASH</div>
            <div className="token-name">TrueDash</div>
          </div>
        </div>
        <div className="token-details">
          <Image
            src={"/assets/trx.svg"}
            className="token-image"
            alt="token"
            width={100}
            height={100}
          />
          <div className="w-full">
            <div className="token-symbol">DASH</div>
            <div className="token-name">TrueDash</div>
          </div>
        </div>
        <div className="token-details">
          <Image
            src={"/assets/eth.svg"}
            className="token-image"
            alt="token"
            width={100}
            height={100}
          />
          <div className="w-full">
            <div className="token-symbol">DASH</div>
            <div className="token-name">TrueDash</div>
          </div>
        </div>
      </div>
    </>
  );
};
