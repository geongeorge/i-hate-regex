<template>
  <div>
    <div class="flex bg-gray-300 mt-6 h-24 w-full shadow-inner">
      <div class="flex-auto">
        <div class="flex flex-col h-full w-full justify-center items-left ml-4">
          <div class="px-2 text-3xl text-gray-400">
            i<span class="font-bold">Hate</span>Regex
          </div>
          <div class="px-2 text-gray-500">
            by
            <a href="https://geongeorge.com/" class="underline" target="_blank"
              >geon</a
            >
          </div>
        </div>
      </div>
      <div class="flex-initial">
        <div class="flex flex-col h-full w-full justify-center mr-4">
          <h2 class="text-gray-500">
            Sponsors:
          </h2>
          <a
            href="http://bit.ly/datree-ihr"
            rel="noopener nofollow"
            target="_blank"
          >
            <img
              class="sponsor"
              src="https://assets.website-files.com/5d514f718e8309c01d798013/5d8b4657e7740e300666e3cc_datree_LOGO%20FLAT%20h-p-500.png"
              alt="datree.io"
            />
          </a>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {}
</script>

<style>
.sponsor {
  width: 120px;
  filter: grayscale(100%);
  opacity: 0.7;
  transition: filter opacity 200ms ease-out;
}
.sponsor:hover {
  filter: grayscale(10%);
  opacity: 1;
}
</style>
