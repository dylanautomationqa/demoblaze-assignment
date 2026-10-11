import fs from 'fs';
import { rimrafSync } from 'rimraf';

export class Utility {

    /**
     * Create a folder
     * @param folderPath
     */
    makeDir(folderPath: string): void {
        fs.mkdir(folderPath, { recursive: true }, (err: any) => {
            if (err) {
                console.log(err);
            }
        });
    }

    /**
     * Delete file
     * @param filePath
     */
    deleteFile(filePath: string): void {
        console.log(`Delete file: ${filePath}`);
        try {
            rimrafSync(filePath);
        } catch (error: any) {
            console.log(error);
        }
    }

}
