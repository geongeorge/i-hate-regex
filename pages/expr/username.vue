<template>
    <div>
        <a href="#">
        <h1 class="text-2xl group"><span class="group-hover:text-red-600">#</span> username
        </h1>
        </a>
        <p class="text-sm text-gray-500">match a valid username</p>
        <div class="mt-8">
                <CodeBox>{{regex}}</CodeBox>
        </div>
        
        <MatchBox :regex="regex"></MatchBox>
        
        

      <p class="mt-8">
          Lorem ipsum dolor sit amet consectetur, adipisicing elit. Possimus rerum sunt maiores animi, iure eum nulla voluptates. Quos ducimus ipsum tenetur itaque? Eligendi natus porro fuga nulla atque ratione autem omnis, doloribus amet architecto earum. Error porro dignissimos fugiat tenetur?
      </p>
    </div>
</template>

<script>
import Logo from '~/components/utils/Logo'
import CodeBox from '~/components/post-components/CodeBox'
import MatchBox from '~/components/post-components/MatchBox'

export default {
    layout:"post",
    components: {
        Logo,
        CodeBox,
        MatchBox
    },
    data() {
        return {
            regex: /\w+/gm,

        }
    }
}
</script>

<style>

</style>
