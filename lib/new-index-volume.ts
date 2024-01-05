import inquirer from 'inquirer';
import { db } from './db';
import { indexnames } from './db/schema';
import { IndexName } from './constants/index-names';
import changeIndexVolume from './functions/index-volume/change-index-volume';
import { StringDate } from '@/types/data-functions';

const indexNames = (await db.select().from(indexnames)).map(el => el.id) as IndexName[];
const stringDateRegEx = /^(?:\d{4}-(?:0[1-9]|1[0-2])-(?:0[1-9]|[12]\d|3[01]))$/;

const questions = [
    {
      type: 'list',
      name: 'index',
      message: 'Choose index to modify:',
      choices: indexNames,
    },
    {
      type: 'number',
      name: 'volume',
      message: 'New volume of the index:',
    },
    {
      type: /^(?:\d{4}-(?:0[1-9]|1[0-2])-(?:0[1-9]|[12]\d|3[01]))$/,
      name: 'date',
      message: 'And finally, type the date for the new adjustment (format YYYY-MM-DD):',
    },
  ];

let volume = { volume: NaN }
let date: {date: StringDate} = {date: '0000-00-00'}
const index = await inquirer.prompt([questions[0]])

while (isNaN(volume.volume)) {
 volume = await inquirer.prompt([questions[1]])
}

while (date.date.match(stringDateRegEx) == null) {
  date = await inquirer.prompt([questions[2]]) as {date: StringDate};
 }

const nameParts = index.index.split('-')
nameParts.pop()
const indexName = nameParts.join('-')
const localeDate = new Date(date.date).toUTCString().slice(0,16)



const confirm = await inquirer.prompt({
    type: 'confirm',
    name: 'confirm',
    message: `So, you want to turn \x1b[33m${index.index}\x1b[0m into \x1b[33m${indexName}-${volume.volume}\x1b[0m on \x1b[32m${localeDate}\x1b[0m`
})

if (confirm.confirm) await changeIndexVolume(index.index, volume.volume, date.date)
console.log(`we're done!`)