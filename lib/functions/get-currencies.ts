import { db } from '@/lib/db';
import { eod } from '@/lib/functions/get-from-eod';
import { addMissingValues, getInitialIndexDates } from '@/lib/functions/utils';
import { currencies } from '@/lib/db/schema';
import { sql } from 'drizzle-orm';
import { CurrenciesPrice, CurrenciesPriceDB, ResponseHistorical, StringDate } from '@/types/data-functions';

export default async function getCurrenencyPrices(startDate: StringDate = '2022-12-28') {
  const currenciesToCollect: Array<'KRW' | 'JPY' | 'TWD'> = ['KRW', 'JPY', 'TWD'];
  try {
    const requests = currenciesToCollect.map((stock) => eod.historicalAsync(`${stock}.FOREX`, startDate));
    const responses = await Promise.all(requests);
    const errors = responses.filter((response: Response) => !response.ok);

    if (errors.length > 0) {
      throw errors.map((response: Response) => Error(response.statusText));
    }
    const json = responses.map((response: Response) => response.json());
    const result = (await Promise.all(json)) as Array<ResponseHistorical[]>;

    const newData: CurrenciesPrice[] = [];

    result.forEach((data, i) => {
      data.forEach((day) => {
        let defaultPrices = {
          KRW: 1,
          JPY: 1,
          TWD: 1,
        };
        const currencyName = currenciesToCollect[i];
        if (i === 0) {
          newData.push({
            ...defaultPrices,
            date: day.date,
            [currencyName]: Number(day.adjusted_close.toFixed(2)),
          });
        } else {
          const destinationIndex = newData.findIndex((NDday) => NDday.date === day.date);
          newData[destinationIndex] = {
            ...newData[destinationIndex],
            [currencyName]: Number(day.adjusted_close.toFixed(2)),
          };
        }
      });
    });

    const indexHistory = getInitialIndexDates(startDate) as CurrenciesPrice[];
    newData.forEach((cur) => {
      const i = indexHistory.findIndex((day) => day.date === cur.date);
      indexHistory[i] = cur;
    });

    let newData2 = addMissingValues(indexHistory) as CurrenciesPriceDB[];
    newData2.forEach((day) => (day.date = new Date(day.date)));

    await db.delete(currencies);
    await db
      .insert(currencies)
      .values(newData2)
      .onDuplicateKeyUpdate({ set: { date: sql`date` } });

    return newData2;
  } catch (error) {
    console.error(error);
  }
}
