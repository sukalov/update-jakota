import { IndexName } from "@/lib/constants/index-names";
import { DataAdjustments, StocksInfoExtended, StringDate } from "@/types/data-functions";

export default function makeFinalAdjustment (
    stocksInfoFiltered: StocksInfoExtended[],
    indexName: IndexName,
    date: StringDate
) {

const totalMarketCap: number = stocksInfoFiltered.reduce((acc: number, current: StocksInfoExtended) => {
      if (current.market_cap) return acc + current.market_cap;
      else return acc;
    }, 0);

    stocksInfoFiltered.forEach((stock: StocksInfoExtended, i: number) => {
      stock.share = stock.market_cap / totalMarketCap;
      stock.share_adj = stock.market_cap / totalMarketCap;
    });

    const stocksInfoFilteredCopy = JSON.parse(JSON.stringify(stocksInfoFiltered)) as StocksInfoExtended[];
    let remainingSUM = totalMarketCap;
    stocksInfoFiltered.forEach((stock: StocksInfoExtended, i: number) => {
      if (stock.share > 0.1) {
        stock.share_adj = 0.1;
        const remains = stock.market_cap - totalMarketCap / 10; // то что надо раскидать по всем оставшимся акциям
        remainingSUM -= stock.market_cap;
        stock.market_cap = totalMarketCap / 10;
        stocksInfoFiltered.forEach((el: StocksInfoExtended, j: number) => {
          if (j > i) {
            const addition = (el.market_cap / remainingSUM) * remains;
            el.market_cap = el.market_cap + addition;
            el.share = el.market_cap / totalMarketCap;
          }
        });
        remainingSUM = remainingSUM + remains;
      } else {
        stock.share_adj = stock.share;
      }
    });

    stocksInfoFiltered.forEach((stock: StocksInfoExtended, i: number) => {
      stock.market_cap = stocksInfoFilteredCopy[i]?.market_cap ?? 0;
      stock.share = stocksInfoFilteredCopy[i]?.share ?? 0;
    });

    const adjustment = stocksInfoFiltered.reduce((acc: DataAdjustments, current: StocksInfoExtended, i: number) => {
      acc.capitalizations = acc?.capitalizations || {};
      acc.original_percents = acc?.original_percents || {};
      acc.percents = acc?.percents || {};

      acc.capitalizations[current.symbol] = current.market_cap;
      acc.original_percents[current.symbol] = current.share;
      acc.percents[current.symbol] = current.share_adj;
      acc.is_quartile = true;

      return acc;
    }, {} as DataAdjustments);

    const finalAdjustment = {
      ...adjustment,
      date: new Date(date),
      index: indexName,
    };

  return finalAdjustment;
};