import csv
import json
from io import StringIO
from flask import Flask, redirect, render_template, request
from flask import session, escape

app = Flask(__name__)
# app = Flask(__name__, root_path='')
# app = Flask(__name__, static_url_path='/static')

# Set the secret key to some random bytes. Keep this really secret!
app.secret_key = b'\xce\xcf\xd5\x8ez\xa2\xd2I\xab\x9e\xbcOZ\x82\x1a\xc0'

# @app.errorhandler(404)
# def not_found(error):
#     # app.logger.debug('A value for debugging')
#     # app.logger.warning('A warning occurred (%d apples)', 42)
#     # app.logger.error('An error occurred')
#     return render_template('404.html')


@app.route('/forget-pass')
def forget_pass():
    return render_template('forget-pass.html')


@app.route('/register')
def register():
    return render_template('register.html')


@app.route('/login')
def login():
    if 'username' not in session:
        return render_template('login.html')
    return redirect('/')


@app.route('/logout')
def logout():
    # remove the username from the session if it's there
    session.pop('username', None)
    return redirect('login')


@app.route('/', methods = ['GET', 'POST'])
def index():
    if request.method == 'GET':
        if 'username' in session:
            username = session['username']
            return render_template('index.html', username = username)
        return redirect('login')
    elif request.method == 'POST':
        username = request.form['username']
        password = request.form['password']
        if username == 'rasoul' and password == '1234':
            session['username'] = username
            # remember = request.form['remember']
            # print (remember)
            return render_template('index.html', username = username)
        else:
            return render_template('login.html', error = 100)


if __name__ == '__main__':
    app.run(debug=True)
    # app.run(host='0.0.0.0', port=8090, debug=True)
