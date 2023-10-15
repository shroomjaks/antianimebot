const { Client, GatewayIntentBits, ActivityType, REST, Routes } = require('discord.js')
const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMembers, GatewayIntentBits.GuildPresences] })

const axios = require('axios')

const fs = require('fs')
const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'))
const eventFiles = fs.readdirSync('./events').filter(file => file.endsWith('.js'))
client.commands = new Map()
client.events = new Map()

const JSONdb = require('simple-json-db')
const settings = new JSONdb('./settings.json')
const token = settings.get('botToken')
const serverId = settings.get('serverId')

const tf = require('@tensorflow/tfjs-node')
let model = null
client.once('ready', async function () {
    model = await tf.loadLayersModel('https://raw.githubusercontent.com/Lozarth/antianimebot/main/model/model.json')

    const rest = new REST({ version: '10' }).setToken(settings.get('botToken'))

    const commands = []

    for (const file of commandFiles) {
        const command = require(`./commands/${file}`)
        const commandData = command.data.toJSON()
        
        client.commands.set(commandData.name, command)

        commands.push(commandData)
    }

    try {
        console.log('Started refreshing slash commands...')

        await rest.put(
            Routes.applicationGuildCommands(client.user.id, serverId),
            { body: commands }
        )

        console.log('Successfully reloaded slash commands')
    } catch (err) {
        console.error(err)
    }

    for (const file of eventFiles) {
        const event = require(`./events/${file}`)
        client.events.set(event.name, event)
    }

    console.log('Anti Anime Bot is ready to punish degens!')

    await client.user.setActivity('weebs suffer', { type: ActivityType.Watching })
})

client.on('interactionCreate', async function (interaction) {
    if (interaction.isChatInputCommand()) {
        const command = client.commands.get(interaction.commandName)

        if (!command) return

        try {
            await command.execute(interaction, client, settings, predictImage)
        } catch (err) {
            console.error(err)
            await interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true })
        }
    }
})

client.on('guildMemberAdd', async function (member) {
    const guildMemberAddEvent = client.events.get('guildMemberAdd')

    try {
        await guildMemberAddEvent.execute(member, client, settings, predictImage)
    } catch (err) {
        console.error(err)
    }
})

client.on('userUpdate', async function (oldUser, newUser) {
    const userUpdateEvent = client.events.get('userUpdate')

    try {
        await userUpdateEvent.execute(oldUser, newUser, client, settings, predictImage)
    } catch (err) {
        console.error(err)
    }
})

client.on('presenceUpdate', async function (oldPresence, newPresence) {
    const presenceUpdateEvent = client.events.get('presenceUpdate')

    try {
        await presenceUpdateEvent.execute(oldPresence, newPresence, client, settings)
    } catch (err) {
        console.error(err)
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
    const predictedClassName = ['Anime', 'Furry', 'Neutral'][predictedClass]
    const predictedClassConfidence = await prediction.dataSync()[predictedClass].toFixed(2)

    const endTime = Date.now()

    return JSON.stringify({ class: predictedClassName, confidence: Number(predictedClassConfidence), time: `${endTime - startTime}ms` })
}

process.on('unhandledRejection', function (error) {
    console.error(error)
})