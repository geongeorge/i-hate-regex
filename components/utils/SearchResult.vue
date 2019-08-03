<template>
    <div class="shadow mt-6 p-3 rounded text-gray-600 text-left">
        <h2 class="text-black text-lg">{{title}}</h2>
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
