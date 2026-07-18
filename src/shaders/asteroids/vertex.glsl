uniform float uTime;
uniform float uOrbitSpeed;
uniform float uRotationSpeed;

attribute vec3 aOrbitParams; // x: radius, y: inclination, z: rotation
attribute vec3 aOrbitSpeed; // x: orbit speed, y: initial angle, z: orbit phase
attribute vec3 aDriftParams; // x: drift speed, y: drift direction theta, z: drift direction phi
attribute vec3 aRotationAxis1;
attribute vec3 aRotationAxis2;
attribute vec2 aRotationSpeeds; // x: speed1, y: speed2
attribute vec3 aWobbleParams; // x: speed, y: amount, z: phase
attribute float aScale;

varying vec3 vNormal;
varying vec3 vPosition;
varying vec2 vUv;

vec3 rotateByQuaternion(vec3 v, vec4 q) {
    vec3 qvec = q.xyz;
    vec3 uv = cross(qvec, v);
    vec3 uuv = cross(qvec, uv);
    return v + 2.0 * (uv * q.w + uuv);
}

vec4 axisAngleToQuaternion(vec3 axis, float angle) {
    float halfAngle = angle * 0.5;
    float s = sin(halfAngle);
    return vec4(axis * s, cos(halfAngle));
}

void main() {
    float orbitAngle = aOrbitSpeed.y + (uTime * aOrbitSpeed.x * uOrbitSpeed);
    float orbitRadius = aOrbitParams.x;
    float orbitInclination = aOrbitParams.y;
    float orbitRotation = aOrbitParams.z;

    float orbitX = cos(orbitAngle) * orbitRadius;
    float orbitZ = sin(orbitAngle) * orbitRadius;

    float inclinedY = orbitZ * sin(orbitInclination);
    float inclinedZ = orbitZ * cos(orbitInclination);

    float rotatedX = orbitX * cos(orbitRotation) - inclinedZ * sin(orbitRotation);
    float rotatedZ = orbitX * sin(orbitRotation) + inclinedZ * cos(orbitRotation);

    float driftTheta = aDriftParams.y;
    float driftPhi = aDriftParams.z;
    vec3 driftDir = vec3(
            sin(driftPhi) * cos(driftTheta),
            sin(driftPhi) * sin(driftTheta),
            cos(driftPhi)
        );
    vec3 drift = driftDir * aDriftParams.x * uTime;

    float wobble = sin(uTime * aWobbleParams.x + aWobbleParams.z) * aWobbleParams.y;

    vec3 asteroidPosition = vec3(
            rotatedX + drift.x,
            inclinedY + drift.y + wobble,
            rotatedZ + drift.z
        );

    float rotAngle1 = uTime * aRotationSpeeds.x * uRotationSpeed;
    float rotAngle2 = uTime * aRotationSpeeds.y * uRotationSpeed;

    vec4 quat1 = axisAngleToQuaternion(normalize(aRotationAxis1), rotAngle1);
    vec4 quat2 = axisAngleToQuaternion(normalize(aRotationAxis2), rotAngle2);

    vec4 combinedQuat = vec4(
            quat1.w * quat2.xyz + quat2.w * quat1.xyz + cross(quat1.xyz, quat2.xyz),
            quat1.w * quat2.w - dot(quat1.xyz, quat2.xyz)
        );

    vec3 rotatedPos = rotateByQuaternion(position * aScale, combinedQuat);
    vec3 rotatedNormal = rotateByQuaternion(normal, combinedQuat);

    vec3 worldPosition = asteroidPosition + rotatedPos;

    vNormal = normalize(rotatedNormal);
    vPosition = worldPosition;
    vUv = uv;

    gl_Position = projectionMatrix * modelViewMatrix * vec4(worldPosition, 1.0);
}
