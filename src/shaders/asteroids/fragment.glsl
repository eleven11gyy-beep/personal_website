uniform vec3 uLightPosition;
uniform vec3 uBaseColor;
uniform float uRoughness;
uniform samplerCube uEnvironmentMap;
uniform float uEnvMapIntensity;
uniform float uAmbient;
uniform float uDiffuseStrength;
uniform float uEnvLightStrength;
uniform float uReflectionStrength;
uniform float uRimStrength;
uniform float uRimPower;
uniform float uVariationScale;
uniform float uVariationStrength;

varying vec3 vNormal;
varying vec3 vPosition;
varying vec2 vUv;

void main() {
    vec3 normal = normalize(vNormal);
    vec3 viewDir = normalize(cameraPosition - vPosition);

    vec3 lightDir = normalize(uLightPosition - vPosition);
    float diff = max(dot(normal, lightDir), 0.0);

    vec3 reflected = reflect(-viewDir, normal);
    vec3 envColor = textureCube(uEnvironmentMap, reflected).rgb;

    vec3 envDiffuse = textureCube(uEnvironmentMap, normal).rgb;

    float fresnel = pow(1.0 - max(dot(viewDir, normal), 0.0), 3.0);

    float rim = pow(1.0 - max(dot(viewDir, normal), 0.0), uRimPower) * uRimStrength;

    float variation = sin(vPosition.x * uVariationScale) * sin(vPosition.z * uVariationScale) * uVariationStrength + 1.0;

    vec3 diffuseLight = (uAmbient + diff * uDiffuseStrength) * uBaseColor * variation;

    float envBrightness = (envDiffuse.r + envDiffuse.g + envDiffuse.b) / 3.0;
    vec3 envLight = vec3(envBrightness) * uBaseColor * uEnvLightStrength * uEnvMapIntensity;

    vec3 reflectionLight = envColor * fresnel * uReflectionStrength * (1.0 - uRoughness);

    vec3 color = diffuseLight + envLight + reflectionLight + rim;

    gl_FragColor = vec4(color, 1.0);
}
