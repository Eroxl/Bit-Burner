import asyncio
import websockets

from send_to_game import send_to_game

# -=- Network Settings -=-
PORT = 3200

# ~ Check if the files have been sent
server_sent = False

# -=- Handle Websocket Client Connections -=-
async def handle_client(websocket):
    global server_sent

    send_to_game(websocket)
    
    server_sent = True


# -=- Main Entry Point -=-
async def main(port: int = PORT):
    print('Starting server...')
    async with websockets.serve(handle_client, 'localhost', port):
        print(f'Server started on port {port}')

        # -=- Wait for the server to close -=-
        while(not server_sent):
            await asyncio.sleep(1)
    

# -=- Run the script -=-
if __name__ == '__main__':
    asyncio.run(main())
