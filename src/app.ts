import * as figlet from 'figlet';
import {Command} from 'commander';
import * as fs from 'fs';
import * as path from 'path';
import {parse} from 'csv-parse';
import {finished} from 'stream/promises';
import {WriteRecord} from './dynamodb';

const program = new Command();

console.log(figlet.textSync('CSV to DynamoDB'));

const processCsv = async (csvFile: string | undefined) => {
  try {
    if (!csvFile) {
      program.outputHelp();
    } else {
      if (fs.existsSync(csvFile)) {
        const csvFilePath = path.resolve(csvFile);
        console.log('Start parsing csv file', csvFilePath);
        const parser = fs.createReadStream(csvFilePath).pipe(
          parse({
            delimiter: ',',
            columns: true
          })
        );
        parser.on('readable', async () => {
          let record;
          while ((record = parser.read()) !== null) {
            // console.log(record);
            const ok = await WriteRecord(record);
            if (!ok) {
              console.error('Failed to write record', record);
            }
          }
        });
        parser.on('error', err => {
          console.error(err.message);
        });

        parser.on('end', () => {
          console.log('CSV file parsing finished');
        });
        await finished(parser);
      } else {
        console.error('File parsing failed, csv file does not exist', csvFile);
      }
    }
  } catch (error) {
    console.error('Error occurred!', error);
  }
};

program
  .version('1.0.0')
  .description('A CLI for uploading csv files to AWS DynamoDB')
  .option('-f, --file  [file path]', 'csv file')
  .parse(process.argv);

const options = program.opts();

if (options.file) {
  const csvFile = typeof options.file === 'string' ? options.file : undefined;
  processCsv(csvFile).then();
}
