import React, { useState } from "react";
import { Tab } from "./CheckoutComponent";
import { BiLeftArrowAlt, BiSearchAlt } from "react-icons/bi";
import Image from "next/image";
import { tokens as testTokens } from "@/lib/data";
import { Token } from "@/lib/types";

interface SelectTokenProps {
  setActiveTab: (value: Tab) => void;
  setToken?: (value: Token) => void;
}

export const SelectToken = ({ setActiveTab, setToken }: SelectTokenProps) => {
  const [tokens, setTokens] = useState<Token[]>(testTokens);
  const [searchInput, setSearchInput] = useState<string>("");

  const searchToken = (value: string) => {
    setSearchInput(value);
    setTokens(
      testTokens.filter(
        (token) =>
          token.address.includes(value) ||
          token.name.includes(value.toUpperCase()) ||
          token.symbol.includes(value.toUpperCase())
      )
    );
  };

  const selectUserToken = (token: Token) => {
    if (setToken) setToken(token);
    setActiveTab("DEFAULT");
  };
  return (
    <>
      <div className="pay-with-header mt-3 mb-4">
        <BiLeftArrowAlt
          size={30}
          className="mr-auto"
          onClick={() => setActiveTab("DEFAULT")}
          style={{ cursor: "pointer" }}
        />
        <span className="mr-auto text-muted">Pay with</span>
      </div>
      <div className="text-center text-[#a8acc3]">Select Network</div>
      <div className="network-options mb-4">
        <div className="network active">
          <Image
            src={"/assets/tokens/trx.svg"}
            className="network-image"
            alt="token"
            width={100}
            height={100}
          />
        </div>
      </div>
      <div className="search-form">
        <input
          type="text"
          placeholder="Enter token name or address"
          value={searchInput}
          onChange={(event) => searchToken(event.target.value)}
        />
        <BiSearchAlt size={30} />
      </div>
      <div className="tokens-list mt-8">
        {tokens.map((token, i) => (
          <div
            className="token-details"
            key={i}
            onClick={() => selectUserToken(token)}
          >
            <Image
              src={token.imageUrl}
              className="token-image"
              alt="token"
              width={100}
              height={100}
            />
            <div className="w-full">
              <div className="token-symbol">{token.symbol}</div>
              <div className="token-name">{token.name.toUpperCase()}</div>
            </div>
          </div>
        ))}
      </div>
    </>
  );
};
