import os

# -=- Path to the d.ts definitions file -=-
PATH_TO_DEFINITIONS = os.path.join(os.path.dirname(__file__), '..', 'src', 'NetscriptDefinitions.d.ts')

# -=- URL to the latest version of the d.ts definitions file -=-
URL_TO_DEFINITIONS = 'https://raw.githubusercontent.com/danielyxie/bitburner/dev/src/ScriptEditor/NetscriptDefinitions.d.ts'

def update_definitions(path_to_definitions=PATH_TO_DEFINITIONS, url_to_definitions=URL_TO_DEFINITIONS):
  # -=- Check if the definitions file exists -=-
  if not os.path.exists(path_to_definitions):
    print('Definitions file not found. Creating new file...')
    with open(path_to_definitions, 'w') as f:
        f.write('')

  # -=- Read the definitions file -=-
  with open(path_to_definitions, 'r') as f:
    definitions = f.read()

  # -=- Download the latest version of the definitions file -=-
  import requests
  response = requests.get(url_to_definitions)
  latest_definitions = response.text

  # -=- Check if the definitions file is up to date -=-
  if definitions == latest_definitions:
    print('Definitions file is up to date')
  else:
    print('Definitions file is out of date. Updating...')
    with open(path_to_definitions, 'w') as f:
      f.write(latest_definitions)

# -=- Run the script -=-
if __name__ == '__main__':
  update_definitions()
