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
    vec3 pos = normalize(vWorldPosition);

    float u = 0.5 + atan(pos.z, pos.x) / (2.0 * PI);
    float v = 0.5 - asin(pos.y) / PI;

    u += uTime * uRotationSpeed;
    u = fract(u);

    vec2 sphericalUV = vec2(u, v);

    float cloudNoise1 = noise(sphericalUV * 6.0 + vec2(uTime * 0.08, 0.0));
    float cloudNoise2 = noise(sphericalUV * 12.0 - vec2(uTime * 0.05, uTime * 0.03));
    float cloudNoise3 = noise(sphericalUV * 20.0 + vec2(uTime * 0.1, -uTime * 0.04));
    float clouds = (cloudNoise1 + cloudNoise2 * 0.7 + cloudNoise3 * 0.3) / 2.0;

    vec4 texColor = texture2D(uTexture, sphericalUV);

    vec3 cloudColor = vec3(0.2, 0.4, 0.9) * clouds * 0.25;
    cloudColor *= (1.0 + sin(uTime * 0.4) * 0.15);
    texColor.rgb = mix(texColor.rgb, texColor.rgb + cloudColor, 0.6);
    texColor.rgb *= 1.1;

    vec3 worldPos = uPlanetPosition + vPosition;
    vec3 lightDir = normalize(uLightPosition - worldPos);
    vec3 normal = normalize(vNormal);
    float diff = max(dot(normal, lightDir), 0.0);

    vec3 ambient = texColor.rgb * 0.35;
    vec3 diffuse = texColor.rgb * diff * 0.65;

    vec3 viewDir = normalize(vViewPosition);
    float rim = 1.0 - max(dot(viewDir, normal), 0.0);
    rim = pow(rim, 2.0);
    vec3 rimColor = uAtmosphereColor * rim * uAtmosphereIntensity * 1.5;

    float fresnel = 1.0 - max(dot(viewDir, normal), 0.0);
    fresnel = pow(fresnel, 2.2);
    vec3 glowRim = uAtmosphereColor * fresnel * 1.3;

    vec3 finalColor = ambient + diffuse + rimColor + glowRim;

    gl_FragColor = vec4(finalColor, 1.0);
}
