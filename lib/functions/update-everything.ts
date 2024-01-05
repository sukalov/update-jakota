import getIndexPrices from '@/lib/functions/get-index-prices';
import { initialSteps } from '@/lib/functions/update-currencies-data';
import { db } from '@/lib/db';
import { stocks_info, currencies, adjustments, indicies, dividents, indexprices } from '@/lib/db/schema';
import { eq, isNull } from 'drizzle-orm';
import { indexNames } from '@/lib/constants/index-names.ts';
import { timeout } from '@/lib/functions/utils';
import getIndexHistory2 from '@/lib/functions/get-index-history2';
import { updateMarketCaps } from '@/lib/functions/update-market-caps';
import { CurrenciesPrice, CurrenciesPriceDB, DataAdjustments, DataDividents, DividentsDB, IndexDay, IndexDayDB, StocksInfo, StringDate } from '@/types/data-functions';

export async function updateEverything() {
  await initialSteps();
  let newData = [] as IndexDayDB[];

  const dataSharesOutstanding = (await db.select().from(stocks_info)) as StocksInfo[];
  const dataSharesOutstandingNoDelisted = (await db
    .select()
    .from(stocks_info)
    .where(isNull(stocks_info.is_delisted))) as StocksInfo[];

  const currData = (await db.select().from(currencies)) as CurrenciesPriceDB[];
  const currenciesData: CurrenciesPrice[] = currData.map(day => ({...day, date: day.date.toISOString().slice(0, 10) as StringDate}))
  const dbDataDividents = await db.select().from(dividents) as DividentsDB[];
  const dataDividents = dbDataDividents.reduce((prev: DataDividents, curr: DividentsDB) => {
    const date = curr.date.toISOString().slice(0, 10);
    prev[date] = curr.dividents;
    return prev;
  }, {});

  const dataIndexPrices = await getIndexPrices(dataSharesOutstanding, currenciesData, '2022-12-28');
  await db.delete(indexprices);
  await timeout(1000);
  await db.insert(indexprices).values({ type: 'indexprices', json: dataIndexPrices });

  for (let i = 0; i < indexNames.length; i++) {
    const indexName = indexNames[i];
    const indexAdjustments = await db.select().from(adjustments).where(eq(adjustments.index, indexName)) as DataAdjustments[];

    indexAdjustments.sort(function (a, b) {
      return new Date(b.date).valueOf() + new Date(a.date).valueOf();
    });

    const indexHistory = getIndexHistory2(dataIndexPrices, indexAdjustments, dataDividents, indexName) as IndexDay[];
    const indexHistoryWithDates: IndexDayDB[] = indexHistory.map(day => {
    return {
      name: String(day.name),
      adjustment: new Date(String(day.adjustment)),
      date: new Date(day.date),
      index: Number(day.index),
      total_return: Number(day.total_return)
    }
    })
    newData = [...newData, ...indexHistoryWithDates];
    await db.delete(indicies).where(eq(indicies.name, indexName));
    await db.insert(indicies).values(indexHistoryWithDates);
    console.log({ indexName, status: 'done' });
  }

  await updateMarketCaps(dataSharesOutstandingNoDelisted, dataIndexPrices);
}