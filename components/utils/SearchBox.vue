<template>
    <div>
        <form autocomplete="off" method="post" action="">
        <input class="bg-gray-200 text-3xl appearance-none border-2 border-gray-200 rounded w-full py-2 px-4 text-gray-700 leading-tight focus:outline-none focus:bg-white focus:border-gray-200" id="inline-full-name" type="text" placeholder="Search" v-model="query" @keyup="queryUpdated">
        </form>
    </div>
</template>

<script>
export default {
    props: {
            initQuery: {default:""}
     },
    data() {
        return {
            query: ""
        }
    },
    mounted() {
        if(this.initQuery) {
            this.query=this.initQuery
            this.queryUpdated()
        }
        
    },
    methods:{
       queryUpdated() {
           this.$emit('changed',this.query)
       } 
    }
}
</script>

<style>

</style>
