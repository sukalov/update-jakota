import { getArgs, isFirstJanuary } from '@/lib/functions/utils';
import { DataAdjustments, DataDividents, DataPrices, IndexDay } from '@/types/data-functions';
import { IndexName } from '@/lib/constants/index-names';

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

  dataIndexPrices.forEach((day: DataPrices, ind: number) => {
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
    if (dayDate.toLocaleDateString() === checkAdjDate.toLocaleDateString()) {
      i += 1;
    }

    const percents = dataAdjustments[i].percents;
    let index_change = 0;
    let index_return_change = 0;
    Object.keys(percents).forEach((symbol) => {
      let symbol_change = (Number(day[symbol]) / Number(day_previous[symbol])) * percents[symbol];
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
      index_return_change += symbol_return_change;
    });

    index = index_prev * index_change;
    index_prev = index;
    total_return = total_return_prev * index_return_change;
    total_return_prev = total_return;

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

  return indexHistoryNoWeekends;
}
