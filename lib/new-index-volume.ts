import inquirer from 'inquirer';
import { db } from '@/lib/db';
import { indexnames } from '@/lib/db/schema';
import { IndexName } from '@/lib/constants/index-names';
import changeIndexVolume from '@/lib/functions/index-volume/change-index-volume';
import { StringDate } from '@/types/data-functions';

const indexNames = (await db.select().from(indexnames)).map((el) => el.id) as IndexName[];
const stringDateRegEx = /^(?:\d{4}-(?:0[1-9]|1[0-2])-(?:0[1-9]|[12]\d|3[01]))$/;

const questions = [
  {
    type: 'list',
    name: 'index',
    message: 'Choose index to modify:',
    choices: indexNames,
  },
  {
    type: 'input',
    name: 'volume',
    message: 'New volume of the index:',
    validate: (input: any) => {
      if (input === '' || isNaN(Number(input))) {
        throw Error('Please provide a valid number greater then 0')
    } else return true;
    },
  },
  {
    type: /^(?:\d{4}-(?:0[1-9]|1[0-2])-(?:0[1-9]|[12]\d|3[01]))$/,
    name: 'date',
    message: 'And finally, type the date for the new adjustment (format YYYY-MM-DD):',
    validate: (input: string) => {
      if (stringDateRegEx.test(input)) {
        return true;
      }
      throw Error('Please provide a valid date in YYYY-MM-DD format.');
    },
  },
];

const answers = await inquirer.prompt(questions);

const nameParts = answers.index.split('-');
nameParts.pop();
const indexName = nameParts.join('-');
const localeDate = new Date(answers.date).toUTCString().slice(0, 16);

const confirm = await inquirer.prompt({
  type: 'confirm',
  name: 'confirm',
  message: `So, you want to turn \x1b[33m${answers.index}\x1b[0m into \x1b[33m${indexName}-${answers.volume}\x1b[0m on \x1b[32m${localeDate}\x1b[0m`,
});

if (confirm.confirm) await changeIndexVolume(answers.index, answers.volume, answers.date);
console.log(`${!confirm.confirm ? 'operation aborted' : 'we\'re done!'}`);
