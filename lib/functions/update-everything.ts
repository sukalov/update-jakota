import getIndexPrices from './get-index-prices';
import { initialSteps } from './update-currencies-data';
import { db } from '../db';
import { stocks_info, currencies, adjustments, indicies, dividents, indexprices } from '../db/schema';
import { eq, isNull} from 'drizzle-orm';
// import { capIndexNames as indexNames} from '@/lib/cap-index-names';
import { indexNames } from '../index-names';
import { timeout } from './utils';
import getIndexHistory2 from './get-index-history2';
import { updateMarketCaps } from './update-market-caps';

export async function updateEverything() {
  await initialSteps();
  // const last_date = await db
  //   .select()
  //   .from(currencies)
  //   .orderBy(sql`${currencies.date} desc limit 7`);
  // let a = [];
  const today = new Date();
  let newData = [] as any[];

  const dataSharesOutstanding = (await db
    .select()
    .from(stocks_info)
    ) as StocksInfo[];
    const dataSharesOutstandingNoDelisted = (await db
      .select()
      .from(stocks_info)
      .where(isNull(stocks_info.is_delisted))
      ) as StocksInfo[];


  const currData = (await db.select().from(currencies)) as CurrenciesPrice[];
  const dbDataDividents = await db.select().from(dividents);
  const dataDividents = dbDataDividents.reduce((prev: DataDividents, curr: any) => {
    const date = curr.date.toISOString().slice(0, 10);
    prev[date] = curr.dividents;
    return prev;
  }, {});

  const dataIndexPrices = await getIndexPrices(dataSharesOutstanding, currData, '2022-12-28');
  await db.delete(indexprices) //.where(eq(indexprices.type, 'indexprices'))
  await timeout(1000)
  await db.insert(indexprices).values({type: 'indexprices', json: dataIndexPrices})

  // const dataIndexPricesDB = await db.select().from(indexprices)
  // const dataIndexPrices = dataIndexPricesDB[0]?.json as any[]
  // await db.delete(indicies)

  
  for (let i = 0; i < indexNames.length; i++) {
    const indexName = String(indexNames[i]);
    const oldAdjustments = await db
      .select()
      .from(adjustments)
      .where(eq(adjustments.index, indexName))

    oldAdjustments.sort(function(a,b){
      return new Date(b.date) + new Date(a.date);
    });

    const indexHistory = getIndexHistory2(dataIndexPrices, oldAdjustments, dataDividents, indexName) as any[];
    newData = [...newData, ...indexHistory];
    await db.delete(indicies).where(eq(indicies.name, indexName));
    await db.insert(indicies).values(indexHistory);
    console.log({indexName, status: 'done'})
  }

  // await updateMarketCaps(dataSharesOutstandingNoDelisted, dataIndexPrices);

};
