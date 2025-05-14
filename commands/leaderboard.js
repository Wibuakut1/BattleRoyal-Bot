const { SlashCommandBuilder } = require('discord.js');
const { getLeaderboard } = require('../utils/db');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('leaderboard')
    .setDescription('Lihat peringkat pemain'),

  async execute(interaction) {
    const leaderboard = getLeaderboard();
    await interaction.reply(leaderboard);
  },
};
