<h1 align="center">
  💻 Bit Burner Scripts
</h1>

## 📝 Description
This repository contains scripts for the game [Bit Burner](https://github.com/danielyxie/bitburner) by [danielyxie](https://github.com/danielyxie).
The scripts are written in Typescript and compiled to Javascript and then transfered to the game using the [remote API](https://bitburner.readthedocs.io/en/latest/remoteapi.html).

## 📦 Installation
1. Install [Node.js](https://nodejs.org/en/download/), [Yarn](https://classic.yarnpkg.com/en/docs/install/), [Python3](https://www.python.org/downloads/), [Pip](https://pip.pypa.io/en/stable/installing/), and [Git](https://git-scm.com/downloads)
2. Clone this repository
- ```bash
  git clone https://github.com/Eroxl/Bit-Burner
  ```
- or download the repository as a zip file and extract it

3. Navigate to the repository
- ```bash
  cd Bit-Burner
  ```

4. Install dependencies
- ```bash
  yarn install && pip install -r requirements.txt 
  ```

5. Install the netscript definitions
- ```bash
  yarn run update:definitions
  ```

## 🚀 Usage
1. Build the scripts
- ```bash
  yarn run build
  ```
2. Wait for the build to finish
3. Start the game
4. Navigate to the `options` menu
5. Select `Remote API`
6. Enter the port `3200` into the `Port` field then click `Connect`

## 💾 Development
1. Start the development server
- ```bash
  yarn run dev
  ```
2. Wait for the server to start
3. Start the game
4. Navigate to the `options` menu
5. Select `Remote API`
6. Enter the port `3200` into the `Port` field then click `Connect`

## 📦 Development Features
- Netscript definitions
- Full typescript support
- Send scripts to the game
- Relative imports
- Hot reloading

## 🎁 Scripts
- [lsTree](src/lsTree.ts) - List the files in a directory in a tree like format
  <img src="https://raw.githubusercontent.com/Eroxl/Bit-Burner/main/images/ls-tree.png" height="300" alt="lsTree Example" />

- [runScriptAll](src/runScriptAll.ts) - Run a script on all rooted servers
- [botNet](src/botNet/runBatcher.ts) - Run a botnet on all rooted servers that targets a specific server
- [buyServer](src/buyServer.ts) - Prompt the user for a server to buy and then buy it
- [analyze-v2](src/analyze-v2.ts) - Analyze a server and print the results
  <img src="https://raw.githubusercontent.com/Eroxl/Bit-Burner/main/images/analyze-v2.png" height="300" alt="analyze-v2 Example" />

- [hacknet](src/hacknetNodes.ts) - Tries to buy the best hacknet node upgrades possible
- [bestCrime](src/bestCrime/bestCrime.ts) - Calculates the best crime $/s for your current stats

## 📜 License
This project is licensed under the [Affero General Public License v3.0](https://www.gnu.org/licenses/agpl-3.0.en.html) - see the [LICENSE](LICENSE) file for details

## 📧 Contact
- [Eroxl](github.com/eroxl) - evan@erox.one

## 📚 Resources
- [Bit Burner](https://github.com/danielyxie/bitburner)
- [Bit Burner Wiki](https://bitburner.readthedocs.io/en/latest/index.html)
- [Typescript](https://www.typescriptlang.org/)
- [Node.js](https://nodejs.org/en/)
- [Yarn](https://yarnpkg.com/)
- [Python](https://www.python.org/)
- [Pip](https://pypi.org/project/pip/)
