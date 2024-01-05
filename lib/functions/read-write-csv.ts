import * as d3 from 'd3';
import path from 'path';
import { promises as fs } from 'fs';
import { Generic } from '@/types/data-functions';

const read = async (file: string): Promise<Array<Object>> => {
  const csvDir = path.join(process.cwd(), 'lib/data/');
  const dataFile = await fs.readFile(csvDir + file + '.csv', 'utf8');
  const data = d3.csvParse(dataFile);
  return data;
};

const write = async (file: string, data: Generic[]) => {
  const csvDir = path.join(process.cwd(), 'lib/data/');
  const newData: Generic = data.reduce((acc, current, i) => {
    if (i === 0) acc.push(Object.keys(current));
    if (Object.values(current)) {
      const arr = Object.values(current);
      const arr2 = arr.map((val) => {
        if (typeof val === 'object') {
          return `"${JSON.stringify(val).replace(/"/g, '')}"`;
        }
        return val;
      });
      acc.push(arr2);
    }
    return acc;
  }, []);

  let csvContent = '';
  let headerCommas = 0;

  newData.forEach((row: Generic, i: number) => {
    let theRow = row.join(',');
    csvContent += theRow + '\n';
  });

  fs.writeFile(csvDir + file + '.csv', csvContent, 'utf-8');
  return csvContent;
};

const readJSON = async (file: string) => {
  const csvDir = path.join(process.cwd(), 'src/data/json/');
  const dataFile = await fs.readFile(csvDir + file + '.json', 'utf8');
  const data = JSON.parse(dataFile) as Generic;
  return data;
};

const writeJSON = async (file: string, data: Generic) => {
  const csvDir = path.join(process.cwd(), 'src/data/json/');
  const dataFile = JSON.stringify(data);
  await fs.writeFile(csvDir + file + '.json', dataFile, 'utf8');
};

export const csv = { read, write, readJSON, writeJSON };
