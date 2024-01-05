import { DataPrices, StringDate } from '@/types/data-functions';
import { db } from '@/lib/db';
import { adjustments, indexprices } from '@/lib/db/schema';
import createAdjustment from '@/lib/functions/create-adjustments/0-create-adjustment';
import { IndexName } from '@/lib/constants/index-names';

export default async function newAdjustments(indexNames: IndexName[], date: StringDate) {
  const dataIndexPricesDB = await db.select().from(indexprices);
  const dataIndexPrices = dataIndexPricesDB[0].json as DataPrices[];

  for (let indexName of indexNames) {
    const newAdjustment = await createAdjustment(dataIndexPrices, indexName, date);
    await db.insert(adjustments).values(newAdjustment);
    console.log(`new adjustment for ${indexName} with date ${date} created and saved`);
  }
  console.log('finished');
}
