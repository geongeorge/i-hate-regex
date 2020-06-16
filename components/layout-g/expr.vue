<template>
  <post :id="id" :tags="tags">
    <div>
      <h1 class="text-2xl group">
        regex for 
        <span class="font-bold"><slot name="title" /></span>
      </h1>
      <p class="text-sm text-gray-500">
        <slot name="tagline" />
      </p>
      <div class="mt-8">
        <CodeBox :regex="regex" :flag="flag" @regexChanged="regexChanged" />
      </div>

      <MatchBox :regex="regex" :sample-text="matchText" />

      <div class="mt-8">
        <slot name="description" />
      </div>
      <div>
        <RegvizEmbed :regex="regex" :height="eHeight" />
      </div>
      <div class="mt-8">
        <div class="md:flex">
          <div class="flex-grow">
            <slot name="seconddescr" />
          </div>
          <div class="md:w-1/4 px-6 min-w-64 flex-col justify-center">
            <div class="font-bold text-gray-500 text-center">
              Our Sponsors
            </div>

            <div class="mx-auto w-48 mt-6 sponsor-effect">
              <a
                href="http://bit.ly/datree-ihr"
                rel="noopener nofollow"
                target="_blank"
              >
                <img
                  class="sponsor mx-auto"
                  src="https://assets.website-files.com/5d514f718e8309c01d798013/5d8b4657e7740e300666e3cc_datree_LOGO%20FLAT%20h-p-500.png"
                  alt="datree.io"
                />
              </a>
            </div>
            <div class="mx-auto mt-6 sponsor-effect">
              <!-- carbon ads -->
              <script id="_carbonads_js" async type="text/javascript" src="//cdn.carbonads.com/carbon.js?serve=CE7DL23E&placement=ihateregexio"></script>
            </div>
          </div>
        </div>
      </div>
    </div>
  </post>
</template>

<script>
//base layout
import post from '~/components/layout-g/base/post'

import CodeBox from '~/components/post-components/CodeBox'
import MatchBox from '~/components/post-components/MatchBoxBetter'

import RegvizEmbed from '~/components/post-components/RegvizEmbed'

export default {
  layout: 'post',
  components: {
    post,
    CodeBox,
    MatchBox,
    RegvizEmbed
  },
  props: {
    iregex: { default: / / }, //input regex
    iflag: { default: 'gm' }, //input flags
    imatchText: { default: ['lorem ipsum'] }, //input text
    eHeight: { default: 400 }, //embed regviz height
    tags: { default: () => [] }, // Arrays need to be defaulted to factory function
    id: { default: '' }
  },
  data() {
    return {
      regex: / /g,
      flag: '',
      matchText: []
    }
  },
  created() {
    this.regex = this.iregex
    this.flag = this.iflag
    this.matchText = this.imatchText
  },
  methods: {
    regexChanged(event) {
      this.regex = new RegExp(event.regex, event.flag)
    }
  }
}
</script>
<style>
.sponsor-effect {
  opacity: 0.7;
  transition: opacity 200ms ease-out;
}
.sponsor-effect:hover {
  opacity: 1;
}
.sponsor {
  width: 130px;
}
#carbonads {
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen-Sans, Ubuntu,
  Cantarell, "Helvetica Neue", Helvetica, Arial, sans-serif;
}

#carbonads {
  display: flex;
  max-width: 170px;
  margin: 0 auto;
  text-align: center;
  /* background-color: hsl(0, 0%, 98%); */
  /* box-shadow: 0 1px 4px 1px hsla(0, 0%, 0%, .1); */
}

#carbonads a {
  color: inherit;
  text-decoration: none;
}

#carbonads a:hover {
  color: inherit;
}

#carbonads span {
  position: relative;
  display: block;
  overflow: hidden;
}

#carbonads .carbon-wrap {
  /* display: flex; */
  width: 100%;
}

.carbon-img {
  display: block;
  margin: 0;
  line-height: 1;
}

.carbon-img img {
  display: block;
  margin: 0 auto;
  width:100%;
}

.carbon-text {
  font-size: 13px;
  padding: 10px;
  text-align: center;
  line-height: 1.5;
  text-align: left;
}

.carbon-poweredby {
  display: block;
  padding: 8px 10px;
  /* background: repeating-linear-gradient(-45deg, transparent, transparent 5px, hsla(0, 0%, 0%, .025) 5px, hsla(0, 0%, 0%, .025) 10px) hsla(203, 11%, 95%, .4); */
  text-align: center;
  text-transform: uppercase;
  letter-spacing: .5px;
  font-weight: 600;
  font-size: 9px;
  line-height: 1;
}
</style>