from flask import Flask, session, redirect, request, render_template

app = Flask(__name__)

# Set the secret key to some random bytes. Keep this really secret!
app.secret_key = b'\xce\xcf\xd5\x8ez\xa2\xd2I\xab\x9e\xbcOZ\x82\x1a\xc0'


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
    # remove the username from the session
    session.pop('username', None)
    return redirect('login')


@app.route('/dashboard')
def dashboard():
    if request.method == 'GET':
        if 'username' in session:
            username = session['username']
            return render_template('dashboard.html', username = username)
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
        if username == 'MASlab_User' and password == '2691*1396':
            session['username'] = username
            # remember = request.form['remember']
            # print (remember)
            return render_template('index.html', username = username)
        else:
            return render_template('login.html', error = 100)


if __name__ == '__main__':
    app.run(debug=True)
