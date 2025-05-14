const { SlashCommandBuilder } = require('discord.js');
const { getPlayerStats } = require('../utils/db');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('profile')
    .setDescription('Lihat statistik karaktermu'),

  async execute(interaction) {
    const userId = interaction.user.id;
    const stats = getPlayerStats(userId);
    await interaction.reply(stats);
  },
};
