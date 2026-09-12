# Anime WOW reaction

`wow-anime.wav` replaces the speech-synthesis clip with the short, expressive **Anime Wow** reaction requested for the game.

- Source page: https://tiengdong.com/th/th65519
- Download: https://tiengdong.com/wp-content/uploads/Anime-wow-sound-effect-www_tiengdong_com.mp3
- Retrieved: September 11, 2026.
- The excerpt contains the single-word reaction “Wow!” and its fading reverberation. The source page offers the download but does not identify the original performer or a reuse license; this file is not represented as original or CC0 audio.

Processing: retain the first 2.65 seconds of the 5.25-second source, apply a 130 Hz high-pass filter and a 0.55-second trailing fade, normalize the peak to 76%, and encode as mono 16-bit PCM at 22,050 Hz. The resulting file is 116,910 bytes and plays at its natural pitch and speed. The long quiet tail is removed.

The game fetches this bundled file from its own origin after the first interaction. A distinct filename prevents reuse of the former synthetic recording from a browser cache. Playback gain is 0.42, reduced from 0.95 without lowering pitch or changing the recording. Pop effects soften briefly while the reaction plays. Voice playback cannot overlap; hidden-page handling cancels active or pending playback. No runtime speech synthesis, microphone permission, or third-party audio requests are used.

## Score ratchet

`js/ratchet.mjs` generates an original 43-millisecond mechanical click from two tooth contacts, filtered noise, and rapidly decaying metal resonances. The buffer is created once per audio context. The score roll repeats it quickly during big payouts and slows toward the final total, ending with one lower, heavier clack. It uses the existing audio limiter, voice cap, and hidden-page cancellation. There is no additional downloaded audio asset.
