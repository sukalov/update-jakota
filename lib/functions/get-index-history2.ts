import { IndexName } from '@/lib/constants/index-names';
import { csv } from '@/lib/functions/read-write-csv';
import { getArgs, isFirstJanuary } from '@/lib/functions/utils';
import { DataAdjustments, DataDividents, DataPrices, IndexDay } from '@/types/data-functions';

export default function getIndexHistory2(
  dataIndexPrices: DataPrices[],
  dataAdjustments: DataAdjustments[],
  dataDividents: DataDividents,
  indexName: IndexName
) {
  while (new Date(dataIndexPrices[0].date) < new Date('2022-12-31')) {
    dataIndexPrices.shift();
  }

  let index = 100;
  let index_prev = 100;
  let total_return = 100;
  let total_return_prev = 100;
  let i = 0;
  let indexHistory: IndexDay[] = [];

  // const yearlyPrices: { [key: string]: any[] } = {};
  // const yearlyPricesCSV: string[][] = [];
  dataIndexPrices.forEach((day: DataPrices, ind: number) => {
    // if (day.date === '2022-12-31' || day.date === '2023-12-29') {
    //   for (let j = 0; j < Object.keys(dataAdjustments[i].percents).length; j++) {
    //     const element = Object.keys(dataAdjustments[i].percents)[j];
    //     yearlyPrices[element] = (yearlyPrices[element] || []).concat(day[element]);
    //     if (day.date === '2023-12-29') {
    //       yearlyPricesCSV.push([element].concat(yearlyPrices[element]));
    //     }
    //   }
    // }
    let day_previous: DataPrices = day;
    if (ind > 0) day_previous = dataIndexPrices[ind - 1];
    const dayDate = new Date(day.date);
    const today = new Date();
    const tomorrow = new Date();
    tomorrow.setDate(today.getDate() + 1);
    let checkAdjDate;

    if (i < dataAdjustments.length - 1) {
      checkAdjDate = dataAdjustments[i + 1].date;
    } else {
      checkAdjDate = tomorrow;
    }
    if (dayDate.toLocaleDateString() === checkAdjDate.toLocaleDateString() && dayDate.getFullYear() !== 2022) {
      i += 1;
    }

    const percents = dataAdjustments[i].percents;
    let index_change = 0;
    let index_return_change = 0;
    Object.keys(percents).forEach((symbol) => {
      let symbol_change = (Number(day[symbol]) / Number(day_previous[symbol])) * percents[symbol];
      // if ((day.date === '2023-01-01' || day.date === '2023-01-02')) {
      //   console.log({
      //     symbol,
      //     symbol_change,
      //     symbol_percent: percents[symbol],
      //     day_symbol: day[symbol],
      //     prev: day_previous[symbol],
      //     'today/prev': Number(day[symbol]) / Number(day_previous[symbol]),
      //   });
      // }
      if (isNaN(symbol_change)) symbol_change = 0;
      index_change += symbol_change;
      let symbol_return_change;
      if (
        dataDividents[day.date] !== undefined &&
        dataDividents[day.date]?.[symbol] !== undefined &&
        percents[symbol] !== undefined
      ) {
        symbol_return_change =
          ((Number(day[symbol]) + dataDividents[day.date]?.[symbol]) / Number(day_previous[symbol])) *
            percents[symbol] ?? symbol_change;
      } else {
        symbol_return_change = symbol_change;
      }
      // if (symbol_return_change > 50)
      //   console.log({
      //     symbol,
      //     dayDate,
      //     symbol_change,
      //     symbol_return_change,
      //     daysymbol: day[symbol],
      //     plusDiv: dataDividents[day.date]?.[symbol],
      //     divideToYesterday: day_previous[symbol],
      //     multiplicateToPersent: percents[symbol]
      //   });
      index_return_change += symbol_return_change;
    });

    index = index_prev * index_change;
    index_prev = index;
    total_return = total_return_prev * index_return_change;
    total_return_prev = total_return;

    // if (day.date === '2023-01-01' || day.date === '2023-01-02') {
    // console.log({
    //   date: day.date,
    //   index_prev,
    //   index_change,
    //   index,
    //   total_return
    // })
    // }

    if (index > 5000) {
      console.log({
        date: day.date,
        name: indexName,
        adjustment: dataAdjustments[i].date.toISOString().slice(0, 10),
        index,
        total_return,
      });
      throw new Error();
    }

    indexHistory.push({
      date: day.date,
      name: indexName,
      adjustment: dataAdjustments[i].date.toISOString().slice(0, 10),
      index,
      total_return,
    });
  });

  const process = getArgs();
  let weekend: [number, number];
  switch (process.zone) {
    case 'Europe':
      weekend = [5, 6];
      break;
    case 'US':
      weekend = [6, 0];
      break;
    default:
      weekend = [5, 6];
  }

  const indexHistoryNoWeekends = indexHistory.filter((day, i) => {
    const isItFirstJanuary = isFirstJanuary(new Date(new Date(day.date).toLocaleString('en-US', { timeZone: 'UTC' })));
    return (
      i === 0 ||
      (new Date(day.date).getDay() !== weekend[0] && new Date(day.date).getDay() !== weekend[1] && !isItFirstJanuary)
    );
  });
  // csv.write('OM60_StartEnd_2023', yearlyPricesCSV);

  return indexHistoryNoWeekends;
}
