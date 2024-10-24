import * as figlet from 'figlet';
import {Command} from 'commander';
import * as fs from 'fs';
import * as path from 'path';
import {parse} from 'csv-parse';
import {finished} from 'stream/promises';
import {ReadRecord, WriteRecord} from './dynamodb';
import {transform} from 'stream-transform';
import {stringify} from 'csv-stringify';

const program = new Command();

console.log(figlet.textSync('CSV with DynamoDB Query'));

const processQuery = async (
  csvFile: string | undefined
) => {
  try {
    if (!csvFile) {
      program.outputHelp();
    } else {
      if (fs.existsSync(csvFile)) {
        const csvFilePath = path.resolve(csvFile);
        console.log('processing query for csv file', csvFilePath);
        const transformStream = transform(
          {objectMode: true},
          async (record, callback) => {
            const title = record['Title'];
            const item = await ReadRecord(title);
            if (item) {
              record['Rank'] = item['NetflixRank'];
              record['Netflix Release Date'] = item['NetflixReleaseDate'];
              record['Days In Top 10'] = item['DaysInTop10'];
              record['Viewership Score'] = item['ViewershipScore'];
            }
            callback(null, record);
          }
        );

        const parser = parse({
          delimiter: ',',
          columns: true,
        });
        parser.on('error', err => {
          console.error(err.message);
        });
        parser.on('end', () => {
          console.log('parser end');
        });

        const stream = fs
          .createReadStream(csvFilePath)
          .pipe(parser)
          .pipe(transformStream)
          .pipe(stringify({header: true}))
          .pipe(process.stdout);
        await finished(stream);
      }
    }
  } catch (error) {
    console.error('Error occurred!', error);
  }
};
program
  .version('1.0.0')
  .description('A CLI for parsing csv files and query AWS DynamoDB')
  .option('-q, --query [file path]', 'query file')
  .parse(process.argv);

const options = program.opts();

if (options.query) {
  const csvFile = typeof options.query === 'string' ? options.query : undefined;
  processQuery(csvFile).then();
}
