from flask import Flask, render_template
from bokeh.embed import components
from bokeh.plotting import figure
from bokeh.resources import INLINE
from bokeh.util.string import encode_utf8

app = Flask(__name__)


@app.route('/')
def index():
    return 'Hello, World!'


@app.route('/bokeh')
def bokeh():

    # chart defaults
    color = '#FF0000'
    start = 0
    finish = 10

    # Create a polynomial line graph with those arguments
    x = list(range(start, finish + 1))
    fig = figure(title='Polynomial')
    fig.line(x, [i ** 2 for i in x], color=color, line_width=2)

    # grab the static resources
    js_resources = INLINE.render_js()
    css_resources = INLINE.render_css()

    # render template
    script, div = components(fig)
    html = render_template(
        'index.html',
        plot_script=script,
        plot_div=div,
        js_resources=js_resources,
        css_resources=css_resources,
    )
    return encode_utf8(html)


if __name__ == '__main__':
    app.run(debug=True)
