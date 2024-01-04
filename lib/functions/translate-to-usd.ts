import { CurrenciesPrice, StringDate } from '@/types/data-functions';

export default function toUSD(
  price: number,
  currencyName: 'TWD' | 'JPY' | 'USD' | 'KRW',
  date: StringDate,
  currencies: CurrenciesPrice[]
) {
  if (currencyName === 'USD') return price;
  const index = currencies.findIndex((day) => date === new Date(day.date).toISOString().slice(0, 10));
  const neededExchange = currencies[index][currencyName];
  const priceUSD = price / neededExchange;
  return priceUSD;
}
