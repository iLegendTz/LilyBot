const {
  joinVoiceChannel,
  createAudioPlayer,
  createAudioResource,
  NoSubscriberBehavior,
  AudioPlayerStatus,
  getVoiceConnection,
} = require('@discordjs/voice');

const yts = require('yt-search');
const { validateURL } = require('ytdl-core');
const ytdl = require('ytdl-core');

const {
  editEmbedMessage,
  deleteMessage,
  embedSongList,
  embedTimeOut,
  embedCanceled,
  embedError,
} = require('../helpers/embedMessages.js');

const playlistJSON = require('../playlists/playlist.json');
const path = require('path');
const { addSong, deleteSong } = require('../helpers/playlistJSONFile.js');

module.exports = {
  name: 'play',
  description: 'Starts play music',
  execute: async (message, args) => {
    const bot = message.channel.members.find(
      (member) => member.id === process.env.BOT_ID
    );

    let connection;

    if (bot.voice.channel === null) {
      try {
        connection = joinVoiceChannel({
          channelId: message.member.voice.channel.id,
          guildId: message.member.voice.guild.id,
          adapterCreator: message.member.voice.guild.voiceAdapterCreator,
        });
      } catch (error) {
        message.reply('No estas en ningun canal de voz');
        return;
      }
    } else {
      connection = getVoiceConnection(message.member.voice.guild.id);
      // console.log(connection._state.subscription.player);
    }

    const querySong = args.join(' ');

    if (validateURL(querySong)) {
      console.log(querySong);
    } else {
      addSongByQuery(message, querySong, connection);
    }
  },
};

const addSongByQuery = async (message, querySong, connection) => {
  const videos = await searchVideosByQuery(querySong);

  const songNamesList = videos.map(
    (v, index) => `[${index + 1} - ${v.title}](${v.url})`
  );
  songNamesList.push('0 - Cancelar');

  const botReply = await message.reply({
    embeds: [embedSongList(songNamesList.join('\n'), querySong)],
  });

  const filter = (m) => {
    const number = parseInt(m.content);
    return (
      m.author.id === message.author.id &&
      number >= 0 &&
      number <= 10 &&
      Number.isInteger(number)
    );
  };

  message.channel
    .awaitMessages({ filter, max: 1, time: 5_000, errors: ['time'] })
    .then(async (collected) => {
      let songIdxSelected = parseInt(collected.first().content);
      if (songIdxSelected === 0) {
        await editEmbedMessage(botReply, [embedCanceled()]);
        deleteMessage(botReply);
        return;
      }
      songIdxSelected = songIdxSelected - 1;

      playlistJSON.songs.push(videos[songIdxSelected]);
      addSong(playlistJSON);

      playSong(botReply, connection);
    })
    .catch(async (error) => {
      // TODO cualquier error lo toma como timeout
      console.error(`Error: ${error.message}`);
      await editEmbedMessage(botReply, [embedTimeOut()]);
      deleteMessage(botReply);
    });
};

const playSong = async (botReply, connection) => {
  let player;
  try {
    if (connection._state.subscription) {
      player = connection._state.subscription.player;
    } else {
      player = createAudioPlayer({
        behaviors: {
          noSubscriber: NoSubscriberBehavior.Pause,
        },
      });
    }
  } catch (error) {
    console.error(`Error: ${error.message}`);
    await editEmbedMessage(botReply, [embedError()]);
    return;
  }

  player.play(createResource());
  connection.subscribe(player);

  player.on(AudioPlayerStatus.Idle, () => {
    deleteSong(0, playlistJSON);
    if (playlistJSON.songs.length > 0) {
      player.play(createResource());
      connection.subscribe(player);
    }
  });

  player.on(AudioPlayerStatus.Buffering, () => {
    console.log(player._state.status);
  });

  player.on(AudioPlayerStatus.Playing, () => {
    console.log(player._state.status);
  });

  player.on(AudioPlayerStatus.AutoPaused, () => {
    console.log(player._state.status);
  });

  player.on('error', async (error) => {
    console.error(`Error: ${error.message}`);
    await editEmbedMessage(botReply, [embedError()]);
  });
};

const createResource = () => {
  const stream = ytdl(playlistJSON.songs[0].url, {
    filter: 'audioonly',
  });
  const resource = createAudioResource(stream);

  return resource;
};

const searchVideosByQuery = async (querySong) => {
  const songs = [];

  const r = await yts(querySong);
  const videos = r.videos.slice(0, 10);
  videos.forEach((v) => {
    const views = String(v.views).padStart(10, ' ');
    songs.push({ author: v.author, views: views, title: v.title, url: v.url });
  });

  return songs;
};
