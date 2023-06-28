const { Client, GatewayIntentBits, ActivityType, EmbedBuilder, REST, Routes, SlashCommandBuilder } = require('discord.js')
const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMembers, GatewayIntentBits.GuildPresences] })

const axios = require('axios')

const JSONdb = require('simple-json-db')
// const database = new JSONdb('./database.json')
const settings = new JSONdb('./settings.json')

const token = settings.get('botToken')
const serverId = settings.get('serverId')

const tf = require('@tensorflow/tfjs-node')
let model = null

client.once('ready', async function () {
    model = await tf.loadLayersModel('https://raw.githubusercontent.com/Lozarth/antianimebot/main/mode/model.json')

    console.log('Anti Anime Bot is ready to punish weebs!')

    await client.user.setActivity('weebs suffer', { type: ActivityType.Watching })

    const commands = [
        new SlashCommandBuilder()
            .setName('ping')
            .setDescription('Shows bot latency'),
        new SlashCommandBuilder()
            .setName('scanmembers')
            .setDescription('Scans all members in the server for anime profile pictures'),
    ]

    const rest = new REST({ version: '10' }).setToken(token)

    try {
        console.log('Started refreshing application (/) commands.')

        await rest.put(
            Routes.applicationGuildCommands(client.user.id, serverId),
            { body: commands.map(command => command.toJSON()) }
        )

        console.log('Successfully reloaded application (/) commands.')
    } catch (err) {
        console.error(err)
    }
})

client.on('interactionCreate', async function (interaction) {
    if (!interaction.isChatInputCommand()) return

    if (interaction.commandName === 'ping') {
        await interaction.reply({ content: `Pong! 🏓\nLatency is ${Date.now() - interaction.createdTimestamp}ms.`, ephemeral: true })
    } else if (interaction.commandName === 'scanmembers') {
        await interaction.reply({ content: 'Scanning members...', ephemeral: true })

        let members = await interaction.guild.members.fetch({ limit: 1000 })
        members = members.filter(member => !member.user.bot)
        members = members.sort((a, b) => b.joinedTimestamp - a.joinedTimestamp)

        const weebSettings = settings.get('weebSettings')
        const minimumConfidence = weebSettings.minimumConfidence
        const punishments = weebSettings.punishments
        const punishment = Object.keys(punishments).find(punishment => punishments[punishment].enabled === true)
        const punishmentSettings = punishments[punishment]
        let punishmentMessage = punishmentSettings.message

        for (const member of members.values()) {
            if (member.user.bot) continue

            const avatarUrl = member.user.displayAvatarURL({ extension: 'png', size: 512, forceStatic: true })
            const prediction = await predictImage(avatarUrl).then(JSON.parse)

            console.log(prediction)

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
                            const role = await client.guilds.cache.get(serverId).roles.fetch(roleId)
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

        await interaction.followUp({ content: 'Finished scanning members!', ephemeral: true })
    }
})

client.on('guildMemberAdd', async function (member) {
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
                    const role = await client.guilds.cache.get(serverId).roles.fetch(roleId)
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
})

client.on('userUpdate', async function (oldUser, newUser) {
    if (oldUser.avatar !== newUser.avatar) {
        console.log(`${newUser.username} updated their profile picture`)

        const member = await client.guilds.cache.get(serverId).members.fetch(newUser.id)
        const avatarUrl = newUser.displayAvatarURL({ extension: 'png', size: 512, forceStatic: true })
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
                        const role = await client.guilds.cache.get(serverId).roles.fetch(roleId)
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
})

client.on('presenceUpdate', async function (oldPresence, newPresence) {
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
                        const role = await client.guilds.cache.get(serverId).roles.fetch(roleId)
                        await member.roles.add(role)
                        await member.send({ content: punishmentMessage.replace('{role_name}', role.name) })

                        console.log(`Gave ${member.user.username} the ${role.name} role for playing ${activity.name}`)
                    }
                }

                if (Object.keys(gameSpecificRoles).length > 0) {
                    for (const game of Object.keys(gameSpecificRoles)) {
                        if (game === activity.name) {
                            const role = await client.guilds.cache.get(serverId).roles.fetch(gameSpecificRoles[game])
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
})

client.login(token)

async function predictImage(imageUrl) {
    const startTime = Date.now()

    // Download image
    const image = await axios.get(imageUrl, { responseType: 'arraybuffer' }).then(response => Buffer.from(response.data, 'binary'))

    // Read image
    const imageTensor = tf.node.decodeImage(image, 3)
    const imageResized = tf.image.resizeBilinear(imageTensor, [224, 224])
    const imageReshaped = imageResized.reshape([1, 224, 224, 3])
    const imageNormalized = imageReshaped.div(255)

    // Predict image
    const prediction = await model.predict(imageNormalized)
    const predictedClass = tf.argMax(prediction, 1).dataSync()[0]
    const predictedClassName = ['Anime', 'Not Anime'][predictedClass]
    const predictedClassConfidence = await prediction.dataSync()[predictedClass].toFixed(2)

    const endTime = Date.now()

    return JSON.stringify({ class: predictedClassName, confidence: Number(predictedClassConfidence), time: `${endTime - startTime}ms` })
}

process.on('unhandledRejection', function (error) {
    console.error(error)
})