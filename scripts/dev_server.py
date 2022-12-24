import os
import asyncio
import websockets
from fastapi import FastAPI

from send_to_game import send_to_game

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
    global client, is_server_running
    
    client = websocket

    while is_server_running:
        await asyncio.sleep(1)

# -=- Main Flask Entry Point -=-
@app.get('/reload')
async def base():
    global client

    if client is None:
        return 'No client connected'

    await send_to_game(
        client,
        os.path.join(os.path.dirname(__file__), '..', 'dist', 'src')
    )

    return 'OK'

async def main():
    global is_server_running

    print('Starting server...')
    async with websockets.serve(handle_client, 'localhost', PORT):
        print(f'Server started on port {PORT}')

        # -=- Wait for the server to close -=-
        while is_server_running:
            await asyncio.sleep(1)


@app.on_event("startup")
async def start():
    asyncio.ensure_future(main()),

@app.on_event("shutdown")
def shutdown_server():
    global client, is_server_running

    if client is not None:
        client.close()

    is_server_running = False
    exit()
