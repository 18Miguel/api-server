import { Bootstrap } from './Bootstrap';

async function main() {
    const app = await Bootstrap();
    
    await app.listen(3000);
}

main();
