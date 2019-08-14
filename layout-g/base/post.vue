<template>
  <div class="min-h-screen md:flex">
    <div class="flex-none w-full md:w-1/5 bg-gray-200 text-gray-700">
        <div class="text-center pt-2">
          <a href="#" class="group">
            <h2 class="text-2xl">i<span class="font-bold group-hover:text-red-600">Hate</span>Regex</h2>
          </a>
        </div>
    </div>
    <div class="flex-1 bg-white text-gray-700">
        <div class="container mx-auto md:mt-5 lg:mt-20 px-2 max-w-4xl text-left">
            <slot></slot>
        </div>
    </div>
    </div>
</template>

<style>
html {
  font-family: 'Source Sans Pro', -apple-system, BlinkMacSystemFont, 'Segoe UI',
    Roboto, 'Helvetica Neue', Arial, sans-serif;
  font-size: 16px;
  word-spacing: 1px;
  -ms-text-size-adjust: 100%;
  -webkit-text-size-adjust: 100%;
  -moz-osx-font-smoothing: grayscale;
  -webkit-font-smoothing: antialiased;
  box-sizing: border-box;
}

</style>
