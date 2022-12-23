import os
import websockets
from flask import Flask, request
from pathlib import Path

from send_to_game import send_to_game

# -=- Output Directory -=-
OUTPUT_DIR = os.path.join(os.path.dirname(__file__), '..', 'dist', 'src')

# -=- Network Settings -=-
PORT = 3200

# -=- Websocket Client -=-
client = None

# -=- Flask App -=-
app = Flask(__name__)

# -=- Handle Websocket Client Connections -=-
async def handle_client(websocket):
    global client
    
    client = websocket

    # -=- Wait for the connection to close -=-
    while True:
        try:
            await websocket.recv()
        except websockets.exceptions.ConnectionClosed:
            exit()

# -=- Main Websocket Entry Point -=-
websocket_server = websockets.serve(handle_client, 'localhost', 3200)

# -=- Main Flask Entry Point -=-
@app.route('/reload')
def base():
    global client

    if client is None:
        return 'No client connected'

    send_to_game(client)

    return 'OK'

def shutdown_server():
    # SOURCE: https://stackoverflow.com/questions/15562446/how-to-stop-flask-application-without-using-ctrl-c
    func = request.environ.get('werkzeug.server.shutdown')
    if func is None:
        raise RuntimeError('Not running with the Werkzeug Server')
    func()

# -=- Kill the server -=-
@app.route('/kill')
def kill():
    global client

    if client is not None:
        client.close()

    shutdown_server()
    return "Killing server..."
    

if __name__ == '__main__':
    app.run("127.0.0.1", PORT + 1)
