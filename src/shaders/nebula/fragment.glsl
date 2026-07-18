/*
* Inspired by: https://www.shadertoy.com/view/4llfzj
*/
precision highp float;

uniform float uTime;
uniform vec2 uResolution;
uniform sampler2D uNoiseTexture;
uniform vec2 uNoiseTextureSize;
uniform vec3 uPaletteA;
uniform vec3 uPaletteB;
uniform vec3 uPaletteC;
uniform vec3 uPaletteD;
uniform vec3 uBaseColor;
uniform float uColorT_sceneNoise;
uniform float uColorT_lowFreqNoise;
uniform float uVibrantMix;
uniform float uWarpAmount;
uniform float uRotationAmount;
uniform int uFbmOctaves;
uniform float uFbmScale;
uniform float uFbmLacunarity;
uniform float uBackgroundIntensity;
uniform float uAccentFalloffPower;
uniform float uAccentIntensity;
uniform float uCentralFalloffPower;
uniform float uTimeScale;
uniform float uEdgeSmoothMin;
uniform float uEdgeSmoothMax;

varying vec2 vUv;

float palette(in float a, in float b, in float c, in float d, in float x) {
    return a + b * cos(6.28318 * (c * x + d));
}

float noise2D(in vec2 p)
{
    vec2 ip = floor(p);
    vec2 f = fract(p);
    f = f * f * (3.0 - 2.0 * f);
    vec2 texUV = (ip + vec2(0.5)) / uNoiseTextureSize;
    vec2 du = vec2(1.0 / uNoiseTextureSize.x, 0.0);
    vec2 dv = vec2(0.0, 1.0 / uNoiseTextureSize.y);
    float a = texture2D(uNoiseTexture, texUV).x;
    float b = texture2D(uNoiseTexture, texUV + du).x;
    float c = texture2D(uNoiseTexture, texUV + dv).x;
    float d = texture2D(uNoiseTexture, texUV + du + dv).x;
    return mix(mix(a, b, f.x), mix(c, d, f.x), f.y);
}

float computeFBM(in vec2 pos)
{
    float amp = 12.75;
    float sum = 0.0;
    float maxAmp = 0.0;

    if (uFbmOctaves >= 1) {
        sum += noise2D(pos) * amp;
        maxAmp += amp;
        amp *= 0.5;
        pos *= uFbmLacunarity;
    }
    if (uFbmOctaves >= 2) {
        sum += noise2D(pos) * amp;
        maxAmp += amp;
        amp *= 0.5;
        pos *= uFbmLacunarity;
    }
    if (uFbmOctaves >= 3) {
        sum += noise2D(pos) * amp;
        maxAmp += amp;
        amp *= 0.5;
        pos *= uFbmLacunarity;
    }
    if (uFbmOctaves >= 4) {
        sum += noise2D(pos) * amp;
        maxAmp += amp;
        amp *= 0.5;
        pos *= uFbmLacunarity;
    }
    if (uFbmOctaves >= 5) {
        sum += noise2D(pos) * amp;
        maxAmp += amp;
        amp *= 0.5;
        pos *= uFbmLacunarity;
    }
    if (uFbmOctaves >= 6) {
        sum += noise2D(pos) * amp;
        maxAmp += amp;
    }

    return sum / maxAmp;
}

void main() {
    vec2 screenPos = (vUv * 2.0 - 1.0) * vec2(uResolution.x / uResolution.y, 1.0);

    float theta = length(screenPos) * uRotationAmount;
    float c = cos(theta);
    float s = sin(theta);
    mat2 rot = mat2(c, -s, s, c);
    vec2 warpedPos = screenPos * rot;

    float timeOffset = uTime * 0.015625 * uTimeScale;
    float sceneNoise = computeFBM(warpedPos * uFbmScale + vec2(50.0) + timeOffset);
    warpedPos += vec2(sceneNoise) * uWarpAmount;

    vec2 uvCenter = vUv - vec2(0.5);
    float distFromCenter = length(uvCenter) * 2.0;

    float edgeFalloff = smoothstep(uEdgeSmoothMax, uEdgeSmoothMin, distFromCenter);

    float edgeNoise = computeFBM(vUv * 10.0 + uTime * 0.05);
    float noisyEdge = smoothstep(0.95 + edgeNoise * 0.15, 0.3, distFromCenter);

    float finalEdgeMask = mix(edgeFalloff, noisyEdge, 0.5);

    float centralFalloff = clamp(1.0 - abs(screenPos.y), 0.0, 1.0);
    float xDirFalloff = (cos(screenPos.x * 2.0) * 0.5 + 0.5);
    float centralFalloffWarped = 1.0 - abs(warpedPos.y);
    float lowFreqFalloffNoise = computeFBM(warpedPos * 4.0 - uTime * 0.05 * uTimeScale);

    float colorT = sceneNoise * uColorT_sceneNoise + lowFreqFalloffNoise * uColorT_lowFreqNoise;
    vec3 col;
    col.r = palette(uPaletteA.r, uPaletteB.r, uPaletteC.r, uPaletteD.r, colorT);
    col.g = palette(uPaletteA.g, uPaletteB.g, uPaletteC.g, uPaletteD.g, colorT);
    col.b = palette(uPaletteA.b, uPaletteB.b, uPaletteC.b, uPaletteD.b, colorT);

    vec3 vibrantColor = mix(uBaseColor, col * 2.0, sceneNoise * uVibrantMix);

    vec3 backgroundCol = vibrantColor * uBackgroundIntensity
            * pow(centralFalloffWarped, uCentralFalloffPower)
            * lowFreqFalloffNoise
            * pow(xDirFalloff, 0.001);
    vec3 brightAccent = col * uAccentIntensity;
    backgroundCol += brightAccent * pow(centralFalloff, uAccentFalloffPower) * lowFreqFalloffNoise * pow(xDirFalloff, 2.0);

    gl_FragColor = vec4(backgroundCol, finalEdgeMask);
}
