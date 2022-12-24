<h1 align="center">
  💻 Scripts
</h1>

## 📝 Description

Collection of scripts to help with the development process of writing scripts for the game [Bit Burner](https://github.com/danielyxie/bitburner) by [danielyxie](https://github.com/danielyxie).

## 🎁 Scripts

* [Dev Server](./dev_server.py) - A development server that maintains it's connection to the game and waits for a request to http://127.0.0.1:3000/reload to send changes to the game

* [Server](./server.py) - The normal server that only transfers the files to the game once then stops itself

* [Import Fixer](./import_fixer.py) - A script that fixes the imports in all output files to be absolute because bit burner scripts don't support relative imports.

* [Definition Updater](./update_definitions.py) - A script that updates the netscript type definitions at `src/NetscriptDefinitions.d.ts` with the current definitions from the repository [danielyxie/bitburner](https://github.com/danielyxie/bitburner).

* [Formatter](./formatter.py) - Helper script to format packets that are sent to the game.

* [Send To Game](./send_to_game.py) - Helper script to send all files in `dist` to the game.

## 📦 Installation

```bash
git clone https://github.com/Eroxl/Bit-Burner.git
```

```bash
pip install -r ./Bit-Burner/requirements.txt
```
