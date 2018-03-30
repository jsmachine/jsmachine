<template>
  <div :class="['cell', runState]">
    <div class="cell--header">
      <div class="cell--header--left">
        <i class="material-icons" title="Play" @click="run">play_arrow</i>
      </div>
      <div class="cell--header-right">
        <i class="material-icons" v-if="!isFirst" @click="onMerge" title="Merge with above">call_merge</i>
        <i class="material-icons disabled" v-else>call_merge</i>
        <i class="material-icons" @click="onRemove" title="Remove">clear</i>
      </div>
    </div>
    <Input ref="inputComponent" :code="code" :onChange="onChange" />
    <Output :runState="runState" :result="result" />
    <div class="cell--footer"><i class="material-icons" @mousedown="handleMouseDown">keyboard_arrow_down</i>
      <div class="cell--add-below" title="Insert new cell" @click="() => onAddNewCellBelow()"></div>
    </div>
  </div>
</template>

<script>
import Input from './Input'
import Output from './Output'

export default {
  components: { Input, Output },
  name: 'Cell',
  props: ['code', 'onRemove', 'onMerge', 'onChange', 'onAddNewCellBelow', 'isFirst'],
  data: function () {
    return {
      runState: 'idle',
      result: null
    }
  },
  methods: {
    run: function () {
      this.$data.runState = 'running'
      let result = null
      try {
        // eslint-disable-next-line no-undef
        result = unstrictEval(this.$props.code)
      } catch (e) {
        result = e
      }
      if (result instanceof Error) {
        this.$data.runState = 'error'
      } else if (result instanceof Promise) {
        window.$$$ = null
        result
          .then((result) => { window.$$$ = result; this.$data.runState = 'done' })
          .catch((err) => { window.$$$ = err; this.$data.runState = 'error' })
      } else {
        this.$data.runState = 'done'
      }
      this.$data.result = result
      window.$$ = result
      return result
    },
    handleMouseDown: function (e) {
      this._dragStartClientY = e.clientY
      this._startHeight = parseInt(this.$refs.inputComponent.$el.style.height || this.$refs.inputComponent.$el.style.minHeight)
      window.addEventListener('mouseup', this.removeListeners, false)
      window.addEventListener('mousemove', this.handleMouseMove, false)
    },
    handleMouseMove: function (e) {
      const deltaY = e.clientY - this._dragStartClientY
      this.$refs.inputComponent.$el.style.height = (this._startHeight + deltaY) + 'px'
      this.$refs.inputComponent.setAutoHeight()
    },
    removeListeners: function () {
      window.removeEventListener('mousemove', this.handleMouseMove)
      window.removeEventListener('mouseup', this.removeListeners)
    }
  },
  beforeDestroy () {
    this.removeListeners()
  }
}
</script>

<style scoped>
  .cell {
    display: block;
    border: 1px solid black;
    box-shadow: 2px 3px 20px 0 black;
    width: calc(100% - 2em);
    margin-right: 1em;
    margin-left: 1em;
    margin-bottom: 2em;
    border-bottom: none;
  }

  @keyframes pulse {
    0% {
      border-bottom-color: rgba(255, 255, 0, 1);
    }
    50% {
      border-bottom-color: rgba(255, 255, 0, 0);
    }
    100% {
      border-bottom-color: rgba(255, 255, 0, 1);
    }
  }

  .cell.running {
    animation: pulse 5s infinite;
    border-bottom: 1px solid yellow;
  }
  .cell.error {
    border-bottom: 1px solid red;
  }
  .cell.done {
    border-bottom: 1px solid rgba(0, 255, 0, .5);
  }

  .cell--header {
    display: flex;
    justify-content: space-between;
    position: relative;
    height: 14px;
    padding-left: .3em;
    width: 100%;
  }

  .cell--header .material-icons {
    font-size: 12px;
  }

  .cell--header .material-icons.disabled {
    color: #777;
  }

  .cell--header--right {
    display: block;
  }
  .cell--header .material-icons:not(.disabled):hover, .cell--footer .material-icons:hover {
    border-bottom: 1px solid #ccc;
    cursor: pointer;
  }
  .cell--footer {
    display: block;
    text-align: center;
    position: relative;
  }

  .cell--footer .material-icons {
    cursor: pointer;
    font-size: 12px;
    user-select: none;
  }
  .cell--add-below {
    height: 2em;
    width: 100%;
    position: absolute;
    bottom: -2em;
  }
  .cell--add-below:hover {
    background: linear-gradient(to bottom, rgba(0,255,0,0), rgba(0,255,0,.4), rgba(0,255,0,0));
    cursor: pointer;
  }
</style>
