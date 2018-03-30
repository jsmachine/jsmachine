<template>
  <Notebook :load="url" :autoplay="autoplay" />
</template>

<script>
import Notebook from './components/Notebook'

function getQueryParams (qs) {
  qs = qs.split('+').join(' ')

  const params = {}
  let tokens = null
  const re = /[?&]?([^=]+)=([^&]*)/g

  // eslint-disable-next-line no-cond-assign
  while (tokens = re.exec(qs)) {
    params[decodeURIComponent(tokens[1])] = decodeURIComponent(tokens[2])
  }

  return params
}

export default {
  components: {
    Notebook
  },
  name: 'App',
  data: function () {
    const params = getQueryParams(window.location.search)
    let autoplay = ('autoplay' in params && [1, '1', true, 'true'].includes(params.autoplay))
    let url = '/static/default.js'
    if ('key' in params) {
      url = `https://us-central1-jsmachine-us.cloudfunctions.net/get?key=${params.key}`
    } else {
      autoplay = true
    }
    return {
      url: url,
      autoplay: autoplay
    }
  }
}
</script>

<style>
  body, * {
    box-sizing: border-box;
    font-family: monospace;
    margin: 0;
  }

  html {
    height: 100%;
  }

  body {
    height: 100%;
    display: flex;
    flex-direction: column;
    padding: 1em;
    color: #d1d2cc;
    background-color: #41423b;
  }

  a {
    color: #d1d2cc;
  }
</style>
