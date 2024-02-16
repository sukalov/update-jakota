import { csv } from "@/lib/functions/read-write-csv";

const twoDays = await csv.readJSON('twoDays') as [{[x: string]: string}, {[x: string]: string}]

let newArr = [];

for (let index = 0; index < Object.keys(twoDays[1]).length; index++) {
    const element = Object.keys(twoDays[1])[index];
    newArr.push([element, twoDays[1][element], twoDays[0][element]])
};

csv.write('augustDelisted', newArr)