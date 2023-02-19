<div align="center">
  
  
  
  <h1>
    iHateRegex 😈
  </h1>
  
  <p align="center">
    <a href="https://github.com/geongeorge/i-hate-regex/pull/new" target="_blank">
      <img src="https://img.shields.io/badge/PRs%20-welcome-brightgreen.svg" alt="PRs Welcome" />
    </a>
      <img src="https://github.com/geongeorge/i-hate-regex/workflows/Node.js%20CI/badge.svg" alt="Nodejs CI" />
    <a title="Chat on Telegram" href="https://t.me/ihateregex"> <img src="https://img.shields.io/badge/chat-Telegram-blueviolet?logo=Telegram"/>
    </a>
  </p>
  <p>
<a href="https://opencollective.com/ihateregex" target="_blank">
<img src="https://opencollective.com/webpack/donate/button@2x.png?color=blue" width=180>
</a>
</p>
  <a href="https://ihateregex.io"><img src="https://i.imgur.com/mHuTAzy.png" width=600></a>
  
  <p>
    <strong>don't just use; understand.</strong>
</p>

  <p>
    <strong><a href="https://ihateregex.io">iHateRegex.io</a></strong> - a regex cheatsheet for the haters.
  </p>

  <p>
   Chat with us on <a href="https://t.me/ihateregex" target="_blank">Telegram</a>

</p>
</div>



## Features 😎

- [x] Visual representation of regular expressions
- [x] Matched strings - the Testing area
- [x] Embed regular expression visualization on your sites
- [x] Regex code highlighting and validation
- [x] Regex description with markdown support
- [ ] [Playground page](https://ihateregex.io/playground) where you can create your own expression and link to it.
- [ ] User login and save regex

## Setup 🚀

1. Install [yarn](https://yarnpkg.com/)

2. [Clone](https://help.github.com/en/github/creating-cloning-and-archiving-repositories/cloning-a-repository) this repo

3. Install dependencies ⚙️

  ``` bash
  $ yarn install

  ```
4. Test on localhost 🛠
  ``` bash
  # serve with hot reload at localhost:3600
  $ yarn dev
  ```
5. Build and Start nuxt server 🚀
  ``` bash
  # build for production and launch server
  $ yarn build
  $ yarn start
  ```

This project is built with Nuxt.js 🙌

For detailed explanation on how things work, check out [Nuxt.js docs](https://nuxtjs.org).


## Contribute Regex 🙏

Contribute to this project and make this the largest collection of useful expressions 😍

You can also submit regex via this [google form](https://forms.gle/Cwo3VupujQJzeoYQ9)

### To contribute:

1. Add your regex to `/static/regex/data.json`

<details>
<summary>Show sample JSON</summary>

```json
{
        "id": "username",
        "title": "username",
        "tagline": "match a username",
        "description": "Alphanumeric string that may include _ and - having a length of 3 to 16 characters.",
        "regex": "^[a-z0-9_-]{3,15}$",
        "flag": "gm",
        "matchText": [
            "lorem",
            "ipsum",
            "gr3at",
            "a",
            "ab",
            "abcd",
            "abcde",
            "john doe",
            "johnny",
            "abcdefghijklmnopqrst"
        ],
        "cheatRegex": [
            "/^/",
            "/$/",
            "/[a-zA-Z0-9]/",
            "/(hello){1,3}/"
        ],
        "embedHeight": 300,
        "tags" : ["name", "slug"]
    },
```

</details>

<details>
<summary>Show JSON properties</summary>

| Property | Definition |
|------|------------|
|  id|  this is the slug and also the short name of the regex. cannot contain spaces and only contain url-safe characters|
|  title |  Title of the page. |
| tagline  |  Tagline |
| description  | First line under the tagline and also the meta description |
|  regex |  The actual regex string |
| flag  |  regex flags associated with the expression. eg; g |
| matchText  | Array(line by line) of strings to be included in the string matching are  |
|  cheatRegex | refer `static/regex/cheatsheet.json` and see what all cheats are relevent to this expression. (you can also add your own cheats into cheatsheet.json and refer to that) |
|  embedHeight | Height in pixels of the regex visualization embed  |
| tags  | tags related to the expression (to be used later)  |

</details>

2. Create a markdown file in `/static/regex/markdown/` named `<regex-id>.md` for longer description and explanation

    *&lt;regex-id&gt; is the **id** from **data.json***


That's it 🙌 Go ahead and shoot a new pull request✨✨

### Descriptions

There are 2 descriptions for each regex. 

- One is the **description** property inside `/static/regex/data.json`. 

    - This is used for page **meta description** as well.
    - This is the **first description**

- Second is a dedicated **markdown file** in `/static/regex/markdown/<file>.md`

  - This should explain how the expression works in detail.
  - This is the **long description**

  <div align="center">
  <img src="https://i.imgur.com/fRiJeql.png" width="600">
  </div>


| Property | Definition | example |
|------|------------|------------|
| **description** property inside `data.json` | This should explain about what the target match is in a few lines. It should not contain any html or markdown |A username is a unique identifier given to accounts in websites and social media |
|dedicated **markdown file**|Explain about the expression and how it works| ip addresses are of the range 0.0.0.0 - 255.255.255.255. The expression matches the ....(more)|

## Sponsors 💖

<a href="http://bit.ly/datree-ihr-gh" target="_blank">
<img width="190" src="https://assets.website-files.com/5d514f718e8309c01d798013/5d8b4657e7740e300666e3cc_datree_LOGO%20FLAT%20h-p-500.png">
</a>

<p>
<a href="https://opencollective.com/ihateregex">Donate via Opencollective</a>
</p>


## Credits

- The visual demo is built with: [regexper](https://gitlab.com/javallone/regexper-static
)
