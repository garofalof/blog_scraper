const puppeteer = require("puppeteer-extra");
const StealthPlugin = require("puppeteer-extra-plugin-stealth");
const AdblockerPlugin = require("puppeteer-extra-plugin-adblocker");
const AnonymizeUAPlugin = require("puppeteer-extra-plugin-anonymize-ua")();

puppeteer.use(StealthPlugin());
puppeteer.use(AdblockerPlugin({ blockTrackers: true }));
puppeteer.use(AnonymizeUAPlugin);

async function getData(url) {
  const browser = await puppeteer.launch({
    headless: true,
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  });
  let successURL, page;

  const modifiedUrls = [
    url.replace("https://", "https://blogs."),
    url.replace("https://", "https://blog."),
    `${url}/blogs`,
    `${url}/blog`,
  ];

  for (const modifiedUrl of modifiedUrls) {
    console.log(`Trying ${modifiedUrl}...`);
    try {
      page = await browser.newPage();
      const response = await page.goto(modifiedUrl, {
        waitUntil: "domcontentloaded",
      });
      if (response && response.status() === 200) {
        console.log(`Success! Navigated to ${modifiedUrl}.`);
        successURL = (await page.url()).replace(/\/?$/, "/");
        break;
      }
      console.log(`Failed to navigate to ${modifiedUrl}.`);
      await page.close();
    } catch (error) {
      console.error(`Error while navigating to ${modifiedUrl}: ${error}`);
      await page.close();
    }
  }

  if (!successURL) {
    console.log(`Failed to navigate to any modified URLs.`);

    return { inputUrl: url, blogUrl: null, blogPosts: null };
  }

  const blogPosts = await page.$$eval("a[href*=blog]", (tags) => [
    ...new Set(tags.map((tag) => tag.href)),
  ]);

  await browser.close();

  return { inputUrl: url, blogUrl: successURL, blogPosts };
}

async function main() {
  console.log("Calling main.");
  const url = "https://alchemy.com";
  const domainName = url.substring(8, url.indexOf("."));
  const result = await getData(url);

  console.log("Writing result object to JSON file.");
  const fs = require("fs").promises;

  try {
    await fs.writeFile(`./examples/${domainName}.json`, JSON.stringify(result, null, 2));
    console.log("File has been written successfully.");
  } catch (error) {
    console.error(error);
  }
}

main();
