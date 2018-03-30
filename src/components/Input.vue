<template>
  <div class="input">{{code}}</div>
</template>

<script>
export default {
  name: 'Input',
  props: ['code', 'onChange'],
  updated () {
    if (this._editor.getValue() !== this.$props.code) {
      this._editor.setValue(this.$props.code)
    }
  },
  methods: {
    setAutoHeight: function () {
      const numLines = this._editor.getSession().getScreenLength()
      this.$el.style.minHeight = (Math.min(8, numLines) * 14) + 'px'
      this._editor.resize()
    }
  },
  mounted () {
    // eslint-disable-next-line no-undef
    const editor = ace.edit(this.$el)
    this._editor = editor
    editor.session.setMode('ace/mode/javascript')
    editor.setTheme('ace/theme/monokai')
    editor.setAutoScrollEditorIntoView(true)
    editor.setShowPrintMargin(false)
    editor.getSession().setUseWrapMode(true)
    editor.getSession().on('change', () => {
      this.$props.onChange(editor.getValue())
      this.setAutoHeight()
    })
    this.setAutoHeight()
  },
  destroyed () {
    this._editor.destroy()
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
  .input {
    display: block;
    clear: both;
  }
</style>
