<template>
  <div>
    <table>
      <thead>
        <tr>
          <th>expr</th>
          <th>usage</th>
        </tr>
      </thead>
      <tbody v-if="!showAll">
        <tr v-for="(reg, key) in regexes" :key="key">
          <td>
            <code class="text-green-600">{{ reg.regex }}</code>
          </td>
          <td>{{ reg.usage }}</td>
        </tr>
      </tbody>
      <tbody v-else>
        <tr v-for="(reg, key) in cheatsheet" :key="key">
          <td>{{ reg.regex }}</td>
          <td>{{ reg.usage }}</td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script>
import cheatsheet from "~/static/cheatsheet.json"

export default {
  props: {
    inputRegex: {
      default: function() {
        return []
      }
    },
    showAll: { default: false }
  },
  data() {
    return {
      cheatsheet: cheatsheet,
      regexes: []
    }
  },
  mounted() {
    this.regexes = this.cheatsheet.filter(val => {
      return this.inputRegex.includes(val.regex)
    })
  }
}
</script>

<style>
th,
td {
  border-bottom: 1px solid rgb(214, 223, 231);
  padding: 15px;
  text-align: left !important;
}
table {
  width: 100%;
}
</style>
