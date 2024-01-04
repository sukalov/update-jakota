import { inArray, isNull } from 'drizzle-orm';
import { db } from '@/lib/db';
import { stocks_info } from '@/lib/db/schema';
import getSplits from '@/lib/functions/get-splits';
import { getArgs } from '@/lib/functions/utils';
import { eod } from '@/lib/functions/get-from-eod';
import { csv } from '@/lib/functions/read-write-csv';
import { StocksInfo, StringDate } from '@/types/data-functions';

interface StocksInfoExtended extends StocksInfo {
  shares_modern?: number;
}

const process = getArgs();
const stringDateRegEx = /^(?:\d{4}-(?:0[1-9]|1[0-2])-(?:0[1-9]|[12]\d|3[01]))$/;
let startDate: StringDate;

if (String(process.start).match(stringDateRegEx)) {
  startDate = process.start as StringDate;
} else throw new Error(`${process.date} is not a valid date.`);

const dataSharesOutstandingNoDelisted = (await db
  .select()
  .from(stocks_info)
  .where(isNull(stocks_info.is_delisted))) as StocksInfo[];

const splits = (await getSplits(dataSharesOutstandingNoDelisted, startDate)) as [{ symbol: string }];
const stocksForCheck: Array<string> = splits.map((el: { symbol: string }) => el.symbol);
const stocksWithSplits = (await db
  .select()
  .from(stocks_info)
  .where(inArray(stocks_info.symbol, stocksForCheck))) as StocksInfoExtended[];

for (let i = 0; i < stocksWithSplits.length; i++) {
  const element = stocksWithSplits[i];
  const stockData = await eod.fundamental(element.symbol);
  const sharesOutstandingModern = stockData.SharesStats.SharesOutstanding;
  stocksWithSplits[i].shares_modern = sharesOutstandingModern;
}

await csv.write('stocks_with_splits', stocksWithSplits);
console.log('table with splitted stocks is ready at \x1b[34m lib/data/stocks_with_splits \x1b[0m');
