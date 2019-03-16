import {parse as csvFileParse, ParseError} from 'papaparse';

export interface CsvData {
    fields: string[];
    data: {[key: string]: string}[];
}

export const csvLoader = {
    loadCsv(file: File): Promise<CsvData> {
        return new Promise(function(resolve, reject) {
            csvFileParse(file, {
                skipEmptyLines: true,
                header: true,
                complete: results => {
                    console.log(`Loaded: ${results.data.length} rows.`);
                    return resolve({fields: results.meta.fields, data: results.data});
                },
                error: (err: ParseError) => reject(new Error(`${err.type}: ${err.message} at ln ${err.row}`)),
            });
        });
    }
};
