from flask import Flask, render_template, abort, send_from_directory
from jinja2.exceptions import TemplateNotFound

from utils import fetch_jinja_variables

app = Flask(__name__)


@app.get('/')
@app.get('/<page>')
def general_pages(page='home'):
    
    try:
        return render_template(page + '.html', **fetch_jinja_variables('/', page))
    except TemplateNotFound:
        abort(404)


@app.get('/services/<service>')
def service_pages(service):
    purge_cache()
    all_services = ('google-workspace', 'microsoft-365', 'zimbra-collaboration', 'hybrid-email-solution')

    template = f'services/{ ("style1" if service in all_services[:2] else service) }.html'
    jinja_variables = fetch_jinja_variables('/services/', service)

    if 'hybrid' in service:
        jinja_variables['plans'] = {service: fetch_jinja_variables('/services/', service)['plans'] for service in all_services[:-1]}
    
    try:
        return render_template(template, **jinja_variables)
    except TemplateNotFound:
        abort(404)


@app.get('/robots.txt')
def seo_robots():
    return send_from_directory('static', 'robots.txt')


@app.get('/sitemap.xml')
def seo_sitemap():
    return send_from_directory('static', 'sitemap.xml')


@app.get('/1337CachE')
def purge_cache():
    fetch_jinja_variables.cache_clear()

    return 'Purged Cache'


if __name__ == '__main__':
    app.run(**{'debug': True, 'host': '0.0.0.0', 'port': 80})