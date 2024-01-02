import getIndexPrices from '@/lib/functions/get-index-prices';
import { initialSteps } from '@/lib/functions/update-currencies-data';
import { db } from '@/lib/db';
import { stocks_info, currencies, adjustments, indicies, dividents, indexprices } from '@/lib/db/schema';
import { eq, isNull } from 'drizzle-orm';
import { indexNames } from '@/lib/constants/index-names.ts';
import getIndexHistory2 from '@/lib/functions/get-index-history2';
import { updateMarketCaps } from '@/lib/functions/update-market-caps';
import { CurrenciesPrice, DataDividents, StocksInfo } from '@/types/data-functions';

export async function repeatUpdateEverything() {
  await initialSteps();
  let newData = [] as any[];
  const dataSharesOutstandingNoDelisted = (await db
    .select()
    .from(stocks_info)
    .where(isNull(stocks_info.is_delisted))) as StocksInfo[];

  const currData = (await db.select().from(currencies)) as CurrenciesPrice[];
  const dbDataDividents = await db.select().from(dividents);
  const dataDividents = dbDataDividents.reduce((prev: DataDividents, curr: any) => {
    const date = curr.date.toISOString().slice(0, 10);
    prev[date] = curr.dividents;
    return prev;
  }, {});

  const dataIndexPricesDB = await db.select().from(indexprices);
  const dataIndexPrices = dataIndexPricesDB[0]?.json as any[];

  for (let i = 0; i < indexNames.length; i++) {
    const indexName = String(indexNames[i]);
    const indexAdjustments = await db.select().from(adjustments).where(eq(adjustments.index, indexName));

    indexAdjustments.sort(function (a, b) {
      return new Date(b.date).valueOf() + new Date(a.date).valueOf();
    });

    const indexHistory = getIndexHistory2(dataIndexPrices, indexAdjustments, dataDividents, indexName) as any[];
    newData = [...newData, ...indexHistory];
    await db.delete(indicies).where(eq(indicies.name, indexName));
    await db.insert(indicies).values(indexHistory);
    console.log({ indexName, status: 'done' });
  }

  await updateMarketCaps(dataSharesOutstandingNoDelisted, dataIndexPrices);
}
