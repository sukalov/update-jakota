import { eq, sql } from 'drizzle-orm';
import { db } from '@/lib/db';
import { currencies, stocks_info } from '@/lib/db/schema';
import getCurrenencyPrices from '@/lib/functions/get-currencies';

export const initialSteps = async () => {
  const data = await getCurrenencyPrices();
  return data;
};
