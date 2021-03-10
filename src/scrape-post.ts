import $ from "cheerio";
import fetch from "node-fetch";
import Cheerio = cheerio.Cheerio;
import urijs from "urijs";

export interface Chapter {
    title: string;
    data: string;
}

export interface EbookData {
    title: string;
    chapters: Chapter[];
    image: string;
    author: string;
}

export interface SufficientVelocityConfig {
    startingUrl: string;
    title?: string;
    image?: string;
    author?: string;
    maxPosts: number;
}

export async function sfvEbook(cfg: SufficientVelocityConfig): Promise<EbookData> {
    const info = await getBookInfo(cfg.startingUrl);
    const chapters = [] as Chapter[];
    console.log(`Scraping ${cfg.title}`);
    for await (let post of getChapters({...info, ...cfg} as any)) {
        console.log(`Scraped ${post.title}`);
        chapters.push(post);
    }
    return {
        ...info,
        title: cfg.title,
        image: cfg.image,
        author: cfg.author,
        chapters
    };
}

export async function getBookInfo(url: string) {
    const req = await fetch(url);
    const html = await req.text();
    const ch = $.load(html);
    const author = ch(".p-description .username").text();
    return {
        author
    }
}

export async function *getChapters(cfg: SufficientVelocityConfig) {
    let i = 0;
    for await (let post of scrapePages(cfg.startingUrl)) {
        if (i > cfg.maxPosts) return;
        post.body.find("img[src^='data']").remove();
        if (post.author !== cfg.author) {
            post.threadmark += ` - ${post.author}`;
        }
        yield {
            title: post.threadmark,
            data: post.body.html()
        } as Chapter
        i++;
    }
}

export async function *scrapePages(url: string) {
    const req = await fetch(url);
    const html = await req.text();
    const ch = $.load(html);
    const lastPage = ch(".pageNav-main").first().find(".pageNav-page:last-child").text();
    for (let i = 1; i <= +lastPage; i++) {
        const curPageUrl = `${url}/page-${i}`;
        yield* scrapePage(curPageUrl);
    }
}

export async function *scrapePage(url: string) {
    const req = await fetch(url);
    const html = await req.text();
    const ch = $.load(html);
    const posts = ch(".message--post").toArray();
    for (let post of posts) {
        yield scrapePost($(post));
    }
}

interface Post {
    threadmark: string;
    author: string;
    body: Cheerio;
}

export function scrapePost(post: Cheerio) {
    const threadmark = post.find(".threadmarkLabel").text();
    const author = post.find(".message-userDetails .username").text();
    const body = post.find(".bbWrapper");
    let thickLine = "=".repeat(15);
    const sectionBreak = `<div>${thickLine}</div>`;
    const titleLine = `<div>${"-".repeat(15)}</div>`;
    const spoiler = body.find(".bbCodeSpoiler")
    spoiler.before(sectionBreak).after(sectionBreak).attr(
        "style", "font-size:8px !important"
    );
    spoiler.find("button").after(titleLine);
    return <Post>{
        threadmark,
        author,
        body: body
    }
}
