export const Upload1 = {
  type: 'POST',
  url: /echonest.com\/api\/v4\/track\/upload/,
  data: {
    url: "http://s3-us-west-2.amazonaws.com/linx-music/songs/2aa83018ce0bb7ca44e9263ed5d25817.mp3"
  },
  responseText: {
    "response": {
      "status": {
        "version": "4.2",
        "code": 0,
        "message": "Success"
      },
      "track": {
        "status": "pending",
        "title": "Give It Up for Love feat. John Williams (Mysto & Pizzi Remix)",
        "artist": "EDX, John Williams",
        "analyzer_version": "3.2.2",
        "release": "",
        "audio_md5": "848c3760ab8f25f4f9cd6fd46acb801d",
        "bitrate": 320,
        "id": "TRAWOGC14E8320817F",
        "samplerate": 44100,
        "md5": "2aa83018ce0bb7ca44e9263ed5d25817"
      }
    }
  }
};
