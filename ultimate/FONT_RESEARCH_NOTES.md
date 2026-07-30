# Font research notes — not a product feature

Status: `<font>` and its optional `material` attribute are unsupported/unsafe for Arena deck names. These names are retained only as research provenance. They must not be surfaced as controls or copyable Arena Lab probes.

## User-tested results

- A syntactically valid `A<font="CCMeanwhile-Italic SDF"> hfhf` probe produced no visible font change and did not recover or reset as expected.
- `<font=default>` caused the rendered name to effectively lock or truncate at that point; following content was not visible.
- A separate Roboto attempt was malformed and is not treated as evidence.
- The valid CCMeanwhile failure plus the destructive default behavior is sufficient to classify the feature unsupported/unsafe.

## Read-only local bundle candidates

These TMP_FontAsset names were extracted from the user's installed MTGA Steam build (Unity 2022.3.62f2), under `MTGA_Data/Downloads/AssetBundle/Fonts_*.mtga`:

- Font_Title_DynamicFallback (Beleren2016 Bold)
- Font_Title_USERNAME (Beleren2016)
- Font_Default_DynamicFallback (Gotham Narrow Medium)
- Font_Default_Bold (Gotham Narrow)
- Font_Default_Italic (Gotham Narrow)
- Font_Tiamat_Condensed_Regular (Tiamat Condensed SC)
- Font_Tiamat_Expanded_Light (Tiamat Expanded SC Light)
- ROBOTO-REGULAR SDF
- ROBOTO-BOLD SDF
- ROBOTO-ITALIC SDF
- ROBOTO-BOLDITALIC SDF
- CCMeanwhile-Italic SDF
- CCMeanwhile-BoldItalic SDF
- Font_Default_Supplemental (Roboto Regular)
- Font_Title_Supplemental (Roboto Bold)

Additional JP/KR/RU dynamic fallback and specialty assets exist but were not promoted into the product.

Material names observed locally:

- Font_Default - DropShadow
- Font_Default - Outline_Soft
- Font_Default - Popup
- Font_Default - Emotes
- Font_Default - GothamTitle
- Font_Title - GlowBlue
- Font_Title - GlowOrange
- Font_Title - Popup
- Font_Title - Small Shadow

No font or material name above should be treated as Arena-compatible without a future explicit reversal based on safe, repeatable user verification.
