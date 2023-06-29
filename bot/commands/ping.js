const { SlashCommandBuilder } = require('discord.js')

module.exports = {
    data: new SlashCommandBuilder()
        .setName('ping')
        .setDescription('Shows bot latency'),
    async execute(interaction) {
        await interaction.reply({ content: `Pong! 🏓\nLatency is ${Date.now() - interaction.createdTimestamp}ms.`, ephemeral: true })
    }
}