// app/page.tsx
import { CurrencyConverter } from "@/app/_component/CurrencyConverter";
import { ConversionHistory } from "@/app/_component/ConversionHistory";

export default function Home() {
  return (
    <main className="container mx-auto py-8 px-4">
      <div className="flex flex-col items-center">
        <h1 className="text-3xl font-bold mb-8">Currency Converter</h1>
        <CurrencyConverter />
        <ConversionHistory history={[]} />
      </div>
    </main>
  );
}
