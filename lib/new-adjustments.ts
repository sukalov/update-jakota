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
    type: 'string',
    name: 'date',
    message: 'And now, type the date for the new adjustments (format YYYY-MM-DD):',
  },
];

const answer1 = await inquirer.prompt([questions[0]]);
let answer2: { date: StringDate } = { date: '0000-00-00' };

if (answer1.indicies.length === 0) throw 'No indicies selected';

while (answer2.date.match(stringDateRegEx) == null) {
  answer2 = (await inquirer.prompt([questions[1]])) as { date: StringDate };
}
const localeDate = new Date(answer2.date).toUTCString().slice(0, 16);

const confirm = await inquirer.prompt({
  type: 'confirm',
  name: 'confirm',
  message: `So, you want to make adjustment(s) for \x1b[33m${answer1.indicies.join(
    ', '
  )}\x1b[0m on \x1b[32m${localeDate}\x1b[0m`,
});

if (confirm.confirm) await newAdjustments(answer1.indicies, answer2.date);
