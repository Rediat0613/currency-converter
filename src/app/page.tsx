'use client'
import { CurrencyConverter } from "@/app/_component/CurrencyConverter";
import { ConversionHistory } from "@/app/_component/ConversionHistory";
import localforage from "localforage";
import { ConversionHistory as ConversionHistoryType } from "@/app/_component/CurrencyConverter";
import { useState , useEffect } from "react";

export default function Home() {
  const [history, setHistory] = useState<ConversionHistoryType[]>([]);
  useEffect( () => {
    localforage.config({
      name: "currencyConverter",
      storeName: "conversionHistory",
    });
    localforage.getItem<ConversionHistoryType[]>("history").then((savedHistory) => {
      if (savedHistory) {
        setHistory(savedHistory);
      }
    });
  });

  return (
    <main className="container mx-auto py-8 px-4">
      <div className="flex flex-col items-center">
        <h1 className="text-3xl font-bold mb-8">Currency Converter</h1>
        <CurrencyConverter />
        <ConversionHistory history={history} />
      </div>
    </main>
  );
}
