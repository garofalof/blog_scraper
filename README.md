# blog_scraper

This is a web scraper built with Puppeteer, a Node.js library for controlling headless Chrome or Chromium browser. It navigates to a given URL and attempts to find a blog section or page, returning a list of blog post links if successful.

To run the scraper, follow these steps:

- Clone down the repository to your local machine.
- Open a terminal window and navigate to the project folder.
- Run `npm install` to install the required dependencies.
- Run `node index.js` to start the scraper. It will attempt to navigate to the blog section of the URL specified in the url variable in the main function of the `index.js` file.
- If successful, the scraper will write a JSON file containing the input URL, the URL of the blog section, and a list of links to blog posts found on that page.
- The JSON file will be written to the examples folder in the project directory. The filename will be based on the domain name of the input URL.

Note that the scraper uses several Puppeteer plugins to enhance its stealth and ad-blocking capabilities. If you encounter any issues, please make sure that you have allowed the necessary permissions and disabled any ad-blocking software on your machine.
