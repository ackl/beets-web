# This file is part of beets.
# Copyright 2013, Adrian Sampson.
#
# Permission is hereby granted, free of charge, to any person obtaining
# a copy of this software and associated documentation files (the
# "Software"), to deal in the Software without restriction, including
# without limitation the rights to use, copy, modify, merge, publish,
# distribute, sublicense, and/or sell copies of the Software, and to
# permit persons to whom the Software is furnished to do so, subject to
# the following conditions:
#
# The above copyright notice and this permission notice shall be
# included in all copies or substantial portions of the Software.

"""A Web interface to beets."""
from beets.plugins import BeetsPlugin
from beets import ui
from beets import util
import beets.library
import flask
from flask import g, url_for, request, send_file, Response
from werkzeug.routing import BaseConverter, PathConverter
import os
import json
import mimetypes
import re


# Utilities.

def _rep(obj, expand=True):
    """Get a flat -- i.e., JSON-ish -- representation of a beets Item or
    Album object. For Albums, `expand` dictates whether tracks are
    included.
    """
    out = dict(obj)

    if isinstance(obj, beets.library.Item):
        del out['path']

        # Get the size (in bytes) of the backing file. This is useful
        # for the Tomahawk resolver API.
        try:
            out['size'] = os.path.getsize(util.syspath(obj.path))
        except OSError:
            out['size'] = 0

        return out

    elif isinstance(obj, beets.library.Album):
        del out['artpath']
        if expand:
            out['items'] = [_rep(item) for item in obj.items()]
        return out


def json_generator(items, root):
    """Generator that dumps list of beets Items or Albums as JSON

    :param root:  root key for JSON
    :param items: list of :class:`Item` or :class:`Album` to dump
    :returns:     generator that yields strings
    """
    yield '{"%s":[' % root
    first = True
    for item in items:
        if first:
            first = False
        else:
            yield ','
        yield json.dumps(_rep(item))
    yield ']}'


def resource(name):
    """Decorates a function to handle RESTful HTTP requests for a resource.
    """
    def make_responder(retriever):
        def responder(ids):
            entities = [retriever(id) for id in ids]
            entities = [entity for entity in entities if entity]

            if len(entities) == 1:
                return flask.jsonify(_rep(entities[0]))
            elif entities:
                return app.response_class(
                    json_generator(entities, root=name),
                    mimetype='application/json'
                )
            else:
                return flask.abort(404)
        responder.__name__ = 'get_%s' % name
        return responder
    return make_responder


def resource_query(name):
    """Decorates a function to handle RESTful HTTP queries for resources.
    """
    def make_responder(query_func):
        def responder(queries):
            return app.response_class(
                json_generator(query_func(queries), root='results'),
                mimetype='application/json'
            )
        responder.__name__ = 'query_%s' % name
        return responder
    return make_responder


def resource_list(name):
    """Decorates a function to handle RESTful HTTP request for a list of
    resources.
    """
    def make_responder(list_all):
        def responder():
            return app.response_class(
                json_generator(list_all(), root=name),
                mimetype='application/json'
            )
        responder.__name__ = 'all_%s' % name
        return responder
    return make_responder


class IdListConverter(BaseConverter):
    """Converts comma separated lists of ids in urls to integer lists.
    """

    def to_python(self, value):
        ids = []
        for id in value.split(','):
            try:
                ids.append(int(id))
            except ValueError:
                pass
        return ids

    def to_url(self, value):
        return ','.join(value)


class QueryConverter(PathConverter):
    """Converts slash separated lists of queries in the url to string list.
    """

    def to_python(self, value):
        return value.split('/')

    def to_url(self, value):
        return ','.join(value)


# Flask setup.

app = flask.Flask(__name__, static_url_path='')
app.url_map.converters['idlist'] = IdListConverter
app.url_map.converters['query'] = QueryConverter


@app.before_request
def before_request():
    g.lib = app.config['lib']


# Items.

@app.route('/item/<idlist:ids>')
@resource('items')
def get_item(id):
    return g.lib.get_item(id)


@app.route('/item/')
@app.route('/item/query/')
@resource_list('items')
def all_items():
    return g.lib.items()


@app.after_request
def after_request(response):
    response.headers.add('Accept-Ranges', 'bytes')
    return response


@app.route('/item/<int:item_id>/file')
def item_file(item_id):
    item = g.lib.get_item(item_id)
    # response = flask.send_file(item.path, as_attachment=True,
    #                            attachment_filename=os.path.basename(item.path))
    # response.headers['Content-Length'] = os.path.getsize(item.path)
    # return response
    range_header = request.headers.get('Range', None)
    if not range_header:
        return send_file(item.path)

    size = os.path.getsize(item.path)
    byte1, byte2 = 0, None

    m = re.search('(\d+)-(\d*)', range_header)
    h = m.groups()

    if h[0]:
        byte1 = int(h[0])
    if h[1]:
        byte2 = int(h[1])

    length = size - byte1
    if byte2 is not None:
        length = byte2 - byte1

    data = None
    with open(item.path, 'rb') as f:
        f.seek(byte1)
        data = f.read(length)

    rv = Response(data,
                  206,
                  mimetype=mimetypes.guess_type(item.path)[0],
                  direct_passthrough=True)
    rv.headers.add('Content-Range', 'bytes {0}-{1}/{2}'.format(byte1, byte1 + length - 1, size))

    return rv


@app.route('/item/query/<query:queries>')
@resource_query('items')
def item_query(queries):
    return g.lib.items(queries)


# Albums.

@app.route('/album/<idlist:ids>')
@resource('albums')
def get_album(id):
    return g.lib.get_album(id)


@app.route('/album/')
@app.route('/album/query/')
@resource_list('albums')
def all_albums():
    return g.lib.albums()


@app.route('/album/query/<query:queries>')
@resource_query('albums')
def album_query(queries):
    return g.lib.albums(queries)


@app.route('/album/<int:album_id>/art')
def album_art(album_id):
    album = g.lib.get_album(album_id)
    return flask.send_file(album.artpath)


# Artists.

@app.route('/artist/')
def all_artists():
    with g.lib.transaction() as tx:
        rows = tx.query("SELECT DISTINCT albumartist FROM albums")
    all_artists = [row[0] for row in rows]
    return flask.jsonify(artist_names=all_artists)


# Library information.

@app.route('/stats')
def stats():
    with g.lib.transaction() as tx:
        item_rows = tx.query("SELECT COUNT(*) FROM items")
        album_rows = tx.query("SELECT COUNT(*) FROM albums")
    return flask.jsonify({
        'items': item_rows[0][0],
        'albums': album_rows[0][0],
    })


# UI.

@app.route('/')
def home():
    return flask.render_template('23beets.html')


@app.route('/images/<filename>')
def static_proxy(filename):
    print 'im here'
    # send_static_file will guess the correct MIME type
    return url_for('static', filename='vinyl.png')
# Plugin hook.


class WebPlugin(BeetsPlugin):
    def __init__(self):
        super(WebPlugin, self).__init__()
        self.config.add({
            'host': u'',
            'port': 8337,
        })

    def commands(self):
        cmd = ui.Subcommand('web', help='start a Web interface')
        cmd.parser.add_option('-d', '--debug', action='store_true',
                              default=False, help='debug mode')

        def func(lib, opts, args):
            args = ui.decargs(args)
            if args:
                self.config['host'] = args.pop(0)
            if args:
                self.config['port'] = int(args.pop(0))

            app.config['lib'] = lib
            app.run(host='0.0.0.0',
                    port=self.config['port'].get(int),
                    debug=opts.debug, threaded=True)
        cmd.func = func
        return [cmd]
