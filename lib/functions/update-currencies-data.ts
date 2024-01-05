import getCurrenencyPrices from '@/lib/functions/get-currencies';

export const initialSteps = async () => {
  const data = await getCurrenencyPrices();
  return data;
};
