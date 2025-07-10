"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import localforage from "localforage";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

export interface ConversionHistory {
  fromCurrency: string;
  toCurrency: string;
  amount: number;
  convertedAmount: number;
  date: string;
}

export function CurrencyConverter() {
  const [amount, setAmount] = useState<number>(1);
  const [fromCurrency, setFromCurrency] = useState<string>("USD");
  const [toCurrency, setToCurrency] = useState<string>("ETB");
  const [convertedAmount, setConvertedAmount] = useState<number>(0);
  const [exchangeRates, setExchangeRates] = useState<Record<string, number>>(
    {}
  );
  const [currencies, setCurrencies] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [history, setHistory] = useState<ConversionHistory[]>([]);

  useEffect(() => {

    // Fetch currencies and exchange rates
    const fetchData = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // Fetch currencies and rates in parallel
        const [currenciesResponse, ratesResponse] = await Promise.all([
          axios.get(`https://openexchangerates.org/api/currencies.json`),
          axios.get(`https://openexchangerates.org/api/latest.json?app_id=${process.env.NEXT_PUBLIC_API_KEY}`  ),
        ]);

        setCurrencies(currenciesResponse.data);
        setExchangeRates({
          ...ratesResponse.data.rates,
          // Add USD with rate 1 if not present (base currency)
          USD: ratesResponse.data.rates.USD || 1,
        });

        setIsLoading(false);
      } catch (err) {
        console.error("API Error:", err);
        setError("Failed to fetch exchange rates. Please try again later.");
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  const convertCurrency = () => {
    if (!exchangeRates[fromCurrency] || !exchangeRates[toCurrency]) {
      setError("Invalid currency selection");
      return;
    }

    try {
      // Convert from the selected currency to USD first (since free plan uses USD as base)
      const amountInUSD = amount / exchangeRates[fromCurrency];
      // Then convert from USD to the target currency
      const result = amountInUSD * exchangeRates[toCurrency];

      setConvertedAmount(parseFloat(result.toFixed(4)));
      setError(null);

      // Save to history
      const newHistoryItem: ConversionHistory = {
        fromCurrency,
        toCurrency,
        amount,
        convertedAmount: result,
        date: new Date().toISOString(),
      };

      const updatedHistory = [newHistoryItem, ...history.slice(0, 9)]; // Keep only last 10 items
      setHistory(updatedHistory);
      localforage.setItem("history", updatedHistory);
    } catch (err) {
      setError("Conversion failed. Please check your inputs.");
      console.error(err);
    }
  };

  const swapCurrencies = () => {
    setFromCurrency(toCurrency);
    setToCurrency(fromCurrency);
    // Auto-convert after swap if we already have a result
    if (convertedAmount) {
      setAmount(convertedAmount);
      convertCurrency();
    }
  };

  if (isLoading)
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardHeader>
          <CardTitle>Currency Converter</CardTitle>
        </CardHeader>
        <CardContent className="text-center py-8">
          <div className="animate-pulse">Loading exchange rates...</div>
        </CardContent>
      </Card>
    );

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>Currency Converter</CardTitle>
      </CardHeader>
      <CardContent>
        {error && (
          <div className="mb-4 p-2 bg-red-100 text-red-700 rounded text-sm">
            {error}
          </div>
        )}

        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="amount">Amount</Label>
              <Input
                id="amount"
                type="number"
                value={amount}
                onChange={(e) => setAmount(parseFloat(e.target.value || "0"))}
                min="0"
                step="0.01"
              />
            </div>
            <div className="space-y-2">
              <Label>Result</Label>
              <Input
                readOnly
                value={convertedAmount.toFixed(4)}
                className="bg-gray-100"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="fromCurrency">From</Label>
              <Select
                value={fromCurrency}
                onValueChange={(value) => {
                  setFromCurrency(value);
                  // Auto-convert when currency changes
                  if (amount > 0) convertCurrency();
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select currency" />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(currencies).map(([code, name]) => (
                    <SelectItem key={code} value={code}>
                      {code} - {name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-end justify-center">
              <Button
                variant="outline"
                onClick={swapCurrencies}
                className="w-full"
                aria-label="Swap currencies"
              >
                ↔ Swap
              </Button>
            </div>

            <div className="space-y-2">
              <Label htmlFor="toCurrency">To</Label>
              <Select
                value={toCurrency}
                onValueChange={(value) => {
                  setToCurrency(value);
                  // Auto-convert when currency changes
                  if (amount > 0) convertCurrency();
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select currency" />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(currencies).map(([code, name]) => (
                    <SelectItem key={code} value={code}>
                      {code} - {name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <Button
            onClick={convertCurrency}
            className="w-full"
            disabled={isLoading || amount <= 0}
          >
            {isLoading ? "Loading..." : "Convert"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
