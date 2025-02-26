// Imports
const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { getDescription, getVersion } = require('../commonFunctions.js')

module.exports = {
  // Define 'random' command
  data: new SlashCommandBuilder()
    .setName('random')
	  .setDescription('Gets a random online Minecraft server'),
  async execute(interaction) {
    const { scannedServersDB } = require('../index.js');
    // Status message
    await interaction.reply("Getting a server, please wait...");
    
    // Get a random server from the database
    const totalServers = await scannedServersDB.countDocuments({ 'lastSeen': { '$gte': Math.round(new Date().getTime() / 1000) - 3600 }});
    var index = Math.floor((Math.random() * totalServers));
    const server = (await (await scannedServersDB.find({ 'lastSeen': { '$gte': Math.round(new Date().getTime() / 1000) - 3600 }}).skip(index).limit(1)).toArray())[0];
    var newEmbed = new EmbedBuilder()
        .setColor("#02a337")
        .setTitle('Random Server')
        .setAuthor({ name: 'MC Server Scanner', iconURL: 'https://cdn.discordapp.com/app-icons/1037250630475059211/21d5f60c4d2568eb3af4f7aec3dbdde5.png' })
        .setThumbnail(`https://ping.cornbread2100.com/favicon/?ip=${server.ip}&port=${server.port}`)
        .addFields(
          { name:  `Server ${index}/${totalServers}`, value: 'ㅤ' },
          { name: 'IP', value: server.ip },
          { name: 'Port', value: String(server.port) },
          { name: 'Version', value: getVersion(server.version) },
          { name: 'Description', value: getDescription(server.description) }
        )
        .setTimestamp()

      var playersString = `${server.players.online}/${server.players.max}`
      if (server.players.sample != null) {
        for (var i = 0; i < server.players.sample.length; i++) {
          playersString += `\n${server.players.sample[i].name}\n${server.players.sample[i].id}`;
          if (i + 1 < server.players.sample.length) playersString += '\n'
        }
      }

      newEmbed.addFields(
        { name: 'Players', value: playersString },
        { name: 'Last Seen', value: `<t:${server.lastSeen}:f>` }
      )

    interaction.editReply({ content:'', embeds: [newEmbed] });

    const auth = await (await fetch(`https://ping.cornbread2100.com/cracked/?ip=${server.ip}&port=${server.port}`)).text();
    if (auth == 'true') {
      newEmbed.addFields(
        { name: 'Auth', value: 'Cracked' }
      )
      await interaction.editReply({ content:'', embeds: [newEmbed] });
    } else if (auth == 'false') {
      newEmbed.addFields(
        { name: 'Auth', value: 'Premium' }
      )
      await interaction.editReply({ content:'', embeds: [newEmbed] });
    } else {
      newEmbed.addFields(
        { name: 'Auth', value: 'Unknown' }
      )
      await interaction.editReply({ content:'', embeds: [newEmbed] });
    }
  },
}
