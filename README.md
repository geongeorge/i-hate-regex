<div align="center">
  
  <h1>
    iHateRegex
  </h1>
  <p>
    <strong>a regex cheatsheet for the haters</strong>
  </p>
  <a href="https://ihateregex.io"><img src="https://i.imgur.com/YvpuluX.png" width=400></a>
  
  <p>
    <strong>don't just use; understand.</strong>
</p>
<p>
    <a href="https://ihateregex.io">iHateRegex.io</a>

</p>
</div>

## Contribute Regex

To contribute simply add your regex to `static/regexdata.json`

```json
{
        "id": "username",
        "title": "username",
        "tagline": "match a username",
        "firstdescr": "Alphanumeric string that may include _ and - having a length of 3 to 16 characters.",
        "seconddescr": "This expression can be used to find or validate a username field. You may edit the regex to your liking for number of characters and/or types of values",
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

| Property | Definition |
|------|------------|
|  id|  this is the slug and also the short name of the regex. cannot contain spaces and only contain url-safe characters|
|  title |  Title of the page. |
| tagline  |  Tagline |
| firstdescr  | First line under the tagline and also the meta description  |
|  seconddescr | Longer description  |
|  regex |  The actual regex string |
| flag  |  regex flags associated with the expression. eg; g |
| matchText  | Array(line by line) of strings to be included in the string matching are  |
|  cheatRegex | refer `static/cheatsheet.json` and see what all cheats are relevent to this expression. (you can also add your own cheats into cheatsheet.json and refer to that) |
|  embedHeight | Height in pixels of the regex visualization embed  |
| tags  | tags related to the expression (to be used later)  |

## Build Setup

``` bash
# install dependencies
$ yarn install

# serve with hot reload at localhost:3000
$ yarn dev

# build for production and launch server
$ yarn build
$ yarn start

# generate static project
$ yarn generate
```

For detailed explanation on how things work, check out [Nuxt.js docs](https://nuxtjs.org).
