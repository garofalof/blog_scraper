// async function getData(url) {
//   console.log("Function called, declaring puppeteer variables.\n");

//   const PUPPETEER_ARGS = ["--no-sandbox", "--disable-setuid-sandbox"];
//   const puppeteer = require("puppeteer-extra");
//   const StealthPlugin = require("puppeteer-extra-plugin-stealth");
//   const AdblockerPlugin = require("puppeteer-extra-plugin-adblocker");
//   const AnonymizeUAPlugin = require("puppeteer-extra-plugin-anonymize-ua")();

//   console.log("Variables declared, applying to puppeteer instance.\n");

//   puppeteer.use(StealthPlugin());
//   puppeteer.use(AdblockerPlugin({ blockTrackers: true }));
//   puppeteer.use(AnonymizeUAPlugin);

//   console.log("Variables applied, launching browser.\n");

//   const browser = await puppeteer.launch({
//     headless: true,
//     args: PUPPETEER_ARGS,
//   });

//   console.log("Browser launched, attempting to navigate to modified URLs.\n");

//   let page;
//   let successURL;
//   const modifiedUrls = [
//     url.replace("https://", "https://blogs."),
//     url.replace("https://", "https://blog."),
//     url + "/blogs",
//     url + "/blog",
//   ];
//   let success = false;
//   for (let i = 0; i < modifiedUrls.length; i++) {
//     const modifiedUrl = modifiedUrls[i];
//     console.log(`Trying ${modifiedUrl}...`);
//     try {
//       page = await browser.newPage();
//       const response = await page.goto(modifiedUrl, {
//         waitUntil: "domcontentloaded",
//       });
//       if (response && response.status() === 200) {
//         console.log(`Success! Navigated to ${modifiedUrl}.`);
//         success = true;
//         successURL = await page.url();
//         successURL = successURL.endsWith('/') ? successURL : successURL + '/';
//         break;
//       }
//       console.log(`Failed to navigate to ${modifiedUrl}.`);
//       await page.close();
//     } catch (error) {
//       console.error(`Error while navigating to ${modifiedUrl}: ${error}`);
//       await page.close();
//     }
//   }

//   if (!success) {
//     console.log(
//       "Failed to navigate to any modified URLs, using input URL instead."
//     );
//     try {
//       page = await browser.newPage();
//       const response = await page.goto(url, { waitUntil: "domcontentloaded" });
//       if (response && response.status() === 200) {
//         console.log(`Success! Navigated to ${url}.`);
//         successURL = await page.url();
//         successURL = successURL.endsWith('/') ? successURL : successURL + '/';
//       } else {
//         console.log(`Failed to navigate to ${url}.`);
//       }
//     } catch (error) {
//       console.error(`Error while navigating to input URL ${url}: ${error}`);
//     }
//   }

//   console.log("Getting all <a> tags on the page.\n");

//   const blogPosts = [];
//   const aTags = await page.$$("a");

//   console.log("Getting all valid blog URLs.\n");

//   for (let tag of aTags) {
//     const href = await tag.evaluate(element => element.href);

//     if (href.includes('blog')) {
//       blogPosts.push(href);
//     }
//   }

//   const uniquePosts = [...new Set(blogPosts)];
//   const result = {};

//   console.log("Setting result object.");

//   result['inputUrl'] = url;
//   result['blogUrl'] = successURL;
//   result['blogPosts'] = uniquePosts;

//   console.log("Closing browser and returning result.");

//   await browser.close();

//   return result;
// }

// async function main() {

//   console.log("Calling main.");

//   const url = "https://bubble.io";
//   const domainName = url.substring(8, url.indexOf("."));
//   const result = await getData(url);

//   console.log("Writing result object to JSON file.");
//   const formattedResult = JSON.stringify(result, null, 2);
//   const fs = require('fs');

//   fs.writeFile(`${domainName}.json`, formattedResult, (err) => {
//     if (err) {
//       console.error(err);
//       return;
//     }
//     console.log('File has been written successfully.');
//   });
// }

// main();

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
