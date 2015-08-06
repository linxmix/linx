export const Upload2 = {
  type: 'POST',
  url: /echonest.com\/api\/v4\/track\/upload/,
  data: {
    url: "http://s3-us-west-2.amazonaws.com/linx-music/songs/2af0f58efab340fcf0ad00c0084c7ff5.mp3"
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
        "title": "Call My Name (Spencer & Hill Remix) www.livingelectro.com",
        "artist": "Sultan & Ned Shepard Ft. Nadia Ali",
        "analyzer_version": "3.2.2",
        "release": "",
        "audio_md5": "ffef48a9098a780a74127ffc8968df11",
        "bitrate": 320,
        "id": "TRSUCYM14EF0B72B00",
        "samplerate": 44100,
        "md5": "2af0f58efab340fcf0ad00c0084c7ff5"
      }
    }
  }
};
