import { getCLIArguments } from './lib/lib';
import { scan } from './scanner/scanner';


const PROGRAM_SOURCE = getCLIArguments()[0];
if (PROGRAM_SOURCE === undefined) throw new Error('No input provided.');

const s = scan(PROGRAM_SOURCE);
console.log(JSON.stringify(s));
