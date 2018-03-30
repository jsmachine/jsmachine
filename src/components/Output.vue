<template>
  <div class="output">
    <div ref="resultContainer" class="result_container"></div>
    {{result && '' || ''}}
  </div>
</template>

<script>
/* eslint-disable no-undef */

const returnFormatters = window.returnFormatters = [
  {
    handle: {},
    filter: (result) => result instanceof Error,
    formatter: (div, result) => {
      div.style.whiteSpace = 'pre-wrap'
      return String(result) + '\n' + result.stack
    }
  },
  {
    handle: {},
    filter: (result) => typeof result === 'string',
    formatter: (div, result) => {
      div.appendChild(document.createTextNode(result))
      return Nothing
    }
  },
  {
    handle: {},
    filter: (result) => result instanceof Html,
    formatter: (div, result) => {
      div.innerHTML = result._html
      return Nothing
    }
  },
  {
    handle: {},
    filter: (result) => result instanceof Show,
    formatter: (div, result) => {
      if (result._el instanceof Element) {
        div.appendChild(result._el)
        return Nothing
      } else {
        throw Error('Not an element')
      }
    }
  },
  {
    handle: {},
    filter: (result) => result instanceof CallbackFunction,
    formatter: (div, result) => {
      try {
        return result._func(div) === NOOP ? NOOP : Nothing
      } catch (e) {
        return e
      }
    }
  },
  {
    handle: {},
    filter: () => true,
    formatter: (div, result) => String(result)
  }
]

function handleResultValue (div, result) {
  if (result !== Nothing) {
    for (let i = 0; i < returnFormatters.length; i++) {
      if (returnFormatters[i].filter(result)) {
        let newResult = returnFormatters[i].formatter(div, result)
        while (newResult !== Nothing) {
          newResult = handleResultValue(div, newResult)
        }
        return newResult
      }
    }
  }
}

window.registerReturnFormatter = (filter, formatter) => {
  const handle = {}
  returnFormatters.unshift({
    handle: handle,
    filter: filter,
    formatter: formatter
  })
  return 'OK'
}

export default {
  name: 'Output',
  props: ['runState', 'result'],
  beforeUpdate: function () {
    this.$refs.resultContainer.innerHTML = ''
  },
  updated: function () {
    handleResultValue(this.$refs.resultContainer, this.$props.result)
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
  .output {
    display: block;
    padding: 1em;
    background-color: #222222;
    border-top: 1px dashed #666;
    width: 100%;
  }
</style>
