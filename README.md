# pstyper

A minimalistic typeracer game with singleplayer and multiplayer modes! 
Race against yourself or with your friends to improve your typing speed and accuracy or to stir up competition.
You can store your highest words per minute (only in singleplayer) in our database by simply creating an account with us.

## Getting Started

This game has been deployed via Heroku and can be played on: <s>https://pstyper.herokuapp.com/</s> *Currently not functional - Firebase database inactive*

You can also run the server locally and it would be playable on: http://localhost:3000/

Follow the next few steps to run the server locally.

### Dependencies

- git >> [download here](https://git-scm.com/downloads)
- Node.js >> [download here](https://nodejs.org/en/download/)
- Firebase Project >> [here](https://firebase.google.com/)

### Installation

1. Install the two dependencies listed above. For **Node.js**, ensure that it is added to PATH so you can run the commands in any directory. 
2. Go into a desired directory of your choice and clone the repository into that directory running the following command in your terminal: `git clone https://github.com/paulllee/pstyper.git`
3. Move into the repository that you just cloned and run `npm install` in your terminal to install the necessary Node.js packages
4. After, run `git update-index --skip-worktree env.json` in your terminal to ignore future changes with env.json
5. (OPTIONAL - if you opt out of doing step 5, you won't be able to store your highest wpm in your database) Next create a Firebase project using your Google account
   1. After creating the project, create a Firestore Database
   2. Add Firebase to your web app to generate a config
   3. Copy and paste each value in the config corresponding to the same keys in the `env.json` file in the root directory of this repo
6. After the packages finish installing, you can run the server using `node server` and if successful, `listening on port: 3000` will appear in the terminal.
7. You can now visit http://localhost:3000/ in your web browser to play the game!

## License

Distributed under the GNU General Public License v3.0. See `LICENSE` for more information.

## Authors

[paul lee](https://github.com/paulllee) and [selim genel](https://github.com/segenel) developed pstyper!
