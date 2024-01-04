import { DataPrices, StringDate } from '@/types/data-functions';
import { db } from '@/lib/db';
import { adjustments, indexprices } from '@/lib/db/schema';
import createAdjustment from '@/lib/functions/create-adjustments/0-create-adjustment';
import { indexNames } from './constants/index-names';
import { getArgs } from './functions/utils';

const dataIndexPricesDB = await db.select().from(indexprices);
const dataIndexPrices = dataIndexPricesDB[0].json as DataPrices[];
const process = getArgs();
const stringDateRegEx = /^(?:\d{4}-(?:0[1-9]|1[0-2])-(?:0[1-9]|[12]\d|3[01]))$/;
let date: StringDate;

if (String(process.date).match(stringDateRegEx)) {
  date = process.date as StringDate;
} else throw new Error(`${process.date} is not a valid date.`);

for (let indexName of indexNames) {
  const newAdjustment = await createAdjustment(dataIndexPrices, indexName, date);
  await db.insert(adjustments).values(newAdjustment);
  console.log(`new adjustment for ${indexName} with date ${date} created and saved`);
}
console.log('finish');
