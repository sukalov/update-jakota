import { eod } from '@/lib/functions/get-from-eod';
import toUSD from '@/lib/functions/translate-to-usd';
import { getInitialIndexDates, addMissingValues, timeout } from '@/lib/functions/utils';
import { CurrenciesPrice, DataPrices, ResponseHistorical, StocksInfo, StringDate } from '@/types/data-functions';

export default async function getIndexPrices(
  data: StocksInfo[],
  currenciesData: CurrenciesPrice[],
  startDate: StringDate
): Promise<DataPrices[]> {
  let resData: DataPrices[] = [];
  try {
    const batchSize = 50;
    const requests = [];
    const result: ResponseHistorical[][] = [];

    for (let i = 0; i < data.length; i += batchSize) {
      await timeout(1900);
      const batch = data.slice(i, i + batchSize);
      const batchRequests = batch.map((stock) => eod.historicalAsync(stock.symbol, startDate));
      requests.push(batchRequests);
      console.log('1/6. requests', i, 'of', data.length);
    }

    let counter = 1;
    for (const batchRequests of requests) {
      await timeout(800);
      const batchResponses = await Promise.all(batchRequests);
      const errors = batchResponses.filter((response) => !response.ok);

      if (errors.length > 0) {
        throw errors.map((response) => Error(response.statusText));
      }

      const batchJson = batchResponses.map((response) => response.json());
      const batchResult = (await Promise.all(batchJson)) as ResponseHistorical[][];
      result.push(...batchResult);
      console.log('2/6. parse responses', counter, ' of ', requests.length);
      counter += 1;
    }

    const indexHistory = getInitialIndexDates(startDate) as { date: StringDate }[];

    currenciesData.forEach((cur) => {
      const i = indexHistory.findIndex((day) => day.date === cur.date);
      indexHistory[i] = cur;
    });

    console.log('3/6');

    result.forEach((stockHistory: ResponseHistorical[], i: number) => {
      stockHistory.forEach((day) => {
        const destinationIndex = indexHistory.findIndex((row) => row.date === day.date);
        indexHistory[destinationIndex] = {
          ...indexHistory[destinationIndex],
          date: indexHistory[destinationIndex]!.date,
          [String(data[i]?.symbol)]: day.adjusted_close,
        };
      });
    });
    console.log('4/6');

    const completeData = addMissingValues(indexHistory) as DataPrices[];

    console.log('5/6');

    completeData.forEach((day: DataPrices, i: number) => {
      data.forEach((stock: StocksInfo) => {
        day[stock.symbol] = toUSD(Number(day[stock.symbol]), stock.currency, day.date, currenciesData);
      });
    });

    console.log('completed with collecting and parcing EOD data.');

    resData = completeData;
    return completeData;
  } catch (error) {
    console.error(error);
  }
  return resData;
}
