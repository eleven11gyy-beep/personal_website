varying vec2 vUv;
uniform sampler2D tScene;
uniform sampler2D uGradient;
uniform float uTime;
uniform float uScale;
uniform float uDensity;
uniform float uOpacity;
uniform float uNoiseScale;
uniform float uNoiseStrength;
uniform float uEdgeSoftness;
uniform float uGlowIntensity;

const vec2 CENTER = vec2(0.5, 0.42);
const vec2 ASPECT = vec2(2.0, 1.0);
const float THRESHOLD = 0.30;
const vec3 BASE_TINT = vec3(0.03, 0.04, 0.06);
const vec3 LUMA = vec3(0.2126, 0.7152, 0.0722);

float hash(vec2 p) {
    return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
}

float noise(vec2 p) {
    vec2 i = floor(p);
    vec2 f = fract(p);

    vec2 u = f * f * (3.0 - 2.0 * f);

    float a = hash(i);
    float b = hash(i + vec2(1.0, 0.0));
    float c = hash(i + vec2(0.0, 1.0));
    float d = hash(i + vec2(1.0, 1.0));

    return mix(mix(a, b, u.x), mix(c, d, u.x), u.y);
}

float fbm1(vec2 p) {
    return noise(p);
}

void main() {
    vec4 scene = texture2D(tScene, vUv);

    vec2 centeredUv = vUv - CENTER;
    vec2 p = centeredUv * ASPECT * uScale;

    float t = (uTime + 25.0) * 0.015;
    vec2 t1 = vec2(t, -t * 0.5);

    float base = fbm1(p * 0.35 + t1);

    vec2 warp = vec2(base, base * 0.8);
    vec2 pWarp = p + (warp - 0.5) * 1.25;

    float detail = fbm1(pWarp * (uNoiseScale * 0.8) + vec2(t * 1.5, -t * 0.75));

    float raw = mix(base, detail, 0.85);
    raw = clamp(raw, 0.0, 1.0);
    raw = raw * (1.0 + 0.25 * raw) * uNoiseStrength;

    vec2 distVec = centeredUv * vec2(1.0, 0.75);
    float distSq = dot(distVec, distVec);
    float radial = clamp(1.0 - sqrt(distSq), 0.0, 1.0);
    radial *= radial;

    float verticalBias = clamp((centeredUv.y * 2.0 + 0.2) * 1.25, 0.0, 1.0);
    verticalBias = verticalBias * verticalBias * (3.0 - 2.0 * verticalBias);
    float fall = radial * (0.5 + 0.5 * verticalBias);

    float edge = 0.108 * (1.0 + uEdgeSoftness);
    float maskInput = raw * fall * uDensity;
    float mask = clamp((maskInput - (THRESHOLD - edge)) / (2.0 * edge), 0.0, 1.0);
    mask = mask * mask * (3.0 - 2.0 * mask);

    float gradX = fract(vUv.x + base * 0.28);
    vec3 ramp = texture2D(uGradient, vec2(gradX, 0.5)).rgb;

    vec3 smokeCol = mix(BASE_TINT, ramp, 0.92) * (0.6 + mask * 0.8);

    float glowInput = maskInput - (THRESHOLD + 0.05);
    float glowMask = clamp(glowInput * 2.5, 0.0, 1.0);
    float glowPow = glowMask * glowMask * glowMask;
    vec3 glow = ramp * glowPow * uGlowIntensity * 0.7;

    float luma = dot(scene.rgb, LUMA);
    float hideFactor = clamp((luma - 0.05) * 2.22, 0.0, 1.0);
    hideFactor = hideFactor * hideFactor * (3.0 - 2.0 * hideFactor);
    mask *= (1.0 - hideFactor);

    vec3 cloudLayer = smokeCol * mask + glow * mask * 0.8;
    vec3 outColor = mix(scene.rgb, cloudLayer, uOpacity);

    float d = (fract(sin(dot(gl_FragCoord.xy, vec2(12.9898, 78.233))) * 43758.5453) - 0.5) * 0.004;
    outColor += d;

    gl_FragColor = vec4(clamp(outColor, 0.0, 1.0), 1.0);
}
