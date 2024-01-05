import { CurrenciesPrice, CurrenciesPriceDB, DataItem } from '@/types/data-functions';

export function getInitialIndexDates(startDate: string) {
  const getDaysArray = (start: string) => {
    let dates = [];
    for (let dt = new Date(start); dt <= new Date(); dt.setDate(dt.getDate() + 1)) {
      dates.push(new Date(dt).toISOString().slice(0, 10));
    }

    return dates;
  };
  const dayList = getDaysArray(startDate).map((dat) => {
    return { date: dat };
  });
  return dayList;
}

export function addMissingValues(data: DataItem[] | CurrenciesPrice[]): DataItem[] | CurrenciesPriceDB[] {
  const keys: string[] = data.reduce((prevKeys: string[], curr) => {
    const arr = [...prevKeys];
    Object.keys(curr).forEach((key) => {
      if (!arr.includes(key)) arr.push(key);
    });
    return arr;
  }, []);

  let newData: DataItem[] = [];
  data.forEach((obj: any, i: number) => {
    const newObj: DataItem = {};
    const prevDay = newData[i - 1];
    keys.forEach((key) => {
      if (prevDay === undefined) {
        newObj[key] = obj[key] === undefined || obj[key] === null ? 0 : obj[key];
      } else {
        newObj[key] = obj[key] === undefined || obj[key] === null ? prevDay[key] : obj[key];
      }
    });
    newData.push(newObj);
  });

  return newData;
}

export function findUnique(array1: string[], array2: string[]): [string[], string[]] {
  const uniqueInArray1 = [];
  const uniqueInArray2 = [];

  for (let i = 0; i < array1.length; i++) {
    if (!array2.includes(array1[i])) {
      uniqueInArray1.push(String(array1[i]));
    }
  }

  for (let i = 0; i < array2.length; i++) {
    if (!array1.includes(array2[i])) {
      uniqueInArray2.push(String(array2[i]));
    }
  }

  return [uniqueInArray1, uniqueInArray2];
}

export function timeout(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export function getQuarterlyStartDates(start_date: string) {
  const quarterlyStartDates = [start_date];
  const today = new Date();

  const addDate = (arr: string[]) => {
    const lastDate = new Date(arr[arr.length - 1]!);
    if (lastDate < today) {
      lastDate.setMonth(lastDate.getMonth() + 3);
      arr.push(lastDate.toISOString().split('T')[0] ?? '');
      addDate(arr);
    }
  };
  addDate(quarterlyStartDates);
  quarterlyStartDates.pop();

  const convertedDates = [];

  for (let i = 0; i < quarterlyStartDates.length; i++) {
    const date = new Date(quarterlyStartDates[i]!);
    const year = date.getFullYear();
    const month = date.getMonth() + 1; // Adding 1 because getMonth() returns zero-based index
    const lastDay = new Date(year, month, 0).getDate();
    const convertedDate = `${year}-${month.toString().padStart(2, '0')}-${lastDay.toString().padStart(2, '0')}`;
    convertedDates.push(convertedDate);
  }
  return convertedDates;
}

export function compareDates(date1: Date, date2: Date) {
  const d1 = new Date(date1.getFullYear(), date1.getMonth(), date1.getDate());
  const d2 = new Date(date2.getFullYear(), date2.getMonth(), date2.getDate());

  if (d1 < d2) {
    return -1;
  } else if (d1 > d2) {
    return 1;
  } else {
    return 0;
  }
}

export function getArgs() {
  const args: { [key: string]: string | true } = {};
  process.argv.slice(2, process.argv.length).forEach((arg: string) => {
    // long arg
    if (arg.slice(0, 2) === '--') {
      const longArg = arg.split('=');
      const longArgFlag = longArg[0].slice(2, longArg[0].length);
      const longArgValue = longArg.length > 1 ? longArg[1] : true;
      args[longArgFlag] = longArgValue;
    }
    // flags
    else if (arg[0] === '-') {
      const flags = arg.slice(1, arg.length).split('');
      flags.forEach((flag) => {
        args[flag] = true;
      });
    }
  });
  return args;
}

export function isFirstJanuary(date: Date) {
  return date.getMonth() === 0 && date.getDate() === 1;
}
