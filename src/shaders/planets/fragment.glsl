uniform sampler2D uTexture;
uniform float uTime;
uniform vec3 uLightPosition;
uniform vec3 uPlanetPosition;
uniform float uAtmosphereIntensity;
uniform vec3 uAtmosphereColor;
uniform float uRotationSpeed;

varying vec2 vUv;
varying vec3 vNormal;
varying vec3 vPosition;
varying vec3 vViewPosition;
varying vec3 vWorldPosition;

#define PI 3.14159265359

float hash(vec2 p) {
    return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
}

float noise(vec2 p) {
    vec2 i = floor(p);
    vec2 f = fract(p);
    f = f * f * (3.0 - 2.0 * f);
    float a = hash(i);
    float b = hash(i + vec2(1.0, 0.0));
    float c = hash(i + vec2(0.0, 1.0));
    float d = hash(i + vec2(1.0, 1.0));
    return mix(mix(a, b, f.x), mix(c, d, f.x), f.y);
}

void main() {
    vec3 pos = normalize(vWorldPosition);

    float u = 0.5 + atan(pos.z, pos.x) / (2.0 * PI);
    float v = 0.5 - asin(pos.y) / PI;

    u += uTime * uRotationSpeed;

    float distortion = noise(vec2(u * 8.0, v * 8.0) + uTime * 0.05) * 0.003;
    u += distortion;
    u = fract(u);

    vec2 sphericalUV = vec2(u, v);

    vec4 texColor = texture2D(uTexture, sphericalUV);

    vec3 worldPos = uPlanetPosition + vPosition;
    vec3 lightDir = normalize(uLightPosition - worldPos);
    vec3 normal = normalize(vNormal);
    float diff = max(dot(normal, lightDir), 0.0);

    vec3 ambient = texColor.rgb * 0.3;
    vec3 diffuse = texColor.rgb * diff * 0.7;

    vec3 viewDir = normalize(vViewPosition);
    float rim = 1.0 - max(dot(viewDir, normal), 0.0);
    rim = pow(rim, 3.0);
    vec3 rimColor = uAtmosphereColor * rim * uAtmosphereIntensity;

    float fresnel = 1.0 - max(dot(viewDir, normal), 0.0);
    fresnel = pow(fresnel, 2.5);
    vec3 glowRim = uAtmosphereColor * fresnel * 1.2;

    vec3 finalColor = ambient + diffuse + rimColor + glowRim;

    gl_FragColor = vec4(finalColor, 1.0);
}
