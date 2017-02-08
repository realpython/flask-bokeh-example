# Flask Bokeh Basics

## Getting Started

Create a new Flask project:

```sh
$ mkdir flask-bokeh-sample
$ cd flask-bokeh-example
```

Create and activate a new virtual environment:

```sh
$ python3.6 -m venv env
$ source env/bin/activate
```

Install Flask:

```sh
$ pip install flask==0.12.0
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
$ pip install bokeh==0.12.4
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
```

Add a "templates" folder to the project root, and then add an *index.html* file to that folder:

```html
<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8">
    <title>Bokeh Sample</title>
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
