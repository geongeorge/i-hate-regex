<template>
    <div>
        <a href="#">
        <h1 class="text-2xl group"><span class="group-hover:text-red-600">#</span> username
        </h1>
        </a>
        <p class="text-sm text-gray-500">match a valid username</p>
        <div class="mt-8">
                <CodeBox>/^[A-Za-z0-9]+(?:[ _-][A-Za-z0-9]+)*$/</CodeBox>
        </div>
        <div class="flex w-full flex-row">
            <div class="text-sm float-right mr-2">
                <a href="#" class="text-gray-500 hover:underline">show matches</a>
                </div>
        </div>
        <div class="tracking-wide text-gray-600 text-md font-bold mb-2" contenteditable="true">
            Lorem ipsum dolor sit, amet consectetur adipisicing elit. Aspernatur, cupiditate.
        </div>
        
        

      <p class="mt-8">
          Lorem ipsum dolor sit amet consectetur, adipisicing elit. Possimus rerum sunt maiores animi, iure eum nulla voluptates. Quos ducimus ipsum tenetur itaque? Eligendi natus porro fuga nulla atque ratione autem omnis, doloribus amet architecto earum. Error porro dignissimos fugiat tenetur?
      </p>
    </div>
</template>

<script>
import Logo from '~/components/utils/Logo'
import CodeBox from '~/components/post-components/CodeBox'

export default {
    layout:"post",
    components: {
        Logo,
        CodeBox
    }
}
</script>

<style>

</style>
