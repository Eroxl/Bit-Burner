<h1 align="center">
  💻 Bit Burner Scripts
</h1>

## 📝 Description
This repository contains scripts for the game [Bit Burner](https://github.com/danielyxie/bitburner) by [danielyxie](https://github.com/danielyxie).
The scripts are written in Typescript and compiled to Javascript and then transfered to the game using the [remote API](https://bitburner.readthedocs.io/en/latest/remoteapi.html).

## 📦 Installation
1. Install [Node.js](https://nodejs.org/en/download/)
2. Clone this repository
- ```bash
  git clone https://github.com/Eroxl/Bit-Burner
  ```
- or download the repository as a zip file and extract it

3. Install dependencies
- ```bash
  yarn install && pip install -r requirements.txt 
  ```

## 🚀 Usage
1. Install netscript definitions
- ```bash
  yarn run update:definitions
  ```
2. Build the scripts
- ```bash
  yarn run build
  ```
3. Wait for the build to finish
4. Start the game
5. Navigate to the `options` menu
6. Select `Remote API`
7. Enter the port `3200` into the `Port` field then click `Connect`

## 💾 Development
1. Install the netscript definitions
- ```bash
  yarn run update:definitions
  ```
2. Start the development server
- ```bash
  yarn run dev
  ```
3. Wait for the server to start
4. Start the game
5. Navigate to the `options` menu
6. Select `Remote API`
7. Enter the port `3200` into the `Port` field then click `Connect`
  - **NOTE** Every time you update the files you have to reconnect to the remote API

## 📦 Development Features
- Netscript definitions
- Full typescript support
- Send scripts to the game
- Relative imports

## 🎁 Scripts
- [lsTree](src/lsTree.ts) - List the files in a directory in a tree like format
<img src="https://raw.githubusercontent.com/Eroxl/Bit-Burner/main/images/ls-tree.png" height="300" alt="lsTree Example" />

- [runScriptAll](src/runScriptAll.ts) - Run a script on all rooted servers
- [botNet](src/botNet/runNet.ts) - Run a botnet on all rooted servers that targets a specific server
- [buyServer](src/buyServer.ts) - Prompt the user for a server to buy and then buy it

## 📋 TODO
- Development Features
  - [ ] Keep game connected to development server
  - [ ] Add testing
  - [ ] Add documentation
- Scripts
  - [ ] Server graph similar to [this](https://gist.github.com/nanodn/11979b481d41eeab980170cb7487953c)
  <img src="https://cdn.discordapp.com/attachments/924854581471633419/1020724517846388796/unknown.png" height="300" alt="Example of graph" />

  - [ ] Interactive text based GUI library
  - [ ] Python support using [pyscript](https://pyscript.net/)


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
