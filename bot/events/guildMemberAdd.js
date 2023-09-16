module.exports = {
    name: 'guildMemberAdd',
    async execute(member, client, settings, predictImage) {
        if (member.user.bot) return

        const avatarUrl = member.user.displayAvatarURL({ extension: 'png', size: 512, forceStatic: true })
        const prediction = await predictImage(avatarUrl).then(JSON.parse)

        console.log(prediction)

        const weebSettings = settings.get('weebSettings')
        const minimumConfidence = weebSettings.minimumConfidence
        const punishments = weebSettings.punishments
        const punishment = Object.keys(punishments).find(punishment => punishments[punishment].enabled === true)
        const punishmentSettings = punishments[punishment]
        let punishmentMessage = punishmentSettings.message

        if (prediction.class === 'Anime' && prediction.confidence >= minimumConfidence) {
            console.log(`${member.user.username} is a weeb!`)

            if (punishment === 'kick' && member.kickable) {
                await member.send({ content: punishmentMessage })
                await member.kick({ reason: punishmentMessage })

                console.log(`Kicked ${member.user.username} for having an anime profile picture`)
            } else if (punishment === 'ban' && member.bannable) {
                await member.send({ content: punishmentMessage })
                await member.ban({ reason: punishmentMessage })

                console.log(`Banned ${member.user.username} for having an anime profile picture`)
            } else if (punishment === 'give_role' && member.roles.highest.position < member.guild.members.me.roles.highest.position) {
                const roleIds = punishmentSettings['roles']

                if (roleIds.length > 0) {
                    for (const roleId of roleIds) {
                        const role = await member.guild.roles.fetch(roleId)
                        await member.roles.add(role)
                        await member.send({ content: punishmentMessage.replace('{role_name}', role.name) })

                        console.log(`Gave ${member.user.username} the ${role.name} role for having an anime profile picture`)
                    }
                }
            } else if (punishment === 'send_message') {
                await member.send({ content: punishmentMessage })

                console.log(`Sent ${member.user.username} a message for having an anime profile picture`)
            }
        }
    }
}