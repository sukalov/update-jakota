import { DataPrices, StringDate } from '@/types/data-functions';
import { db } from '@/lib/db';
import { adjustments, indexnames, indexprices } from '@/lib/db/schema';
import createAdjustment from '@/lib/functions/create-adjustments/0-create-adjustment';
import { getArgs } from '@/lib/functions/utils';
import { IndexName } from '@/lib/constants/index-names';
import newAdjustments from '@/lib/functions/create-adjustments';
import inquirer from 'inquirer';

const indexNames = (await db.select().from(indexnames)).map((el) => el.id) as IndexName[];
const stringDateRegEx = /^(?:\d{4}-(?:0[1-9]|1[0-2])-(?:0[1-9]|[12]\d|3[01]))$/;

const questions = [
  {
    type: 'checkbox',
    name: 'indicies',
    message: 'Choose indicies to make adjustment for:',
    choices: indexNames,
    default: indexNames,
  },
  {
    type: /^(?:\d{4}-(?:0[1-9]|1[0-2])-(?:0[1-9]|[12]\d|3[01]))$/,
    name: 'date',
    message: 'And type the date for the new adjustments (format YYYY-MM-DD):',
    validate: (input: string) => {
      if (stringDateRegEx.test(input)) {
        return true;
      }
      throw Error('Please provide a valid date in YYYY-MM-DD format.');
    },
  },
];

const answers = await inquirer.prompt(questions);

if (answers.indicies.length === 0) throw 'No indicies selected';

const localeDate = new Date(answers.date).toUTCString().slice(0, 16);

const confirm = await inquirer.prompt({
  type: 'confirm',
  name: 'confirm',
  message: `So, you want to make adjustment(s) for \x1b[33m${answers.indicies.join(
    ', '
  )}\x1b[0m on \x1b[32m${localeDate}\x1b[0m`,
});

if (confirm.confirm) await newAdjustments(answers.indicies, answers.date);
console.log(`${!confirm.confirm ? 'operation aborted' : "we're done!"}`);
