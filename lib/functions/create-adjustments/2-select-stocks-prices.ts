import { IndexName } from "@/lib/constants/index-names";
import { DataPrices, StocksInfo, StringDate } from "@/types/data-functions";

export default async function selectStocksPrices (
    dataIndexPrices: DataPrices[],
    stocksInfo: StocksInfo[],
    indexName: IndexName,
    date: StringDate,
    ) {      
    const stocksPrices = dataIndexPrices.find(day => day.date === date) as DataPrices
    
    let stocksPricesFiltered = stocksPrices as DataPrices;
    if (indexName !== 'blue-chips-150' && indexName !== 'mid-small-cap-2000') {
        stocksPricesFiltered = { date };
        Object.keys(stocksPrices).forEach((symbol) => {
          if (symbol === 'date') stocksPricesFiltered[symbol] = stocksPrices[symbol]
          else  {
            const stockInfoIndex = stocksInfo.findIndex((stock) => stock.symbol === symbol);
            if (stockInfoIndex >= 0) {
              if (stocksPrices[symbol] !== 0) stocksPricesFiltered[symbol] = stocksPrices[symbol];
            }
          }
        });
    }
    
    return stocksPricesFiltered
    };