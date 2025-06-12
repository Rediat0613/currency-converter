// components/ConversionHistory.tsx
"use client";

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { format } from 'date-fns';

interface ConversionHistory {
  fromCurrency: string;
  toCurrency: string;
  amount: number;
  convertedAmount: number;
  date: string;
}

export function ConversionHistory({ history }: { history: ConversionHistory[] }) {
  if (history.length === 0) return null;

  return (
    <div className="mt-8">
      <h2 className="text-xl font-semibold mb-4">Recent Conversions</h2>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Date</TableHead>
            <TableHead>From</TableHead>
            <TableHead>To</TableHead>
            <TableHead>Amount</TableHead>
            <TableHead>Result</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {history.map((item, index) => (
            <TableRow key={index}>
              <TableCell>{format(new Date(item.date), 'PPpp')}</TableCell>
              <TableCell>{item.fromCurrency}</TableCell>
              <TableCell>{item.toCurrency}</TableCell>
              <TableCell>{item.amount.toFixed(2)} {item.fromCurrency}</TableCell>
              <TableCell>{item.convertedAmount.toFixed(2)} {item.toCurrency}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}