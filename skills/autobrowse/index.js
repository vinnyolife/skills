#!/usr/bin/env node

/**
 * autobrowse - A skill for automated browser interactions using Browserbase
 * Allows AI agents to browse the web, take screenshots, and interact with pages
 */

import Browserbase from '@browserbasehq/sdk';
import { chromium } from 'playwright-core';
import dotenv from 'dotenv';

dotenv.config();

const bb = new Browserbase({
  apiKey: process.env.BROWSERBASE_API_KEY,
});

/**
 * Create a new browser session via Browserbase
 * @returns {Promise<{sessionId: string, browser: Browser, page: Page}>}
 */
async function createSession() {
  const session = await bb.sessions.create({
    projectId: process.env.BROWSERBASE_PROJECT_ID,
  });

  const browser = await chromium.connectOverCDP(session.connectUrl);
  const defaultContext = browser.contexts()[0];
  const page = defaultContext.pages()[0];

  return { sessionId: session.id, browser, page };
}

/**
 * Navigate to a URL and return page content
 * @param {string} url - The URL to navigate to
 * @returns {Promise<{title: string, content: string, screenshot: Buffer}>}
 */
async function browse(url) {
  const { sessionId, browser, page } = await createSession();

  try {
    console.log(`Navigating to: ${url}`);
    await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 30000 });

    const title = await page.title();
    const content = await page.evaluate(() => document.body.innerText);
    const screenshot = await page.screenshot({ fullPage: false });

    console.log(`Successfully loaded: ${title}`);

    return {
      sessionId,
      title,
      content: content.slice(0, 5000), // Limit content size
      screenshot,
      url: page.url(),
    };
  } finally {
    await browser.close();
  }
}

/**
 * Click an element on the page identified by a selector or text
 * @param {Page} page - Playwright page object
 * @param {string} selector - CSS selector or text to find
 */
async function clickElement(page, selector) {
  try {
    // Try CSS selector first
    await page.click(selector, { timeout: 5000 });
  } catch {
    // Fall back to text matching
    await page.getByText(selector).first().click({ timeout: 5000 });
  }
}

/**
 * Fill out a form field
 * @param {Page} page - Playwright page object
 * @param {string} selector - CSS selector for the input
 * @param {string} value - Value to type
 */
async function fillField(page, selector, value) {
  await page.fill(selector, value);
}

/**
 * Main skill handler - processes commands from stdin
 */
async function main() {
  const args = process.argv.slice(2);
  const command = args[0];
  const target = args[1];

  if (!command) {
    console.error('Usage: node index.js <command> <target>');
    console.error('Commands: browse <url>');
    process.exit(1);
  }

  if (!process.env.BROWSERBASE_API_KEY) {
    console.error('Error: BROWSERBASE_API_KEY is not set');
    process.exit(1);
  }

  if (!process.env.BROWSERBASE_PROJECT_ID) {
    console.error('Error: BROWSERBASE_PROJECT_ID is not set');
    process.exit(1);
  }

  switch (command) {
    case 'browse': {
      if (!target) {
        console.error('Error: URL is required for browse command');
        process.exit(1);
      }
      const result = await browse(target);
      console.log(JSON.stringify(result, null, 2));
      break;
    }
    default:
      console.error(`Unknown command: ${command}`);
      process.exit(1);
  }
}

export { browse, clickElement, fillField, createSession };

main().catch((err) => {
  console.error('Fatal error:', err);
  process.exit(1);
});
