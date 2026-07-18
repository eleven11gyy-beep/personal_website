precision highp float;

uniform float uTime;
uniform vec2 uResolution;
uniform sampler2D uTexture;

varying vec2 vUv;
varying float vColorMix;

void main() {
    vec4 particlesTexture = texture2D(uTexture, vUv);

    float colorMix = vColorMix;

    vec3 color1 = vec3(0.78);
    vec3 color2 = vec3(0.59, 0.53, 0.45);

    vec3 starColor = mix(color1, color2, colorMix);

    starColor *= 1.5;

    gl_FragColor = vec4(starColor, particlesTexture.r);
}
