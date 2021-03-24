from flask import Flask, render_template
app = Flask(__name__)

@app.route('/api/docs')
def get_docs():
    print('sending docs')
    return render_template('swaggerui.html')

@app.route('/greetings')
def greetings():
    return 'May the force be with you!'

if __name__ == '__main__':
    app.run()