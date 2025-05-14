const { REST, Routes } = require('discord.js');
const fs = require('fs');
require('dotenv').config();

const commands = [];
const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
  const command = require(`./commands/${file}`);
  commands.push(command.data.toJSON());
}

const rest = new REST({ version: '10' }).setToken(process.env.TOKEN);

// Ganti CLIENT_ID dan GUILD_ID
const CLIENT_ID = '909807762517680158';
const GUILD_ID = '1241270946086654005';

(async () => {
  try {
    console.log('Mengupdate slash command...');
    await rest.put(Routes.applicationGuildCommands(CLIENT_ID, GUILD_ID), {
      body: commands,
    });
    console.log('Berhasil!');
  } catch (error) {
    console.error(error);
  }
})();
