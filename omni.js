(function (Scratch) {
  'use strict';

  let midiAccess = null;
  let midiOut = null;

  async function initMIDI() {
    if (!navigator.requestMIDIAccess) {
      alert("Web MIDI APIが未対応です。Chrome/Edgeで開いてください。");
      return;
    }
    midiAccess = await navigator.requestMIDIAccess();
    for (let output of midiAccess.outputs.values()) {
      if (output.name.includes("OmniMIDI")) {
        midiOut = output;
        console.log("OmniMIDIを使用します:", output.name);
        break;
      }
    }
    if (!midiOut) midiOut = midiAccess.outputs.values().next().value;
  }

  initMIDI();

  class OmniMIDI {
    getInfo() {
      return {
        id: 'omnimidi',
        name: 'OmniMIDI',
        color1: '#6699ff',
        color2: '#5577ee',
        color3: '#3355cc',
        blocks: [
          {
            opcode: 'noteOn',
            blockType: Scratch.BlockType.COMMAND,
            text: 'OmniMIDIでノートON [NOTE] Vel [VEL]',
            arguments: {
              NOTE: { type: Scratch.ArgumentType.STRING, defaultValue: '60' },
              VEL: { type: Scratch.ArgumentType.NUMBER, defaultValue: 100 }
            }
          },
          {
            opcode: 'noteOff',
            blockType: Scratch.BlockType.COMMAND,
            text: 'OmniMIDIでノートOFF [NOTE]',
            arguments: {
              NOTE: { type: Scratch.ArgumentType.STRING, defaultValue: '60' }
            }
          },
          {
            opcode: 'programChange',
            blockType: Scratch.BlockType.COMMAND,
            text: '音色を [PROG] に変更',
            arguments: {
              PROG: { type: Scratch.ArgumentType.NUMBER, defaultValue: 0 }
            }
          },
          {
            opcode: 'gmReset',
            blockType: Scratch.BlockType.COMMAND,
            text: 'GMリセットを送信'
          }
        ]
      };
    }

    noteOn(args) {
      if (!midiOut) return;
      const note = Number(args.NOTE);
      const vel = Number(args.VEL);
      midiOut.send([0x90, note, vel]);
    }

    noteOff(args) {
      if (!midiOut) return;
      const note = Number(args.NOTE);
      midiOut.send([0x80, note, 0]);
    }

    programChange(args) {
      if (!midiOut) return;
      midiOut.send([0xC0, Number(args.PROG)]);
    }

    gmReset() {
      if (!midiOut) return;
      for (let ch = 0; ch < 16; ch++) {
        midiOut.send([0xB0 + ch, 121, 0]);
        midiOut.send([0xB0 + ch, 123, 0]);
      }
    }
  }

  Scratch.extensions.register(new OmniMIDI());
})(Scratch);
