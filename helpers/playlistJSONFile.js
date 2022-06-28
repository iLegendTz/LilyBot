const fs = require('fs');

const addSong = (playlistJSON) => {
  fs.writeFile(
    './playlists/playlist.json',
    JSON.stringify(playlistJSON),
    'utf-8',
    (err) => {
      if (err) {
        console.error(`Error: ${error.message}`);
        return null;
      }
    }
  );
};

const deleteSong = (idx = 0, playlistJSON) => {
  playlistJSON.songs.splice(0, 1);

  fs.writeFile(
    './playlists/playlist.json',
    JSON.stringify(playlistJSON),
    'utf-8',
    (err) => {
      if (err) {
        console.error(`Error: ${error.message}`);
        return null;
      }
    }
  );
};

module.exports = {
  addSong,
  deleteSong,
};
