const axios = require("axios");
const jsdom = require("jsdom");
const { JSDOM } = jsdom;

async function WebScrape(cutOffDate) {
  try {
    const articles = [];
    // Save the promise from the GET request. using axios -  https://www.npmjs.com/package/axios
    url = "https://www.vg.no/";
    const response = await axios.get(url);

    htmldata = response.data; //Extracting the html data
    const dom = new JSDOM(htmldata); //putting the html into a dom
    const AllArticlesInhtml = dom.window.document.querySelectorAll("article"); //Returns a list of the <article> elements in the html

    AllArticlesInhtml.forEach((article) => {
      //selects the script tag within each article
      const scriptElement = article.querySelector("script.tracking-data");
      const trackingDataJSON = scriptElement?.textContent || null; //extracts the json in the script tag

      let id = null;
      let title = null;
      let publishedDate = null;

      // Gets the title and publishedDate from the JSON object
      if (trackingDataJSON) {
        try {
          const data = JSON.parse(trackingDataJSON);
          title = data.teaserText;
          publishedDate = data?.changes?.published || null;
        } catch (error) {
          console.error("Error parsing tracking data:", error);
        }
      }

      //first checks if publishedDate exists to not get error
      //Then checks if the Date is newer then the passed date to this function, if it is never it will push it to the articles list
      if (publishedDate && new Date(publishedDate) >= cutOffDate) {
        articles.push({
          title: title,
          publishedDate: publishedDate,
        });
      }
    });

    //sorts the articles list based on the publicationTime in decending order
    articles.sort((articleA, articleB) => {
      const dateA = new Date(articleA.publishedDate);
      const dateB = new Date(articleB.publishedDate);
      return dateB - dateA;
    });

    //logs message each time it scrapes
    console.log(
      "Performing scrape for new articles at ",
      cutOffDate.toLocaleString()
    );

    //logs the article list
    articles.forEach((article) => {
      console.log("Title:", article.title);
      console.log("Publication Time: ", article.publishedDate);
      console.log("-----------------------------------------");
    });
  } catch (error) {
    console.error("Error:", error);
  }
}

const scrapeInterval = 60000; // 1 minute
var cutOffDate = new Date(0); //innitially sets the cutOffDate to 1/1/1970

async function scrapePeriodically() {
  while (true) {
    await WebScrape(cutOffDate);
    await new Promise((response) => setTimeout(response, scrapeInterval));
    cutOffDate = new Date();
  }
}

scrapePeriodically();

/*
Jeg valgte Javascript fordi jeg er kjent med språket og jeg vet det finnes 
gode biblioteker for å håndtere html data.

*/