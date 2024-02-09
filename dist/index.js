import AudioPlayer from "./audioplayer.js";
import { createElsFromTemplate } from "./utils.js";
async function main() {
    console.log("START");
    const soundManifest = {
        wind: {
            name: "Wind",
            src: "./assets/wind2.mp3"
        },
        rain: {
            name: "Village Rain",
            src: "./assets/rain1.mp3"
        }
    };
    const player = new AudioPlayer(soundManifest);
    const channels = await player.load();
    const ctrlArea = document.querySelector("#controls");
    for (let k in channels) {
        const tpl = `
      <label class="mixer-ctrl" data-channel="${k}">
        <span>${soundManifest[k].name || k}</span>
        <input type="range" min="0" max="1" step="0.01" value="${channels[k].defaultVolume}" id="${k}">
      </label>
    ;`;
        const el = createElsFromTemplate(tpl)[0];
        const ipt = el.querySelector(`#${k}`);
        ipt.addEventListener("input", (e) => {
            player.setVolume(k, parseFloat(ipt.value));
        });
        ctrlArea.append(el);
    }
    const playBut = document.querySelector("#play");
    playBut.addEventListener("click", () => {
        AudioPlayer.context.resume();
        player.playAll(0, true);
        playBut.disabled = true;
    });
    playBut.disabled = false;
}
main();
