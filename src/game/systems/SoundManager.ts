export class SoundManager {
    private ctx: AudioContext | null = null;
    private musicNodes: { osc: OscillatorNode; gain: GainNode }[] = [];
    private musicPlaying: boolean = false;

    private getContext(): AudioContext {
        if (!this.ctx) {
            this.ctx = new AudioContext();
        }
        if (this.ctx.state === 'suspended') {
            this.ctx.resume();
        }
        return this.ctx;
    }

    playJump(): void {
        const ctx = this.getContext();
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(300, ctx.currentTime);
        osc.frequency.linearRampToValueAtTime(600, ctx.currentTime + 0.15);
        gain.gain.setValueAtTime(0.15, ctx.currentTime);
        gain.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.15);
        osc.connect(gain).connect(ctx.destination);
        osc.start(ctx.currentTime);
        osc.stop(ctx.currentTime + 0.15);
    }

    playCoin(): void {
        const ctx = this.getContext();
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'square';
        osc.frequency.setValueAtTime(800, ctx.currentTime);
        osc.frequency.setValueAtTime(1200, ctx.currentTime + 0.05);
        gain.gain.setValueAtTime(0.1, ctx.currentTime);
        gain.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.12);
        osc.connect(gain).connect(ctx.destination);
        osc.start(ctx.currentTime);
        osc.stop(ctx.currentTime + 0.12);
    }

    playStomp(): void {
        const ctx = this.getContext();
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(300, ctx.currentTime);
        osc.frequency.linearRampToValueAtTime(100, ctx.currentTime + 0.2);
        gain.gain.setValueAtTime(0.12, ctx.currentTime);
        gain.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.2);
        osc.connect(gain).connect(ctx.destination);
        osc.start(ctx.currentTime);
        osc.stop(ctx.currentTime + 0.2);
    }

    playPowerup(): void {
        const ctx = this.getContext();
        const notes = [400, 500, 600, 800];
        for (let i = 0; i < notes.length; i++) {
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.type = 'sine';
            const t = ctx.currentTime + i * 0.08;
            osc.frequency.setValueAtTime(notes[i], t);
            gain.gain.setValueAtTime(0.12, t);
            gain.gain.linearRampToValueAtTime(0, t + 0.12);
            osc.connect(gain).connect(ctx.destination);
            osc.start(t);
            osc.stop(t + 0.12);
        }
    }

    playHit(): void {
        const ctx = this.getContext();
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(200, ctx.currentTime);
        osc.frequency.linearRampToValueAtTime(60, ctx.currentTime + 0.15);
        gain.gain.setValueAtTime(0.15, ctx.currentTime);
        gain.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.15);
        osc.connect(gain).connect(ctx.destination);
        osc.start(ctx.currentTime);
        osc.stop(ctx.currentTime + 0.15);
    }

    playLevelComplete(): void {
        const ctx = this.getContext();
        const notes = [523, 659, 784, 1047, 1319];
        for (let i = 0; i < notes.length; i++) {
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.type = 'sine';
            const t = ctx.currentTime + i * 0.15;
            osc.frequency.setValueAtTime(notes[i], t);
            gain.gain.setValueAtTime(0.15, t);
            gain.gain.linearRampToValueAtTime(0, t + 0.3);
            osc.connect(gain).connect(ctx.destination);
            osc.start(t);
            osc.stop(t + 0.3);
        }
    }

    startMusic(): void {
        if (this.musicPlaying) return;
        this.musicPlaying = true;
        const ctx = this.getContext();
        const bassNotes = [130.81, 146.83, 164.81, 174.61, 196.0, 174.61, 164.81, 146.83];
        const melodyNotes = [261.63, 329.63, 293.66, 349.23, 392.0, 349.23, 329.63, 293.66];

        const playBass = () => {
            if (!this.musicPlaying) return;
            for (let i = 0; i < bassNotes.length; i++) {
                const osc = ctx.createOscillator();
                const gain = ctx.createGain();
                osc.type = 'triangle';
                const t = ctx.currentTime + i * 0.3;
                osc.frequency.setValueAtTime(bassNotes[i], t);
                gain.gain.setValueAtTime(0.06, t);
                gain.gain.linearRampToValueAtTime(0, t + 0.25);
                osc.connect(gain).connect(ctx.destination);
                osc.start(t);
                osc.stop(t + 0.25);
                this.musicNodes.push({ osc, gain });
            }
        };

        const playMelody = () => {
            if (!this.musicPlaying) return;
            for (let i = 0; i < melodyNotes.length; i++) {
                const osc = ctx.createOscillator();
                const gain = ctx.createGain();
                osc.type = 'sine';
                const t = ctx.currentTime + i * 0.3;
                osc.frequency.setValueAtTime(melodyNotes[i], t);
                gain.gain.setValueAtTime(0.04, t + 0.02);
                gain.gain.linearRampToValueAtTime(0, t + 0.28);
                osc.connect(gain).connect(ctx.destination);
                osc.start(t);
                osc.stop(t + 0.28);
                this.musicNodes.push({ osc, gain });
            }
        };

        playBass();
        playMelody();

        this.musicInterval = setInterval(() => {
            if (!this.musicPlaying) {
                clearInterval(this.musicInterval!);
                return;
            }
            playBass();
            playMelody();
        }, 2400);
    }

    private musicInterval: ReturnType<typeof setInterval> | null = null;

    stopMusic(): void {
        this.musicPlaying = false;
        if (this.musicInterval) {
            clearInterval(this.musicInterval);
            this.musicInterval = null;
        }
        for (const node of this.musicNodes) {
            try {
                node.osc.stop();
            } catch (_) {}
        }
        this.musicNodes = [];
    }
}
