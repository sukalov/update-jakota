import { IndexName } from '@/lib/constants/index-names';
import { db } from '@/lib/db';
import { adjustments, indexnames, indexprices, stocks_info } from '@/lib/db/schema';
import { DataPrices, StringDate } from '@/types/data-functions';
import { eq, sql } from 'drizzle-orm';
import createAdjustment from '@/lib/functions/create-adjustments/0-create-adjustment';

export default async function changeIndexVolume(indexName: IndexName, newVolume: number, date: StringDate) {
  const nameParts = indexName.split('-');
  nameParts.pop();
  const indexNameCropped = nameParts.join('-');
  const newIndexName = `${indexNameCropped}-${newVolume}`;
  const dataIndexPricesDB = await db.select().from(indexprices);
  const dataIndexPrices = dataIndexPricesDB[0].json as DataPrices[];

  const newAdjustment = await createAdjustment(dataIndexPrices, indexName, date, newVolume);
  await db.insert(adjustments).values(newAdjustment);

  const sqlStr = sql.raw(`
    UPDATE stocks_info
    SET indicies = JSON_REPLACE(
        indicies,
        JSON_UNQUOTE(JSON_SEARCH(indicies, 'one', '${indexName}')),
        '${newIndexName}'
    )
    WHERE JSON_SEARCH(indicies, 'one', '${indexName}') IS NOT NULL;
    `);

  await db.execute(sqlStr);
  await db.update(indexnames).set({ id: newIndexName }).where(eq(indexnames.id, indexName));
  await db.update(adjustments).set({ index: newIndexName }).where(eq(adjustments.index, indexName));
}
