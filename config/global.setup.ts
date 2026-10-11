import { rimrafSync } from 'rimraf';
import { Utility } from '../utilities/utils';
import { Constants } from '../utilities/constants';

async function globalSetup(): Promise<void> {
    // Allure keeps history between runs only if the previous results are cleared first.
    rimrafSync('./allure-results/');
    rimrafSync(Constants.OUTPUT_FOLDER);
    rimrafSync(Constants.DOWNLOAD_FOLDER);
    const utility = new Utility();
    utility.makeDir(Constants.OUTPUT_FOLDER);
    utility.makeDir(Constants.DOWNLOAD_FOLDER);
    console.log(`Start Testing ${new Date().toLocaleString()} against ${Constants.BASE_URL}`);
}
export default globalSetup;
