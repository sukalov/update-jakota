import { IndexName } from '@/lib/constants/index-names';
import { DataPrices, StocksInfo } from '@/types/data-functions';

export default function filterByMarketCap(stocksPrices: DataPrices, stocksInfo: StocksInfo[], indexName: IndexName) {
  const indexVolume = Number(indexName.split('-').at(-1));
  console.log(indexVolume);
  let filteredStocksInfo = JSON.parse(JSON.stringify(stocksInfo)) as StocksInfo[];
  filteredStocksInfo.forEach((stock) => {
    stock.market_cap = Number(stocksPrices[stock.symbol]) * stock.shares;
  });
  filteredStocksInfo = filteredStocksInfo.filter((el) => el.market_cap > 0);
  filteredStocksInfo.sort((a, b) => Number(b.market_cap) - Number(a.market_cap));

  if (indexName === 'blue-chips-150') filteredStocksInfo = filteredStocksInfo.slice(0, 150);
  if (indexName === 'mid-small-cap-2000') filteredStocksInfo = filteredStocksInfo.slice(150, 2150);
  filteredStocksInfo.splice(indexVolume);

  return filteredStocksInfo;
}
