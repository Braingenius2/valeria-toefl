/* Speaking Tempo Engine — shared tempo state management */

const SpeakingTempoEngine = {
  /* === State === */
  _tempo: 'speaking',       // 'speaking' | 'writing'
  _listeners: [],
  _audioBase: '',           // set via init()

  /* === Init === */
  init(audioBasePath) {
    this._audioBase = audioBasePath.replace(/\\/g, '/').replace(/\/+$/, '');
    const savedTempo = sessionStorage.getItem('st-tempo');
    if (savedTempo === 'writing' || savedTempo === 'speaking') {
      this._tempo = savedTempo;
    }
  },

  /* === Getters === */
  getTempo() { return this._tempo; },
  isSpeaking() { return this._tempo === 'speaking'; },

  /* === Setters (dispatch events) === */
  setTempo(t) {
    if (t !== 'writing' && t !== 'speaking') return;
    if (this._tempo === t) return;
    this._tempo = t;
    sessionStorage.setItem('st-tempo', t);
    this._dispatch('tempo-change', { tempo: t });
  },

  toggleTempo() {
    this.setTempo(this._tempo === 'writing' ? 'speaking' : 'writing');
  },

  /* === Events === */
  on(cb) { this._listeners.push(cb); },
  off(cb) { this._listeners = this._listeners.filter(l => l !== cb); },

  _dispatch(type, detail) {
    const ev = { type, detail };
    this._listeners.forEach(cb => { try { cb(ev); } catch (e) { console.warn('ST engine listener error', e); } });
  },

  /* === Audio URL helper === */
  /* Builds path: {audioBase}/{lessonId}-{slideId}-{extra}.wav
   * voice param is accepted but not included in the filename
   * (one fixed voice per lesson, determined at generation time).
   * Examples:
   *   getUrl('l5', 'slide1', 'tempo-writing')
   *     -> audio/l5-slide1-tempo-writing.wav
   */
  getUrl(lessonId, slideId, extra) {
    const base = this._audioBase;
    return `${base}/${lessonId}-${slideId}-${extra}.wav`;
  },

  /* Shorthand for warm-up shadowing audio */
  getWarmupAudioUrl(lessonId, voice) {
    const t = this._tempo === 'speaking' ? 'speaking' : 'writing';
    return this.getUrl(lessonId, 'slide1', `tempo-${t}`, voice);
  },

  /* Shorthand for full model answer audio (single continuous recording) */
  getFullModelUrl(lessonId) {
    return this.getUrl(lessonId, 'slide5', 'model-speaking-full');
  },

  /* Shorthand for slide pair (per-example) audio */
  getSlidePairUrl(lessonId, slideId, pairId, voice) {
    return this.getUrl(lessonId, slideId, `pair${pairId}`, voice);
  },
};
