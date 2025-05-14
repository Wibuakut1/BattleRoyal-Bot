const { addWinAndXP, ensureUser } = require('./db');

let queue = [];
let isRunning = false;
let activeMessageId = null;

function handleReactionJoin(reaction, user) {
  if (reaction.emoji.name !== '🗡️') return;
  if (reaction.message.id !== activeMessageId) return;
  if (queue.find(p => p.id === user.id)) return;

  queue.push({ id: user.id, username: user.username, hp: 100 });
  ensureUser(user);
  console.log(`${user.username} bergabung melalui reaksi!`);
}

async function startRumbleWithMessage(interaction, message) {
  if (isRunning) return;
  isRunning = true;
  activeMessageId = message.id;

  setTimeout(async () => {
    if (queue.length < 2) {
      await interaction.followUp('Peserta tidak cukup untuk bertarung!');
      queue = [];
      activeMessageId = null;
      isRunning = false;
      return;
    }

    await interaction.followUp(`Total peserta: **${queue.length}**! Pertarungan dimulai!`);

    while (queue.length > 1) {
      const attacker = queue[Math.floor(Math.random() * queue.length)];
      let target;
      do {
        target = queue[Math.floor(Math.random() * queue.length)];
      } while (target.id === attacker.id);

      const damage = Math.floor(Math.random() * 30) + 10;
      target.hp -= damage;

      await interaction.followUp(`**${attacker.username}** menyerang **${target.username}** dan memberikan ${damage} damage! (${target.hp <= 0 ? 'KO!' : target.hp + ' HP tersisa'})`);

      if (target.hp <= 0) {
        queue = queue.filter(p => p.id !== target.id);
        await interaction.followUp(`**${target.username}** telah dieliminasi!`);
      }

      await new Promise(r => setTimeout(r, 3000));
    }

    const winner = queue[0];
    await interaction.followUp(`**${winner.username}** memenangkan pertarungan! +50 XP!`);
    addWinAndXP(winner.id);
    queue = [];
    activeMessageId = null;
    isRunning = false;
  }, 15000);
}

module.exports = { handleReactionJoin, startRumbleWithMessage };
