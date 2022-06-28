const { MessageEmbed } = require('discord.js');

const editEmbedMessage = async (message, embeds) => {
  await message.edit({ embeds: embeds }).catch((error) => {
    console.error(`Error: ${error.message}`);
  });
};

const deleteMessage = (message) => {
  setTimeout(async () => {
    await message.delete().catch((error) => {
      console.error(`Error: ${error.message}`);
    });
  }, 2_000);
};

const embedSongList = (songNamesList, querySong) => {
  const embed = new MessageEmbed()
    .setColor('#0099ff')
    .setTitle(`Busqueda de "${querySong}"`)
    .setDescription(songNamesList)
    .setTimestamp();

  return embed;
};

const embedTimeOut = () => {
  const embed = new MessageEmbed()
    .setColor('#0099ff')
    .setTitle('Timeout')
    .setTimestamp();

  return embed;
};

const embedCanceled = () => {
  const embed = new MessageEmbed()
    .setColor('#0099ff')
    .setTitle('Canceled')
    .setTimestamp();

  return embed;
};

const embedError = () => {
  const embed = new MessageEmbed()
    .setColor('#0099ff')
    .setTitle('Error al reproducir la cancion')
    .setTimestamp();

  return embed;
};

module.exports = {
  editEmbedMessage,
  deleteMessage,
  embedSongList,
  embedTimeOut,
  embedCanceled,
  embedError,
};
