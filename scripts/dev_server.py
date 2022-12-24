import os
import threading
import asyncio
import websockets
from flask import Flask, request
from fastapi import FastAPI

from send_to_game import send_to_game

# -=- Output Directory -=-
OUTPUT_DIR = os.path.join(os.path.dirname(__file__), '..', 'dist', 'src')

# -=- Network Settings -=-
PORT = 3200

# -=- Websocket Client -=-
client = None

# -=- Flask App -=-
app = FastAPI()

# ~ Flag for if server is running
is_server_running = True

# -=- Handle Websocket Client Connections -=-
async def handle_client(websocket):
    global client
    
    client = websocket

    while is_server_running:
        await asyncio.sleep(5)

# -=- Main Flask Entry Point -=-
@app.get('/reload')
async def base():
    global client

    if client is None:
        return 'No client connected'

    await send_to_game(client)

    return 'OK'

def shutdown_server():
    global is_server_running

    is_server_running = False
    raise RuntimeError('Server shutting down...')

# -=- Kill the server -=-
@app.get('/kill')
async def kill():
    global client

    if client is not None:
        client.close()

    shutdown_server()

# -=- Main Websocket Entry Point -=-
async def main(port: int = PORT):
    global is_server_running

    print('Starting server...')
    async with websockets.serve(handle_client, 'localhost', port):
        print(f'Server started on port {port}')

        # -=- Wait for the server to close -=-
        while is_server_running:
            await asyncio.sleep(1)

@app.get('/start')
async def start():
    await main()

