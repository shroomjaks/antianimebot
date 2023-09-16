# Anti Anime Bot
A Discord.js bot that uses Tensorflow image recognition to automatically punish users with anime profile pictures

Anime     - 694 image samples  
Not Anime - 314 image samples  
500 epochs training

## Installation
1. Make sure you have a new version of Node.js and NPM installed
2. [Download the bot files](https://download-directory.github.io/?url=https%3A%2F%2Fgithub.com%2FLozarth%2Fantianimebot%2Ftree%2Fmain%2Fbot)
3. Install the NPM depedencies with `npm install`
4. Run the bot with `node index.js`

## Settings
- Open `settings.json` in text editor / IDE of choice
- Change bot token to your bot's token and server id to the main server id that the bot will be used in
- Change any other settings accordingly

## Features
- Ban / kick / apply role(s) / send custom DM to user's who have anime profile pictures
- Ban / kick / apply role(s) / send custom DM to user's who play certian games such as Genshin Impact and League of Legends

## Detection accuracy
<img src="https://github.com/Lozarth/antianimebot/assets/46830521/ea47c798-3798-45e6-b782-1fafaa10ace4" width="400"/>

## Planned features
- Punishment lasts until user changes their profile picture
- Furry profile picture detection

## Creating your own model
https://teachablemachine.withgoogle.com/train
