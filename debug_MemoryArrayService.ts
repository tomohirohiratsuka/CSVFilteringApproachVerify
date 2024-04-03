import {StreamService} from "src/StreamService";
import {MemoryArrayService} from "src/MemoryArrayService";
import path from "path";
import fs from "fs";

const rows = [100, 1000, 10000, 100000, 1000000]
const memoryArrayService = new MemoryArrayService()
/**
 * Memory Array Read csv performance
 */
// Memory Array Read All Row Time: 0, Rows: 100
// Memory Array Read All Row Time: 0.001, Rows: 1000
// Memory Array Read All Row Time: 0.003, Rows: 10000
// Memory Array Read All Row Time: 0.024, Rows: 100000
// Memory Array Read All Row Time: 0.311, Rows: 1000000
// for (const row of rows) {
//     const startTime = Date.now();
//     memoryArrayService.readCSV(path.join(__dirname, `src/tmp/${row}rows.csv`))
//     console.log(`Memory Array Read All Row Time: ${(Date.now() - startTime) / 1000}, Rows: ${row}`)
// }

/**
 * Memory Array Search Contact performance
 */
// Memory Array Search Contact Time: 0, Rows: 100
// Memory Array Search Contact Time: 0, Rows: 1000
// Memory Array Search Contact Time: 0.002, Rows: 10000
// Memory Array Search Contact Time: 0.019, Rows: 100000
// Memory Array Search Contact Time: 0.171, Rows: 1000000
// for (const row of rows) {
//     const csvData = fs.readFileSync(path.join(__dirname, `src/tmp/${row}rows.csv`), 'utf8');
//     const records = csvData.split('\n');
//     const startTime = Date.now();
//     memoryArrayService.searchContact(records,0,memoryArrayService.matchFunction)
//     console.log(`Memory Array Search Contact Time: ${(Date.now() - startTime) / 1000}, Rows: ${row}`)
// }

/**
 * Memory Array Search Duplicate Contacts performance
 */
// Memory Array Search Duplicate Contacts Time: 0.003, Rows: 100
// Memory Array Search Duplicate Contacts Time: 0.167, Rows: 1000
// Memory Array Search Duplicate Contacts Time: 15.802, Rows: 10000
// Memory Array Search Duplicate Contacts Time: UNAVAILABLE, Rows: 100000
// Memory Array Search Duplicate Contacts Time: UNAVAILABLE, Rows: 1000000
for (const row of rows) {
    const startTime = Date.now();
    memoryArrayService.searchDuplicateContacts(path.join(__dirname, `src/tmp/${row}rows.csv`))
    console.log(`Memory Array Search Duplicate Contacts Time: ${(Date.now() - startTime) / 1000}, Rows: ${row}`)
}