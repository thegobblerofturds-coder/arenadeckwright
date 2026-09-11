# WOW voice

`wow.wav` is an original, locally synthesized “Wow!” using the installed Microsoft Zira Desktop feminine voice. It is a generic synthetic voice, not an imitation of a person. The game loads this small, same-origin PCM file after the first interaction and plays it through the same audio limiter as the pop effects.

The source was generated with Windows `System.Speech.Synthesis.SpeechSynthesizer`, selecting `Microsoft Zira Desktop` and speaking this SSML to a wave file:

```xml
<speak version="1.0" xmlns="http://www.w3.org/2001/10/synthesis" xml:lang="en-US"><prosody pitch="+18%" rate="+5%" volume="loud"><emphasis level="strong">Wow!</emphasis></prosody></speak>
```

Leading and trailing silence were trimmed with 25 ms and 120 ms padding, the peak normalized to 74%, and short fades applied. The final asset is mono, 16-bit PCM, 22,050 Hz, approximately 0.42 seconds. There is no speech service, microphone access, runtime speech synthesis, or external audio request.
