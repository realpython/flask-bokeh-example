# Flask Bokeh Basics

## Getting Started

Create a new Flask project:

```sh
$ mkdir flask-bokeh-example && cd flask-bokeh-example
```

Create and activate a new virtual environment:

```sh
$ python3 -m venv env
$ source env/bin/activate
```

Install Flask:

```sh
$ pip install flask==0.12.2
```

Add an *app.py* file:

```python
from flask import Flask, render_template


app = Flask(__name__)


@app.route('/')
def index():
    return 'Hello, World!'


if __name__ == '__main__':
    app.run(debug=True)
```

Run the server. Navigate to [http://localhost:5000/](http://localhost:5000/) in your browser to ensure all is well. Kill the server once done.

## Adding Bokeh

Install:

```sh
$ pip install bokeh==0.12.6
```

Add the imports:

```python
from bokeh.embed import components
from bokeh.plotting import figure
from bokeh.resources import INLINE
from bokeh.util.string import encode_utf8
```

Add a new route handler:

```python
@app.route('/bokeh')
def bokeh():

    # init a basic bar chart:
    # http://bokeh.pydata.org/en/latest/docs/user_guide/plotting.html#bars
    fig = figure(plot_width=600, plot_height=600)
    fig.vbar(
        x=[1, 2, 3, 4],
        width=0.5,
        bottom=0,
        top=[1.7, 2.2, 4.6, 3.9],
        color='navy'
    )

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
```

Add a "templates" folder to the project root, and then add an *index.html* file to that folder:

```html
<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8">
    <meta http-equiv="content-type" content="text/html; charset=utf-8">
    <title>Embed Demo</title>
    {{ js_resources|indent(4)|safe }}
    {{ css_resources|indent(4)|safe }}
    {{ plot_script|indent(4)|safe }}
  </head>
  <body>
    {{ plot_div|indent(4)|safe }}
  </body>
</html>
```

## Sanity Check

Run the server. Navigate to [http://localhost:5000/bokeh](http://localhost:5000/bokeh). You should see the chart.
