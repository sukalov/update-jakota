import { IndexName } from "@/lib/constants/index-names";
import { db } from "@/lib/db";
import { adjustments, indexnames, stocks_info } from "@/lib/db/schema";
import removeStockFromAdjustment from "@/lib/functions/manage-delisted-stock/remove-stock-from-adjustment";
import { DataAdjustments, StringDate } from "@/types/data-functions";
import { eq } from "drizzle-orm";

export default async function findAndRemoveStock (symbol: string, date: StringDate) {
    const indexNames = (await db.select().from(indexnames)).map((el) => el.id) as IndexName[];
    for (let indexName of indexNames) {
        const dataAdjustments = await db.select().from(adjustments).where(eq(adjustments.index, indexName)).orderBy(adjustments.date) as DataAdjustments[];
        const lastAdjustment = dataAdjustments.at(-1)
        if (lastAdjustment && lastAdjustment.capitalizations[symbol]) {
            await removeStockFromAdjustment(lastAdjustment, symbol, date)
            console.log(`Created new adjustment for ${lastAdjustment.index}`)
        }
    }
    await db.update(stocks_info).set({is_delisted: true}).where(eq(stocks_info.symbol, symbol))
}