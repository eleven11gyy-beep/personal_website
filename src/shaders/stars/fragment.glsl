precision highp float;

uniform float uTime;
uniform sampler2D uTexture;

varying vec2 vUv;
varying float vColorMix;

void main() {
    vec4 particlesTexture = texture2D(uTexture, vUv);

    float colorMix = vColorMix;

    vec3 orangeColor = vec3(0.34, 0.13, 0.02);
    vec3 blueColor = vec3(0.01, 0.13, 0.22);

    vec3 starColor = mix(blueColor, orangeColor, colorMix);

    starColor *= 2.7;

    gl_FragColor = vec4(starColor, particlesTexture.r);
}
