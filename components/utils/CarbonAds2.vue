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

<style>
#carbonads {
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen-Sans, Ubuntu,
  Cantarell, "Helvetica Neue", Helvetica, Arial, sans-serif;
}

#carbonads {
  display: flex;
  width: 330px;
  max-width: 100%;
  background-color: transparent;
  z-index: 100;
  opacity: 0.7;
  transition: opacity 200ms ease-out;
}

#carbonads:hover {
  opacity: 1;
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
  display: flex;
}

.carbon-img {
  display: block;
  margin: 0;
  line-height: 1;
  max-width: 120px;
}

.carbon-img img {
  display: block;
  max-width: 120px!important;
}

.carbon-text {
  font-size: 13px;
  padding: 10px;
  line-height: 1.5;
  text-align: left;
}

.carbon-poweredby {
  position: absolute;
  bottom: 0;
  padding-top: 3px;
  left: 146px;
  color: #999 !important;
  text-transform: uppercase;
  white-space: nowrap;
  letter-spacing: .5px;
  font-weight: 500;
  font-size: 10px;
}

</style>