const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { startRumbleWithMessage } = require('../utils/battleEngine');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('rumble')
    .setDescription('Mulai pertarungan battle royale!'),

  async execute(interaction) {
    const embed = new EmbedBuilder()
      .setTitle('Battle Royale Dimulai!')
      .setDescription('Klik emoji 🗡️ untuk bergabung dalam pertarungan!\nPertarungan akan dimulai dalam 15 detik!')
      .setColor('Red');

    const message = await interaction.reply({ embeds: [embed], fetchReply: true });
    await message.react('🗡️');
    startRumbleWithMessage(interaction, message);
  },
};
