interface IAudioPlayerChannels {
  [id: string]: {
    audio: AudioBuffer,
    soundNode?: AudioBufferSourceNode,
    gainNode: GainNode,
    defaultVolume?: number,
    volume?: number
  }
}

export interface ISoundManifest {
  [id: string]: {
    src: string;
    defaultVolume?: number;
    name?: string
  }
}


interface IAudioPlayer {
  channels: IAudioPlayerChannels,
  load: () => void;
  play: (id: string, time?: number, shouldLoop?: boolean) => AudioNode;
  playAll: (time?: number, shouldLoop?: boolean) => void;
  stop: (id: string, time?: number) => void;
  stopAll: (time?: number) => void;
  setVolume: (id: string, vol: number) => void;
  resetAllVolume: () => void;
}

export default class AudioPlayer implements IAudioPlayer {
  static context = new window.AudioContext();
  public readonly channels: IAudioPlayerChannels = {};

  constructor(public readonly manifest: ISoundManifest) {
    if (!AudioPlayer.context) {
      throw 'Web Audio API not supported :/';
    }

    this.channels = {};
  }

  async load() {
    for (let k in this.manifest) {
      const res = await fetch(this.manifest[k].src);
      const data = await res.arrayBuffer();
      const audio = await AudioPlayer.context.decodeAudioData(data);
      this.channels[k] = {
        audio,
        gainNode: AudioPlayer.context.createGain()
      };
      this.channels[k].gainNode.connect(AudioPlayer.context.destination);
    }
    this.resetAllVolume();
    return this.channels;
  }

  play(id: string, time: number = 0, shouldLoop: boolean = false) {
    if (!(id in this.channels)) {
      throw `Invalid channel id: ${id}`;
    }
    this.stop(id, time);

    const chan = this.channels[id];
    chan.soundNode = AudioPlayer.context.createBufferSource();
    chan.soundNode.buffer = chan.audio;
    chan.soundNode.loop = shouldLoop;
    chan.soundNode.connect(chan.gainNode);
    chan.soundNode.start(time);

    return chan.soundNode;
  }

  playAll(time: number = 0, shouldLoop: boolean = false) {
    for (let k in this.channels) {
      this.play(k, time, shouldLoop);
    }
  }

  stop(id: string, time: number = 0) {
    if (!(id in this.channels)) {
      throw `Invalid channel id: ${id}`;
    }
    const chan = this.channels[id];
    if (!chan.soundNode) return;

    chan.soundNode.stop();
    chan.soundNode.disconnect();
  }

  stopAll(time: number = 0) {
    for (let k in this.channels) {
      this.stop(k, time);
    }
  }

  setVolume(id: string, vol: number) {
    if (!(id in this.channels)) {
      throw `Invalid channel id: ${id}`;
    }
    const chan = this.channels[id];
    if (!chan.gainNode) return;

    chan.gainNode.gain.value = vol;
    chan.volume = vol;
  }

  resetAllVolume() {
    for (let k in this.channels) {
      const chan = this.channels[k];
      const defaultVol = (this.manifest[k].defaultVolume !== undefined)
        ? this.manifest[k].defaultVolume!
        : 0.5;
      this.setVolume(k, defaultVol);
    }
  }
}
