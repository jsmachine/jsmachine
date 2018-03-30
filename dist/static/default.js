findLib('showdown')

$$$[0].latest

SystemJS.import($$);

showdown = $$$;
s = new showdown.Converter()
fetch('/static/README.md').then(r => r.text())

html(s.makeHtml($$$))
