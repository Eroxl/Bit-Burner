import os
import json
import random
import asyncio
import websockets
from pathlib import Path

from fix_imports import fix_imports
from formatter import push_file

# -=- Output Directory -=-
OUTPUT_DIR = os.path.join(os.path.dirname(__file__), '..', 'dist', 'src')

# -=- Network Settings -=-
PORT = 3200

# ~ Check if the files have been sent
server_sent = False

# -=- Handle Websocket Client Connections -=-
async def handle_client(websocket):
    global server_sent

    # -=- Send all files in the output directory to the client -=-
    files = Path(OUTPUT_DIR).rglob('*.js')
    fix_imports([path.as_posix() for path in files], 'dist/src')

    for path in Path(OUTPUT_DIR).rglob('*.js'):
        file = path.as_posix().replace(f'{OUTPUT_DIR.strip("./")}/', '')
        file = file if '/' not in file else f'/{file}'

        # If the file is in a sub directory, display and error and skip it
        if file.count('/') > 2:
            print(f'\033[91mError sending file {file} to client: sub directories are not allowed \033[0m')
        else:
            with open(os.path.join(OUTPUT_DIR, f'./{file}'), 'r') as f:
                # -=- Send the file to the client -=-
                await websocket.send(
                    push_file(
                        file,
                        f.read(),
                        'home',
                        random.randint(0, 100000)
                    )
                )

                # -=- Wait for the status -=-
                status = json.loads(await websocket.recv())

                if status.get('result') != 'OK':
                    print(f'\033[91mError sending file {file} to client: {status} \033[0m')
                else :
                    print(f'\033[92mFile {file} sent to client \033[0m')

    # -=- Close the connection -=-
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