import os
import json
import random
from pathlib import Path

from fix_imports import fix_imports
from formatter import push_file

# -=- Output Directory -=-
OUTPUT_DIR = os.path.join(os.path.dirname(__file__), '..', 'dist', 'src')

async def send_to_game(client):
    # -=- Send all files in the output directory to the client -=-
    files = Path(OUTPUT_DIR).rglob('*.js')
    fix_imports([path.as_posix() for path in files], 'dist/src')

    for path in Path(OUTPUT_DIR).rglob('*.js'):
        file = path.as_posix().replace(f'{OUTPUT_DIR.strip("./")}/', '')
        file = file if '/' not in file else f'/{file}'

        # If the file is in a sub directory, display and error and skip it
        with open(os.path.join(OUTPUT_DIR, f'./{file}'), 'r') as f:
            # -=- Send the file to the client -=-
            await client.send(
                push_file(
                    file,
                    f.read(),
                    'home',
                    random.randint(0, 100000)
                )
            )

            # -=- Wait for the status -=-
            status = json.loads(await client.recv())

            if status.get('result') != 'OK':
                print(f'\033[91mError sending file {file} to client: {status} \033[0m')
            else :
                print(f'\033[92mFile {file} sent to client \033[0m')
