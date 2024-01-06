import { db } from '@/lib/db';
import { adjustments } from '@/lib/db/schema';
import { DataAdjustments, StringDate } from '@/types/data-functions';

export default async function removeStockFromAdjustment(adjustment: DataAdjustments, stock: string, date: StringDate) {

  const length = Object.keys(adjustment.percents).length - 1;
  const addition = Number(adjustment.percents[stock]) / length;
  const newAdjustment = JSON.parse(JSON.stringify(adjustment)) as any;
  delete newAdjustment.capitalizations[stock];
  delete newAdjustment.original_percents[stock];
  delete newAdjustment.percents[stock];
  delete newAdjustment.id;

  newAdjustment.date = new Date(date);
  newAdjustment.is_quartile = false;
  Object.keys(newAdjustment.percents).forEach((sym) => {
    newAdjustment.percents[sym] = Number(newAdjustment.percents[sym]) + addition;
  });

  await db.insert(adjustments).values(newAdjustment);

  return newAdjustment;
}
