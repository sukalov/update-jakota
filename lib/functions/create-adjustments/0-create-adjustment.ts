import { IndexName, indexNames } from '@/lib/constants/index-names';
import { adjustments, stocks_info } from '@/lib/db/schema';
import { db } from '@/lib/db';
import { sql } from 'drizzle-orm';
import { DataPrices, StocksInfo, StocksInfoExtended, StringDate } from '@/types/data-functions';
import filterByMarketCap from '@/lib/functions/create-adjustments/1-filter-by-market-cap';
import selectStocksPrices from '@/lib/functions/create-adjustments/2-select-stocks-prices';
import makeFinalAdjustment from '@/lib/functions/create-adjustments/3-make-final-adjustment';

export default async function createAdjustment(dataIndexPrices: DataPrices[], indexName: IndexName, date: StringDate, newVolume?: number) {
  let stocksInfo: StocksInfo[];
  if (indexName !== 'blue-chips-150' && indexName !== 'mid-small-cap-2000') {
    stocksInfo = (await db
      .select()
      .from(stocks_info)
      .where(sql`JSON_SEARCH(${stocks_info.indicies}, 'one', ${indexName}) IS NOT NULL;`)) as StocksInfo[];
  } else {
    stocksInfo = (await db.select().from(stocks_info)) as StocksInfo[];
  }

  const selectedStocksPrices = (await selectStocksPrices(dataIndexPrices, stocksInfo, indexName, date)) as DataPrices;
  const filteredMarketCaps = filterByMarketCap(selectedStocksPrices, stocksInfo, indexName) as StocksInfoExtended[];
  const finalAdjustment = makeFinalAdjustment(filteredMarketCaps, indexName, date);

  return finalAdjustment;
};