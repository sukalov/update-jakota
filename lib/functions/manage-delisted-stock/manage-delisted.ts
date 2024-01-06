import { IndexName } from "@/lib/constants/index-names";
import { db } from "@/lib/db";
import { indexnames, stocks_info } from "@/lib/db/schema";
import findAndRemoveStock from "@/lib/functions/manage-delisted-stock/find-and-remove";
import inquirer from "inquirer";

const stringDateRegEx = /^(?:\d{4}-(?:0[1-9]|1[0-2])-(?:0[1-9]|[12]\d|3[01]))$/;
const stocksInfo = await db.select().from(stocks_info)
const stockNames = stocksInfo.map((el) => el.symbol) as string[];

const questions = [
    {
      type: 'input',
      name: 'symbol',
      message: 'Ticker of the stock, that should be marked as delisted and frozen: ',
      validate: (input: any) => {
        if (!stockNames.includes(input)) {
          throw Error('Please provide a valid ticker that exists in "stocks_info"');
        } else return true;
      },
    },
    {
      type: /^(?:\d{4}-(?:0[1-9]|1[0-2])-(?:0[1-9]|[12]\d|3[01]))$/,
      name: 'date',
      message: 'And type the date when stock must be frozen (format YYYY-MM-DD):',
      validate: (input: string) => {
        if (stringDateRegEx.test(input)) {
          return true;
        }
        throw Error('Please provide a valid date in YYYY-MM-DD format.');
      },
    },
  ];

const answers = await inquirer.prompt(questions);
const localeDate = new Date(answers.date).toUTCString().slice(0, 16);
const company = stocksInfo.find(el => el.symbol == answers.symbol)

const confirm = await inquirer.prompt({
    type: 'confirm',
    name: 'confirm',
    message: `So, you want to mark \x1b[33m${company?.name}\x1b[0m as delisted since \x1b[32m${localeDate}\x1b[0m`,
  });

  company?.cap_index


  
  if (confirm.confirm) await findAndRemoveStock(answers.symbol,  answers.date);
  console.log(`${!confirm.confirm ? 'operation aborted' : "we're done!"}`);