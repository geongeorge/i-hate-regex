<template>
    <div class="p-3 rounded text-gray-600 text-left"
    :class="addclass">
        <a href="#">
        <h2 class="text-black text-lg hover:underline">{{title}}</h2>
        </a>
       <slot></slot>
    </div>
</template>

<script>
    export default {
        props: {
            title: {default:""},
            addclass: {default: ['mt-6']}
        }
}
</script>

<style>

</style>
