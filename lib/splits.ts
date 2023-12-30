import { inArray, isNull } from "drizzle-orm";
import { db } from "./db";
import { stocks_info } from "./db/schema";
import getSplits from "./functions/get-splits";
import { getArgs } from "./functions/utils";
import { eod } from "./functions/get-from-eod";
import { csv } from "./functions/read-write-csv";

interface StocksInfoExtended extends StocksInfo {
    shares_modern?: number
}

const process = getArgs();
const startDate = String(process.start) || '2022-12-28'

const dataSharesOutstandingNoDelisted = (await db
    .select()
    .from(stocks_info)
    .where(isNull(stocks_info.is_delisted))
    ) as StocksInfo[];

const splits = await getSplits(dataSharesOutstandingNoDelisted, startDate) as [{symbol: string}];
const stocksForCheck: Array<string> = splits.map((el: {symbol: string}) => el.symbol)
const stocksWithSplits = await db.select().from(stocks_info).where(inArray(stocks_info.symbol, stocksForCheck)) as StocksInfoExtended[]

for (let i = 0; i < stocksWithSplits.length; i++) {
    const element = stocksWithSplits[i];
    const stockData = await eod.fundamental(element.symbol)
    const sharesOutstandingModern = stockData.SharesStats.SharesOutstanding
    stocksWithSplits[i].shares_modern = sharesOutstandingModern
}

await csv.write('stocks_with_splits', stocksWithSplits);
console.log ('table with splitted stocks is ready at \x1b[34m lib/data/stocks_with_splits \x1b[0m')

