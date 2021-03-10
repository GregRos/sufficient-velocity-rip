import {EbookData} from "./scrape-post";
import path from "path";
import Epub from "epub-gen";
import fetch from "node-fetch";
import {writeFileSync} from "fs";
export async function toEpub(ebookData: EbookData, output: string) {
    let image = ebookData.image;
    if (ebookData.image?.includes("http")) {
        const result = await fetch(ebookData.image);
        writeFileSync("./image.jpg", await result.buffer());
        image = "./image.jpg";
    }
    const epub = new Epub({
        title: ebookData.title,
        author: ebookData.author,
        cover: image,
        output,
        content: ebookData.chapters,
        appendChapterTitles: false
    });
    await epub;
}
