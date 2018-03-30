<template>
  <div class="notebook">
    <div class="notebook--header">
      <div class="notebook--header--left">
        Issues / feedback? <a href="https://github.com/tommos0/jsmachine">Go to GitHub!</a>
      </div>
      <div class="notebook--header--right">
        <span v-if="saving" class="saving">Saving<img class="spinner" src="/static/spinner.gif"/></span>
        <span v-if="loading" class="saving">Loading<img class="spinner" src="/static/spinner.gif"/></span>
        <a v-if="!!key" :href="'/?key='+key">{{ key }}</a>
        <i class="material-icons" title="Play notebook" @click="playNotebook">play_arrow</i>
        <i class="material-icons" title="Save notebook" @click="save">cloud_upload</i>
      </div>
    </div>
    <div class="notebook--contents">
      <transition-group name="list-complete" tag="div" ref="cells">
        <Cell v-for="(codeFragment, idx) in code" :code="codeFragment.value" :key="codeFragment.key"
              :onRemove="() => onRemove(codeFragment.key)"
              :onMerge="() => onMerge(codeFragment.key)"
              :onChange="(change) => onChange(codeFragment.key, change)"
              :onAddNewCellBelow="() => onAddNewCellBelow(codeFragment.key)"
              :isFirst="idx === 0"
              class="list-complete-item"
        />
      </transition-group>
    </div>
  </div>
</template>

<script>
import Cell from './Cell'

export default {
  components: {
    Cell
  },
  props: ['load', 'autoplay'],
  name: 'Notebook',
  methods: {
    onRemove: function (key) {
      const idx = this.$data.code.findIndex(code => code.key === key)
      this.$data.code.splice(idx, 1)
    },
    onMerge: function (key) {
      const idx = this.$data.code.findIndex(code => code.key === key)
      this.$data.code[idx - 1].value += '\n' + this.$data.code[idx].value
      this.onRemove(key)
    },
    onAddNewCellBelow: function (key) {
      const maxKey = Math.max(...this.$data.code.map(code => code.key))
      const idx = this.$data.code.findIndex(code => code.key === key)
      this.$data.code.splice(idx + 1, 0, { key: maxKey + 1, value: '' })
    },
    onChange: function (key, value) {
      this.$data.code.find(code => code.key === key).value = value
    },
    save: async function (retry = false) {
      this.$data.saving = true
      const url = 'https://us-central1-jsmachine-us.cloudfunctions.net/save'
      const codeArr = JSON.stringify(this.$data.code.map(code => code.value))
      let result = null
      try {
        result = await fetch(url, {
          body: codeArr,
          method: 'POST'
        })
      } catch (e) {
        console.log(e)
      }
      const resultObj = await result.json()
      if (resultObj.error && resultObj.error.code === 14 && !retry) {
        // this is some google error (TCP read failed). Try again should work..
        setTimeout(() => this.save(true), 500)
      } else {
        this.$data.key = resultObj.key
        window.history.pushState(resultObj.key, resultObj.key, '?key=' + resultObj.key)
        let saves = localStorage.getItem('saves') ? JSON.parse(localStorage.getItem('saves')) : []
        saves.push(resultObj.key)
        localStorage.setItem('saves', JSON.stringify(saves))
        this.$data.saving = false
      }
    },
    playNotebook: async function () {
      for (let cell of this.$refs.cells.$children) {
        await cell.run()
      }
    }
  },
  data () {
    return {
      code: [],
      key: null,
      saving: false,
      loading: true
    }
  },
  async created () {
    const result = await fetch(this.$props.load)
    const code = await result.text()
    let codeArr
    try {
      codeArr = JSON.parse(code)
    } catch (e) {
      codeArr = code.split('\n\n')
    }
    this.$data.code.push(...codeArr.map((codeFragment, index) => ({value: codeFragment, key: index})))
    this.$data.loading = false
    if (this.$props.autoplay) {
      setTimeout(() => this.playNotebook(), 2000)
    }
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
  .notebook {
    display: flex;
    flex-direction: column;
    position: relative;
    height: 100%;
    border: 1px solid black;
  }
  .notebook--contents {
    display: block;
    position: relative;
    overflow-y: scroll;
  }
  .notebook--header {
    background-color: #333;
    padding: 1em;
    margin-bottom: 2em;
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
  .notebook--header--right {
    display: flex;
    align-items: center;
  }

  .notebook--header--right>* {
    margin-left: .5em;
    margin-right: .5em;
  }

  .notebook--header--right .material-icons {
    cursor: pointer;
    border-bottom: 1px solid transparent;
  }

  .notebook--header--right .material-icons:hover {
    border-bottom: 1px solid white;
  }

  .saving {
    margin-right: 2em;
    display: inline-block;
    height: 24px;
    line-height: 24px;
  }

  .spinner {
    height: 16px;
  }

  .list-complete-item {
    transition: all 1s;
    display: inline-block;
    margin-right: 10px;
  }
  .list-complete-enter, .list-complete-leave-to
    /* .list-complete-leave-active below version 2.1.8 */ {
    opacity: 0;
    transform: translateY(30px);
  }
  .list-complete-leave-active {
    position: absolute;
  }
</style>
