import { Bootstrap } from './Bootstrap';

async function main() {
    const app = await Bootstrap();
    
    await app.listen(5000);
}

main();
