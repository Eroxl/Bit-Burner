from typing import List

import os
import re
from pathlib import Path

# ~ Regex for finding imports in javascript 
relative_import_regex = re.compile(r"""(\bfrom\s+["|'](\S+)["|'])""")

def change_to_absolute(import_path: str, current_path: str, base_path: str):
  """Change a relative path to an absolute path relative to the `basePath`"""
  if (import_path.startswith('/')):
    return import_path

  relative_path = os.path.join(
    './',
    os.path.dirname(current_path),
    import_path
  )
  
  absolute_path = Path(relative_path).resolve().as_posix()
  
  if not absolute_path.endswith('.js'):
    absolute_path += '.js'

  # ~ Remove everything before and including base_path
  return absolute_path[absolute_path.index(base_path) + len(base_path):]

def fix_imports(files: List[str], base_path: str):
  """Fix relative imports in typescript `files` by switching them to be relative to the `base_path`"""
  for file in files:
    with open(file, 'r') as f:
      contents = f.read()
      if relative_import_regex.search(contents):
        # ~ Replace all relative imports with absolute imports starting with the `base_path`
        contents = relative_import_regex.sub(
          lambda match: match.group(1).replace(match.group(2), change_to_absolute(match.group(2), file, base_path)),
          contents
        )

        # ~ Write the new contents to the file
        with open(file, 'w') as f:
          f.write(contents)
