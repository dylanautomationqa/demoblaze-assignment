
async function globalTeardown() : Promise<void>{
    console.log('End Testing', new Date().toLocaleString());
}

export default globalTeardown;