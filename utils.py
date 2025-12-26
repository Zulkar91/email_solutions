from json import load
from functools import lru_cache

from flask import make_response, render_template


@lru_cache
def fetch_jinja_variables(directory, page_name):
    jinja_variables = dict()

    for type in ['meta', 'data']:
        try:
            with open(f"json/{type}/{directory}{page_name}.json") as file:
                jinja_variables.update(load(file))
        except:
            pass
    
    return jinja_variables

