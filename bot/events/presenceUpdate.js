module.exports = {
    name: 'presenceUpdate',
    async execute(oldPresence, newPresence, client, settings) {
        if (newPresence.activities.length === 0) return

        const member = await newPresence.guild.members.fetch(newPresence.userId)
        if (member.user.bot) return

        for (const activity of newPresence.activities) {
            if (activity.type !== ActivityType.Playing) continue

            console.log(`${member.user.username} is playing ${activity.name}`)

            const gameSettings = settings.get('gameSettings')
            const bannedGames = gameSettings.bannedGames
            const punishments = gameSettings.punishments
            const punishment = Object.keys(punishments).find(punishment => punishments[punishment].enabled === true)
            const punishmentSettings = punishments[punishment]
            let punishmentMessage = punishmentSettings.message
            punishmentMessage = punishmentMessage.replace('{game_name}', activity.name)

            if (bannedGames.includes(activity.name)) {
                if (punishment === 'kick' && member.kickable) {
                    await member.send({ content: punishmentMessage })
                    await member.kick({ reason: punishmentMessage })

                    console.log(`Kicked ${member.user.username} for playing ${activity.name}`)
                } else if (punishment === 'ban' && member.bannable) {
                    await member.send({ content: punishmentMessage })
                    await member.ban({ reason: punishmentMessage })

                    console.log(`Banned ${member.user.username} for playing ${activity.name}`)
                } else if (punishment === 'give_role' && member.roles.highest.position < member.guild.members.me.roles.highest.position) {
                    const roleIds = punishmentSettings['roles']
                    const gameSpecificRoles = punishmentSettings['game_specific_roles']

                    if (roleIds.length > 0) {
                        for (const roleId of roleIds) {
                            const role = await member.guild.roles.fetch(roleId)
                            await member.roles.add(role)
                            await member.send({ content: punishmentMessage.replace('{role_name}', role.name) })

                            console.log(`Gave ${member.user.username} the ${role.name} role for playing ${activity.name}`)
                        }
                    }

                    if (Object.keys(gameSpecificRoles).length > 0) {
                        for (const game of Object.keys(gameSpecificRoles)) {
                            if (game === activity.name) {
                                const role = await member.guild.roles.fetch(gameSpecificRoles[game])
                                await member.roles.add(role)
                                await member.send({ content: punishmentMessage.replace('{role_name}', role.name) })

                                console.log(`Gave ${member.user.username} the ${role.name} role for playing ${activity.name}`)
                            }
                        }
                    }
                } else if (punishment === 'send_message') {
                    await member.send({ content: punishmentMessage })

                    console.log(`Sent ${member.user.username} a message for playing ${activity.name}`)
                }
            }
        }
    }
}