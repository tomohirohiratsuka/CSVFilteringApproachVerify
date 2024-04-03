import {StreamService} from "src/StreamService";
import path from "path";
import {ContactCSVRow} from "src/types";

const rows = [100, 1000, 10000, 100000, 1000000]
const streamService = new StreamService();
/**
 * Read CSV performance
 */
// Stream Read All Row Time: 0.023, Rows: 100
// Stream Read All Row Time: 0.022, Rows: 1000
// Stream Read All Row Time: 0.043, Rows: 10000
// Stream Read All Row Time: 0.165, Rows: 100000
// for (const row of rows) {
//     const startTime = Date.now();
//     streamService.readCSV(path.join(__dirname, `src/tmp/${row}rows.csv`))
//     .then(() => {
//         console.log(`Stream Read All Row Time: ${(Date.now() - startTime) / 1000}, Rows: ${row}`)
//     })
// }

/**
 * SearchContact performance
 */
// Stream Search Contact Time: 0.037, Rows: 1000
// Stream Search Contact Time: 0.045, Rows: 100
// Stream Search Contact Time: 0.067, Rows: 10000
// Stream Search Contact Time: 0.258, Rows: 100000
// Stream Search Contact Time: 1.242, Rows: 1000000
// for (const row of rows) {
//     const startTime = Date.now();
//     const target: ContactCSVRow = {
//         'Record ID': '1',
//         "Create Date": "2021-01-01",
//         "First Name": "John",
//         "Last Name": "Doe",
//         "Last Modified Date": "2021-01-01",
//         "VRM": "1234",
//     }
//     streamService.searchContact(path.join(__dirname, `src/tmp/${row}rows.csv`), target, streamService.matchFunction)
//     .then(() => {
//         console.log(`Stream Search Contact Time: ${(Date.now() - startTime) / 1000}, Rows: ${row}`)
//     })
// }

/**
 * SearchDuplicateContacts performance
 */
//Stream Search Duplicate Contacts Time: 0.141, Rows: 100
// Stream Search Duplicate Contacts Time: 0.151, Rows: 1000
// Stream Search Duplicate Contacts Time: 92.443, Rows: 10000
// Stream Search Duplicate Contacts Time: UNAVAILABLE, Rows: 100000
// Stream Search Duplicate Contacts Time: UNAVAILABLE, Rows: 1000000
// for (const row of rows) {
//     const startTime = Date.now();
//     streamService.searchDuplicateContacts(path.join(__dirname, `src/tmp/${row}rows.csv`))
//     .then(() => {
//         console.log(`Stream Search Duplicate Contacts Time: ${(Date.now() - startTime) / 1000}, Rows: ${row}`)
//     })
// }