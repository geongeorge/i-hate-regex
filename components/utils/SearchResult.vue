<template>
    <div class=" mt-6 p-3 rounded text-gray-600 text-left">
        <a href="#">
        <h2 class="text-black text-lg hover:underline">{{title}}</h2>
        </a>
       <slot></slot>
    </div>
</template>

<script>
    export default {
        props: {
            title: {default:""}
        }
}
</script>

<style>

</style>
