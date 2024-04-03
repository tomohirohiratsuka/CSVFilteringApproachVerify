import {PostgresqlService} from "@src/PostgresqlService";
import path from "path";

const rows = [100, 1000, 10000, 100000, 1000000];
const postgresqlService = new PostgresqlService();

/**
 * Postgres Create Table performance
 */
//Postgres Create Table Time: 0.033
// (async () => {
//     const client = await postgresqlService.initClient();
//     const startTime = Date.now();
//     await postgresqlService.createTableAndIndexes(client);
//     console.log('Postgres Create Table Time:', (Date.now() - startTime) / 1000);
//     await client.end();
// })();

/**
 * Postgres Insert performance
 */
// Postgres Insert Time: 0.009, Rows: 100
// Postgres Insert Time: 0.017, Rows: 1000
// Postgres Insert Time: 0.106, Rows: 10000
// Postgres Insert Time: 1.007, Rows: 100000
// Postgres Insert Time: 13.165, Rows: 1000000
// (async () => {
//     const client = await postgresqlService.initClient();
//     await postgresqlService.createTableAndIndexes(client);
//     for (const row of rows) {
//         const csvPath = path.join(__dirname, `src/tmp/${row}rows.csv`);
//         const startTime = Date.now();
//         await postgresqlService.insertFromCSV(client, csvPath);
//         console.log(`Postgres Insert Time: ${(Date.now() - startTime) / 1000}, Rows: ${row}`);
//         await postgresqlService.clearTable(client);
//     }
//     await client.end();
// })();

/**
 * Postgres Search performance
 */
// Postgres Search Time: 0.004, Rows: 100
// Postgres Search Time: 0.001, Rows: 1000
// Postgres Search Time: 0.005, Rows: 10000
// Postgres Search Time: 0.045, Rows: 100000
// Postgres Search Time: 3.088, Rows: 1000000
(async () => {
    const client = await postgresqlService.initClient();
    await postgresqlService.createTableAndIndexes(client);
    for (const row of rows) {
        const csvPath = path.join(__dirname, `src/tmp/${row}rows.csv`);
        await postgresqlService.insertFromCSV(client, csvPath);
        const startTime = Date.now();
        await postgresqlService.searchDuplicateContacts(client);
        console.log(`Postgres Search Time: ${(Date.now() - startTime) / 1000}, Rows: ${row}`);
        await postgresqlService.clearTable(client);
    }
    await client.end();
})();
