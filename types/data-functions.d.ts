import { IndexName } from '@/lib/constants/index-names';

interface DataOnlySymbol {
  symbol: string;
  [otherOptions: string]: unknown;
}

interface DataSharesOutstanding extends d3.DSVRowString {
  symbol: string;
  shares: number;
  currency: 'TWD' | 'JPY' | 'USD' | 'KRW';
  [otherOptions: string]: unknown;
}

interface StocksInfo {
  id: number;
  symbol: string;
  name: string;
  currency: 'TWD' | 'JPY' | 'USD' | 'KRW';
  country: 'Japan' | 'Taiwan' | 'South Korea';
  shares: number;
  market_cap: number;
  cap_index: 'Blue Chip' | 'Mid/Small Cap' | null;
  indicies: Array<IndexName>;
  is_delisted: boolean;
}

interface StocksInfoExtended {
  id: number;
  symbol: string;
  name: string;
  currency: 'TWD' | 'JPY' | 'USD' | 'KRW';
  country: 'Japan' | 'Taiwan' | 'South Korea';
  shares: number;
  market_cap: number;
  cap_index: 'Blue Chip' | 'Mid/Small Cap' | null;
  indicies: Array<IndexName>;
  is_delisted: boolean;
  [key: string]: number;
}

interface StocksInfo {
  id: number;
  symbol: string;
  name: string;
  currency: 'TWD' | 'JPY' | 'USD' | 'KRW';
  country: 'Japan' | 'Taiwan' | 'South Korea';
  shares: number;
  market_cap: number;
  cap_index: 'Blue Chip' | 'Mid/Small Cap' | null;
  indicies: Array<IndexName>;
  is_delisted: boolean;
}

interface DataInitialPrices extends d3.DSVRowString {
  symbol: string;
  initial_price: number;
  currency: 'TWD' | 'JPY' | 'USD' | 'KRW';
  [otherOptions: string]: unknown;
}

interface ResponseFundamental {
  SharesStats: {
    SharesOutstanding: number;
  };
  General: {
    CurrencyCode: 'TWD' | 'JPY' | 'USD' | 'KRW';
  };
}

interface ResponseHistorical {
  date: StringDate;
  open: number;
  high: number;
  low: number;
  close: number;
  adjusted_close: number;
  volume: number;
}

interface ResponseDividents {
  date: string;
  value: string;
}

interface DataSharesInitialDay {
  symbol: string;
  currency: 'TWD' | 'JPY' | 'USD' | 'KRW';
  initial_price: number;
  shares: number;
  initial_date: string;
  initial_MC?: number;
  initial_MC_USD: number;
  share: number;
  share_adj?: number;
  [otherOptions: string]: string;
}

interface DataShareAdjusted {
  symbol: string;
  currency: 'TWD' | 'JPY' | 'USD' | 'KRW';
  initial_price: number;
  shares: number;
  initial_date: string;
  initial_MC: number;
  initial_MC_USD: number;
  share: number;
  share_adj: number;
  [otherOptions: string]: string | number;
}

interface DataDividents {
  [date: string]: {
    [symbol: string]: number;
  };
}

interface DividentsDB {
  date: Date;
  dividents: {
    [ticker: string]: number;
  };
}

interface CurrenciesPrice {
  date: StringDate;
  KRW: number;
  TWD: number;
  JPY: number;
}

interface CurrenciesPriceDB {
  date: Date;
  KRW: number;
  TWD: number;
  JPY: number;
}

interface CurrenciesPriceExtended {
  date: StringDate;
  KRW?: number;
  TWD?: number;
  JPY?: number;
  [x: string]: number;
}

interface IndexDay {
  date: StringDate;
  name: string | undefined;
  adjustment: string | undefined;
  index: number | undefined;
  total_return: number | undefined;
  [otherOptions: string]: string | number;
}

interface IndexDayDB {
  date: Date;
  name: string;
  adjustment: Date;
  index: number;
  total_return: number;
}

interface DataTotal {
  date: string;
  index: number | null;
  price: number;
  index_adjusted: number | null;
  index_shares: string[];
  refactor: null | {
    new_index: number;
    new_price: number;
    shares_added: string[];
    shares_removed: string[];
  };
}

interface DataPrices {
  date: StringDate;
  [symbol: string]: number | StringDate;
}

interface DataAdjustments {
  id: number;
  date: Date;
  index: string;
  capitalizations: { [symbol: string]: number };
  original_percents: { [symbol: string]: number };
  percents: { [symbol: string]: number };
  is_quartile: boolean;
}

type StringDate = `${number}${number}${number}${number}-${number}${number}-${number}${number}`;

interface Splits {
  symbol: string;
  splits: ResponseDividents[];
}

interface Generic {
  [key: string]: strign | number;
}

interface DataItem {
  [key: string]: number | null | undefined | string | Date;
}
