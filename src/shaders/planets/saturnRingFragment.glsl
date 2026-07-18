uniform float uTime;
uniform vec3 uLightPosition;
uniform float uOpacity;
uniform vec3 uRingColor;
uniform float uRingCount;
uniform float uGlowIntensity;

varying vec2 vUv;
varying vec3 vNormal;
varying vec3 vPosition;

float random(vec2 st) {
    return fract(sin(dot(st.xy, vec2(12.9898, 78.233))) * 43758.5453123);
}

float noise(vec2 st) {
    vec2 i = floor(st);
    vec2 f = fract(st);
    float a = random(i);
    float b = random(i + vec2(1.0, 0.0));
    float c = random(i + vec2(0.0, 1.0));
    float d = random(i + vec2(1.0, 1.0));
    vec2 u = f * f * (3.0 - 2.0 * f);
    return mix(a, b, u.x) + (c - a) * u.y * (1.0 - u.x) + (d - b) * u.x * u.y;
}

void main() {
    vec2 center = vec2(0.5, 0.5);
    float dist = length(vUv - center) * 2.0;

    float rings = sin(dist * uRingCount * 3.14159) * 0.5 + 0.5;

    float noiseVal = noise(vUv * 50.0 + vec2(uTime * 0.02, 0.0));
    rings = mix(rings, noiseVal, 0.3);

    float ringPattern = pow(rings, 3.0);

    float bands = sin(dist * uRingCount * 6.28318) * 0.5 + 0.5;
    bands = smoothstep(0.3, 0.7, bands);

    float finalPattern = mix(ringPattern, bands, 0.4);

    float edgeFade = smoothstep(0.0, 0.1, dist) * smoothstep(1.0, 0.9, dist);

    vec3 lightDir = normalize(uLightPosition - vPosition);
    vec3 normal = normalize(vNormal);
    float diff = max(dot(normal, lightDir), 0.0) * 0.6 + 0.4;

    vec3 glowColor = uRingColor * (1.0 + uGlowIntensity);
    vec3 baseColor = uRingColor * 0.6;

    vec3 finalColor = mix(baseColor, glowColor, finalPattern) * diff;

    float alpha = finalPattern * edgeFade * uOpacity;

    alpha += pow(finalPattern, 5.0) * uGlowIntensity * 0.3;

    gl_FragColor = vec4(finalColor, alpha);
}
