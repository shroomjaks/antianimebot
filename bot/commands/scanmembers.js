const { SlashCommandBuilder } = require('discord.js')

module.exports = {
    data: new SlashCommandBuilder()
        .setName('scanmembers')
        .setDescription('Scans members in the server for anime profile pictures (max 1000 members)'),
    async execute(interaction, client, settings, predictImage) {
        await interaction.reply({ content: 'Scanning members...', ephemeral: true })

        let members = await interaction.guild.members.fetch({ limit: 1000 })
        members = members.filter(member => !member.user.bot)
        members = members.sort((a, b) => b.joinedTimestamp - a.joinedTimestamp)

        const weebSettings = settings.get('weebSettings')
        const weebMinimumConfidence = weebSettings.minimumConfidence
        const weebPunishments = weebSettings.punishments
        const weebPunishment = Object.keys(weebPunishments).find(punishment => weebPunishments[punishment].enabled === true)
        const weebPunishmentSettings = weebPunishments[weebPunishment]
        let weebPunishmentMessage = weebPunishmentSettings.message

        const furrySettings = settings.get('furrySettings')
        const furryMinimumConfidence = furrySettings.minimumConfidence
        const furryPunishments = furrySettings.punishments
        const furryPunishment = Object.keys(furryPunishments).find(punishment => furryPunishments[punishment].enabled === true)
        const furryPunishmentSettings = furryPunishments[furryPunishment]
        let furryPunishmentMessage = furryPunishmentSettings.message

        for (const member of members.values()) {
            if (member.user.bot) continue

            const avatarUrl = member.user.displayAvatarURL({ extension: 'png', size: 512, forceStatic: true })
            const prediction = await predictImage(avatarUrl).then(JSON.parse)

            console.log(prediction)

            if (prediction.class === 'Anime' && prediction.confidence >= weebMinimumConfidence) {
                console.log(`${member.user.username} is a weeb!`)

                if (weebPunishment === 'kick' && member.kickable) {
                    await member.send({ content: weebPunishmentMessage })
                    await member.kick({ reason: weebPunishmentMessage })

                    console.log(`Kicked ${member.user.username} for having an anime profile picture`)
                } else if (weebPunishment === 'ban' && member.bannable) {
                    await member.send({ content: weebPunishmentMessage })
                    await member.ban({ reason: weebPunishmentMessage })

                    console.log(`Banned ${member.user.username} for having an anime profile picture`)
                } else if (weebPunishment === 'give_role' && member.roles.highest.position < member.guild.members.me.roles.highest.position) {
                    const roleIds = weebPunishmentSettings['roles']

                    if (roleIds.length > 0) {
                        for (const roleId of roleIds) {
                            const role = await member.guild.roles.fetch(roleId)
                            await member.roles.add(role)
                            await member.send({ content: weebPunishmentMessage.replace('{role_name}', role.name) })

                            console.log(`Gave ${member.user.username} the ${role.name} role for having an anime profile picture`)
                        }
                    }
                } else if (weebPunishment === 'send_message') {
                    await member.send({ content: weebPunishmentMessage })

                    console.log(`Sent ${member.user.username} a message for having an anime profile picture`)
                }
            } else if (prediction.class === 'Furry' && prediction.confidence >= furryMinimumConfidence) {
                console.log(`${member.user.username} is a furry!`)

                if (furryPunishment === 'kick' && member.kickable) {
                    await member.send({ content: furryPunishmentMessage })
                    await member.kick({ reason: furryPunishmentMessage })

                    console.log(`Kicked ${member.user.username} for having a furry profile picture`)
                } else if (furryPunishment === 'ban' && member.bannable) {
                    await member.send({ content: furryPunishmentMessage })
                    await member.ban({ reason: furryPunishmentMessage })

                    console.log(`Banned ${member.user.username} for having a furry profile picture`)
                } else if (furryPunishment === 'give_role' && member.roles.highest.position < member.guild.members.me.roles.highest.position) {
                    const roleIds = furryPunishmentSettings['roles']

                    if (roleIds.length > 0) {
                        for (const roleId of roleIds) {
                            const role = await member.guild.roles.fetch(roleId)
                            await member.roles.add(role)
                            await member.send({ content: furryPunishmentMessage.replace('{role_name}', role.name) })

                            console.log(`Gave ${member.user.username} the ${role.name} role for having a furry profile picture`)
                        }
                    }
                } else if (furryPunishment === 'send_message') {
                    await member.send({ content: furryPunishmentMessage })

                    console.log(`Sent ${member.user.username} a message for having a furry profile picture`)
                }
            }
        }

        await interaction.followUp({ content: 'Finished scanning members!', ephemeral: true })
    }
}