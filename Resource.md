# Resource.md
## Get started with developing extensions

### What are extensions ?
Chrome extensions are essentially web apps that interact with the browser's internal APIs. They enhance the browsing experience by customizing the user interface, observing browser events, and modifying the web.

### How are they built ?
You can build extensions using the same web technologies that are used to create web applications: HTML, CSS, and JavaScript.

## Developing extensions
Developing a Chrome extension is the process of building a system of interconnected components that interact with the browser and web pages.

### Core Structural Components
Every extension is composed of several parts that play distinct roles:

**Manifest (manifest.json):** The only required file. It records metadata, defines resources, declares permissions, and identifies which files to run.

**Service Workers (Background Scripts):** These handle browser events like closing tabs or removing bookmarks. They run in the background and do not have access to the DOM.

**Content Scripts:** These run JavaScript in the context of a specific web page and are the only part that can interact with the page's HTML/DOM.

**Toolbar Actions (Popup):** Executes code and shows a custom UI when a user clicks the extension icon.

**Side Panel:** Allows for a persistent custom UI displayed in the browser's side panel.

This is an excellent source to study more about the same : https://developer.chrome.com/docs/extensions/get-started/

## Working on existing extensions
Opening Developer Mode is the essential first step for any extension developer. It allows you to load your "unpacked" extension folder directly into Chrome so you can test your code in real-time.

Here is the step-by-step process: 
- Access the Extensions Page
Open your Chrome browser and use one of these two methods:
  - Via the Address Bar: use ```chrome://extensions/``` in your browser
  - Via the Menu: Click the three dots (top right) -> Extensions -> Manage Extensions.

- Toggle the Developer Mode Switch

  - Once you are on the Extensions page, toggle the Developer Mode Switch to turn it on.
  - Select your extension's folder (containing manifest.json) to install it. Manually force all installed extensions to check for updates. In this case , you will get the folder after cloning our repository.