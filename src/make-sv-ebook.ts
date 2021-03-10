import {sfvEbook, SufficientVelocityConfig} from "./scrape-post";
import {toEpub} from "./to-epub";
const image = "https://forums.sufficientvelocity.com/data/threadmark-index-icons/l/48/48498.jpg?1611524822";
async function run() {
    const commonCfg = {
        author: "yrsillar",
        maxPosts: Infinity,
        image
    } as SufficientVelocityConfig;
    await toEpub(await sfvEbook({
        ...commonCfg,
        startingUrl: "https://forums.sufficientvelocity.com/threads/threads-of-destiny-eastern-fantasy-sequel-to-forge-of-destiny.51431/5/reader",
        title: "Threads of Destiny - Sidestory"
    }), "./Threads of Destiny - Sidestory.epub");


}

run();
