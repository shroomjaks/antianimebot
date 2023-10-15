# Anti Anime Bot
A Discord.js bot that uses Tensorflow image recognition to automatically punish users with anime profile pictures

Anime     - 694 image samples  
Furry     - 434 image samples  
Neutral   - 314 image samples  
500 epochs training, 16 batch size

<img src="https://github.com/Lozarth/antianimebot/assets/46830521/fb1e0f23-891d-4ef4-8630-65bb96777d60" width="350"/>

## Installation
1. [Make sure you have Node.js installed](https://nodejs.org/en)
2. [Download the bot files](https://download-directory.github.io/?url=https%3A%2F%2Fgithub.com%2FLozarth%2Fantianimebot%2Ftree%2Fmain%2Fbot)
3. Install the NPM dependencies with `npm install`
4. Open `settings.json` in a text editor / IDE of choice
5. Change `botToken` to your bot's token and `serverId` to the main server id that the bot will be used in
6. Change any other settings accordingly
7. Run the bot with `node index.js`

## Features
- Ban / kick / apply role(s) / send custom DM to users who have anime profile pictures
- Ban / kick / apply role(s) / send custom DM to users who have furry profile pictures
- Ban / kick / apply role(s) / send custom DM to users who play certain games such as Genshin Impact and League of Legends

## Planned features
- Punishment lasts until user changes their profile picture

## Creating your own model
https://teachablemachine.withgoogle.com/train
