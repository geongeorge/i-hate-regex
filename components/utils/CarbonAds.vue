<template>
  <div ref="carbonads" class="Carbon" />
</template>

<script>
export default {
    mounted() {
        this.addCarbonAds()
    },
    methods: {
        addCarbonAds() {
            if (this.$refs.carbonads) {
                const script = document.createElement('script')
                script.setAttribute('type', 'text/javascript')
                script.setAttribute('src', '//cdn.carbonads.com/carbon.js?serve=CE7DL23E&placement=ihateregexio')
                script.setAttribute('id', '_carbonads_js')
                this.$refs.carbonads.appendChild(script)
            }
            }
    }
}
</script>

<style scoped>
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