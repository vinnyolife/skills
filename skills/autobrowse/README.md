# autobrowse

A skill that lets Claude autonomously browse the web using Browserbase. Give it a goal and it'll navigate, click, type, and extract information to get the job done.

## Setup

1. Install dependencies:

```bash
npm install
```

2. Copy the example env file and fill in your keys:

```bash
cp .env.example .env
```

You'll need:
- `BROWSERBASE_API_KEY` — get one at [browserbase.com](https://browserbase.com)
- `BROWSERBASE_PROJECT_ID` — found in your Browserbase dashboard
- `ANTHROPIC_API_KEY` — get one at [console.anthropic.com](https://console.anthropic.com)

## Usage

Run the skill with a goal:

```bash
node index.js "Find the current price of Bitcoin on CoinGecko"
```

Or import it in your own code:

```js
import { autobrowse } from './index.js';

const result = await autobrowse({
  goal: 'Find the top 3 trending repos on GitHub today',
  maxSteps: 10,
});

console.log(result);
```

## How it works

1. Spins up a remote browser session via Browserbase
2. Takes a screenshot of the current page
3. Sends the screenshot + goal to Claude
4. Claude decides what action to take next (click, type, scroll, navigate, done)
5. Executes the action using Playwright
6. Repeats until Claude says it's done or `maxSteps` is reached

## Options

| Option | Default | Description |
|--------|---------|-------------|
| `goal` | required | What you want the browser to accomplish |
| `startUrl` | `https://google.com` | Where to start browsing |
| `maxSteps` | `15` | Max number of actions before giving up |
| `debug` | `false` | Log each step and save screenshots locally |

## Example goals

- `"Search for 'climate change solutions' and summarize the first 3 results"`
- `"Go to news.ycombinator.com and tell me the top 5 stories"`
- `"Find the cheapest flight from NYC to London next month on Google Flights"`
- `"Check if producthunt.com has any AI tools trending today"`

## Notes

- Each session uses a real cloud browser, so it works on sites that block headless browsers
- Sessions are automatically cleaned up after the skill finishes
- Complex goals may need a higher `maxSteps` value
