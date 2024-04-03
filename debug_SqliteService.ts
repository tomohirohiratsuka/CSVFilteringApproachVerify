import {SqliteService} from "src/SqliteService";
import fs from "fs";
import path from "path";

const rows = [100, 1000, 10000, 100000, 1000000];
const sqliteService = new SqliteService();
/**
 * SQLite Create Table performance
 */
// SQLite Create Table Time: 0
// const startTime = Date.now();
// sqliteService.initDatabase('db').then(d => {
//     console.log('SQLite Create Table Time:', (Date.now() - startTime) / 1000)
//     fs.unlinkSync(path.join(__dirname, 'src/tmp/db'));
// });

/**
 * SQLite Insert performance
 */
// SQLite Create Table Time: 0.002
// SQLite Insert Time: 0.005, Rows: 100
// SQLite Insert Time: 0.012, Rows: 1000
// SQLite Insert Time: 20.259, Rows: 10000
// SQLite Insert Time: 69.227, Rows: 100000
// SQLite Insert Time: 496.878, Rows: 1000000

// (async () => {
//     for (const row of rows) {
//         const dbName = `db_${row}rows`;
//         const dbPath = path.join(__dirname, `src/tmp/${dbName}`);
//         const csvPath = path.join(__dirname, `src/tmp/${row}rows.csv`);
//         const database = await sqliteService.initDatabase(dbName);
//         await sqliteService.createTable(database);
//         const startTime = Date.now();
//         await sqliteService.insertFromCSV(database, csvPath);
//         console.log(`SQLite Insert Time: ${(Date.now() - startTime) / 1000}, Rows: ${row}`);
//         fs.unlinkSync(dbPath);
//     }
// })();
/**
 * SQLite Search performance
 */
// SQLite Search Time: 0.001, Rows: 100
// SQLite Search Time: 0.004, Rows: 1000
// SQLite Search Time: UNAVAILABLE, Rows: 10000
// SQLite Search Time: UNAVAILABLE, Rows: 100000
// SQLite Search Time: UNAVAILABLE, Rows: 1000000

(async () => {
    for (const row of rows) {
        const dbName = `db_${row}rows`;
        const dbPath = path.join(__dirname, `src/tmp/${dbName}`);
        const csvPath = path.join(__dirname, `src/tmp/${row}rows.csv`);
        const database = await sqliteService.initDatabase(dbName);
        await sqliteService.createTable(database);
        const startInsertTime = Date.now();
        await sqliteService.insertFromCSV(database, csvPath);
        console.log(`SQLite Insert Time: ${(Date.now() - startInsertTime) / 1000}, Rows: ${row}`);
        const startTime = Date.now();
        await sqliteService.searchDuplicateContacts(database);
        console.log(`SQLite Search Time: ${(Date.now() - startTime) / 1000}, Rows: ${row}`);
        fs.unlinkSync(dbPath);
    }
})();

//working example
// (async () => {
//     const database = await sqliteService.initDatabase('db');
//     await sqliteService.createTable(database);
//     const dummyData = [
//         ['1', 'John', 'Doe', '111'],
//         ['2', 'Jane', 'Doe', '222'],
//         ['3', 'John', 'Doe', '111'],
//         ['4', 'Jane', 'Doe', '222'],
//         ['5', 'John', 'Doe', '126'],
//         ['6', 'Jane', 'Doe', '127'],
//         ['7', 'John', 'Doe', '128'],
//         ['8', 'Jane', 'Doe', '129'],
//         ['9', 'John', 'Doe', '130'],
//         ['10', 'Jane', 'Doe', '131'],
//     ]
//     const placeholders = dummyData.map(() => '(?, ?, ?, ?)').join(',');
//     await new Promise((resolve, reject) => {
//         database.run(
//             `INSERT INTO contacts (contact_id, first_name, last_name, vrm) VALUES ${placeholders}`,
//             dummyData.flat(),
//             (err) => {
//                 if (err) {
//                     reject(err);
//                 }
//                 resolve(null);
//             },
//         );
//     })
//     const records = await new Promise((resolve, reject) => {
//         database.all(`SELECT * FROM contacts`, (err, rows) => {
//             if (err) {
//                 reject(err);
//             }
//             resolve(rows);
//         })
//     })
//     console.log(records)
//     const res = await sqliteService.searchDuplicateContacts(database);
//     console.log(res);
//     fs.unlinkSync(path.join(__dirname, 'src/tmp/db'));
// })();
