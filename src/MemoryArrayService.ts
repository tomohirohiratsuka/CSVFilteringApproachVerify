import fs from "fs";
import {ExtractedDuplicateContacts} from "@src/types";

export class MemoryArrayService {
    readCSV(filePath: string) {
        const csvData = fs.readFileSync(filePath, 'utf8');
        const records = csvData.split('\n');
        const recordIds = []
        for (let i = 1; i < records.length; i++) {
            // console.log('i:', i);
            recordIds.push(records[i].split(',')[0]);
        }
    }

    searchDuplicateContacts(filePath: string) {
        const csvData = fs.readFileSync(filePath, 'utf8');
        const records = csvData.split('\n');
        const header = records[0].split(',');
        const recordIdIndex = header.findIndex((column) => column === 'Record ID');
        const duplicates: ExtractedDuplicateContacts = [];


        for (let i = 1; i < records.length; i++) {
            const target = records[i].split(',');
            const res = this.searchContact(records, i, this.matchFunction);
            if (res.length) {
                res.push(target[recordIdIndex]);
                duplicates.push(res);
            }
        }

        const uniqueDuplicatesStr = new Set(
            duplicates.map((duplicate) => duplicate.sort().join(',')),
        );
        const uniqueDuplicates = Array.from(uniqueDuplicatesStr).map((duplicate) =>
            duplicate.split(','),
        );
        return uniqueDuplicates;
    }

    searchContact(
        records: string[],
        targetIndex: number,
        matchFunction: (target: string[], compare: string[]) => boolean,
    ): string[] {
        const target = records[targetIndex].split(',');
        const res: string[] = [];
        for (let i = 1; i < records.length; i++) {
            if (i === targetIndex) {
                continue;
            }
            const compare = records[i].split(',');
            if (matchFunction(target, compare)) {
                res.push(compare[0]);
            }
        }
        return res;
    }

    matchFunction(target: string[], compare: string[])  {
        const header = ["Record ID","First Name","Last Name","VRM"]
        const firstNameIndex = header.findIndex(
            (column) => column === 'First Name',
        );
        const lastNameIndex = header.findIndex((column) => column === 'Last Name');
        const vrmIndex = header.findIndex((column) => column === 'VRM');
        const isSameFullName =
            target[firstNameIndex] === compare[firstNameIndex] &&
            target[lastNameIndex] === compare[lastNameIndex];
        if (!isSameFullName) {
            return false;
        }
        return target[vrmIndex] === compare[vrmIndex];
    }
}