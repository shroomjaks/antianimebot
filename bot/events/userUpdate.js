const { buffer } = require('@tensorflow/tfjs')
const { ActionRowBuilder, ButtonBuilder, EmbedBuilder, ButtonStyle } = require('discord.js')

module.exports = {
    name: 'userUpdate',
    async execute(oldUser, newUser, client, settings, predictImage) {
        if (oldUser.avatar !== newUser.avatar) {
            console.log(`${newUser.username} updated their profile picture`)

            const member = await client.guilds.cache.get(settings.get('serverId')).members.fetch(newUser.id)
            const avatarUrl = newUser.displayAvatarURL({ extension: 'png', size: 512, forceStatic: true })
            const prediction = await predictImage(avatarUrl).then(JSON.parse)

            console.log(prediction)

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
                    const roleIds = furryPunishmentSettings['roles']

                    if (roleIds.length > 0) {
                        for (const roleId of roleIds) {
                            const role = await member.guild.roles.fetch(roleId)
                            await member.roles.add(role)
                            await member.send({ content: weebPunishmentMessage.replace('{role_name}', role.name) })

                            console.log(`Gave ${member.user.username} the ${role.name} role for having an anime profile picture`)
                        }
                    }
                } else if (weebPunishment === 'send_message') {
                    await member.send({ content: punishmentMessage })

                    console.log(`Sent ${member.user.username} a message for having an anime profile picture`)
                } 
                // else if (weebPunishment === 'review') {
                //     const reviewChannelId = punishmentSettings['channelId']

                //     if (reviewChannelId) {
                //         const reviewChannel = await client.channels.fetch(reviewChannelId)

                //         reviewChannel.send({
                //             content: 'Choose a punishment for this weeb',
                //             components: [
                //                 new ActionRowBuilder().addComponents(
                //                     new ButtonBuilder()
                //                         .setLabel('Ban')
                //                         .setCustomId(`ban_${member.id}`)
                //                         .setStyle(ButtonStyle.Danger),
                //                     new ButtonBuilder()
                //                         .setLabel('Kick')
                //                         .setCustomId(`kick_${member.id}`)
                //                         .setStyle(ButtonStyle.Danger),
                //                     new ButtonBuilder()
                //                         .setLabel('Give Role')
                //                         .setCustomId(`give_role_${member.id}`)
                //                         .setStyle(ButtonStyle.Danger)
                //                 )
                //             ],
                //             embeds: [
                //                 new EmbedBuilder()
                //                     .setTitle(member.user.username)
                //                     .setThumbnail(member.user.displayAvatarURL({ extension: 'png', size: 1024, forceStatic: true }))
                //                     .setDescription(`**Confidence:** ${prediction.confidence}\n**Class:** ${prediction.class}`)
                //             ]
                //         })
                //     }
                // }
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
    }
}