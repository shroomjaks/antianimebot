# Anti Anime Bot
A Discord.js bot that uses Tensorflow image recognition to automatically punish users with anime profile pictures

Anime     - 694 image samples  
Not Anime - 314 image samples  
500 epochs training

## Installation
1. [Make sure you have the latest version of Node.js installed](https://nodejs.org/en)
2. [Download the bot files](https://download-directory.github.io/?url=https%3A%2F%2Fgithub.com%2FLozarth%2Fantianimebot%2Ftree%2Fmain%2Fbot)
3. Install the NPM dependencies with `npm install`
4. Open `settings.json` in a text editor / IDE of choice
5. Change `botToken` to your bot's token and `serverId` to the main server id that the bot will be used in
6. Change any other settings accordingly
7. Run the bot with `node index.js`

## Features
- Ban / kick / apply role(s) / send custom DM to users who have anime profile pictures
- Ban / kick / apply role(s) / send custom DM to users who play certain games such as Genshin Impact and League of Legends

## Detection accuracy
<img src="https://github.com/Lozarth/antianimebot/assets/46830521/ea47c798-3798-45e6-b782-1fafaa10ace4" width="400"/>

## Planned features
- Punishment lasts until user changes their profile picture
- Furry profile picture detection

## Creating your own model
https://teachablemachine.withgoogle.com/train
