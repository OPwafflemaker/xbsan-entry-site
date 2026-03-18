import * as THREE from "./three.module.js";

export const LIVING_GRADIENT_TUNING = {
  globalBreathAmplitude: 0.012,
  breathPeriod: 21.5,
  breathJitter: 0.2,
  phaseOffsetStrength: 0.42,
  internalTurbulence: 0.088,
  domainWarpStrength: 0.145,
  hotspotIntensity: 0.79,
  saturationTrim: 0.088,
  calmZoneSoftness: 0.74,
  cardBlur: 18,
  cardOpacity: 0.6,
  mobileQuality: 0.9,
};

const PALETTE = {
  background: [0.024, 0.018, 0.023],
  warmWine: [0.298, 0.068, 0.078],
  bruisedRose: [0.372, 0.126, 0.132],
  mutedPlum: [0.186, 0.088, 0.164],
  smokyPurple: [0.088, 0.062, 0.126],
  darkIndigo: [0.038, 0.052, 0.144],
  skinWarmth: [0.264, 0.164, 0.118],
  smokedUmber: [0.208, 0.104, 0.072],
};

const VERTEX_SHADER = `
  varying vec2 vUv;

  void main() {
    vUv = uv;
    gl_Position = vec4(position.xy, 0.0, 1.0);
  }
`;

const FRAGMENT_SHADER = `
  precision highp float;

  uniform float uTime;
  uniform vec2 uResolution;
  uniform float uGlobalBreathAmplitude;
  uniform float uBreathPeriod;
  uniform float uBreathJitter;
  uniform float uPhaseOffsetStrength;
  uniform float uInternalTurbulence;
  uniform float uDomainWarpStrength;
  uniform float uHotspotIntensity;
  uniform float uSaturationTrim;
  uniform float uCalmZoneSoftness;
  uniform vec3 uBackgroundColor;
  uniform vec3 uWarmWine;
  uniform vec3 uBruisedRose;
  uniform vec3 uMutedPlum;
  uniform vec3 uSmokyPurple;
  uniform vec3 uDarkIndigo;
  uniform vec3 uSkinWarmth;
  uniform vec3 uSmokedUmber;

  varying vec2 vUv;

  vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
  vec4 mod289(vec4 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
  vec4 permute(vec4 x) { return mod289(((x * 34.0) + 1.0) * x); }
  vec4 taylorInvSqrt(vec4 r) { return 1.79284291400159 - 0.85373472095314 * r; }

  float snoise(vec3 v) {
    const vec2 C = vec2(1.0 / 6.0, 1.0 / 3.0);
    const vec4 D = vec4(0.0, 0.5, 1.0, 2.0);

    vec3 i = floor(v + dot(v, C.yyy));
    vec3 x0 = v - i + dot(i, C.xxx);
    vec3 g = step(x0.yzx, x0.xyz);
    vec3 l = 1.0 - g;
    vec3 i1 = min(g.xyz, l.zxy);
    vec3 i2 = max(g.xyz, l.zxy);

    vec3 x1 = x0 - i1 + C.xxx;
    vec3 x2 = x0 - i2 + C.yyy;
    vec3 x3 = x0 - D.yyy;

    i = mod289(i);
    vec4 p = permute(permute(permute(
      i.z + vec4(0.0, i1.z, i2.z, 1.0))
      + i.y + vec4(0.0, i1.y, i2.y, 1.0))
      + i.x + vec4(0.0, i1.x, i2.x, 1.0));

    float n_ = 0.142857142857;
    vec3 ns = n_ * D.wyz - D.xzx;

    vec4 j = p - 49.0 * floor(p * ns.z * ns.z);
    vec4 x_ = floor(j * ns.z);
    vec4 y_ = floor(j - 7.0 * x_);

    vec4 x = x_ * ns.x + ns.yyyy;
    vec4 y = y_ * ns.x + ns.yyyy;
    vec4 h = 1.0 - abs(x) - abs(y);

    vec4 b0 = vec4(x.xy, y.xy);
    vec4 b1 = vec4(x.zw, y.zw);
    vec4 s0 = floor(b0) * 2.0 + 1.0;
    vec4 s1 = floor(b1) * 2.0 + 1.0;
    vec4 sh = -step(h, vec4(0.0));

    vec4 a0 = b0.xzyw + s0.xzyw * sh.xxyy;
    vec4 a1 = b1.xzyw + s1.xzyw * sh.zzww;

    vec3 p0 = vec3(a0.xy, h.x);
    vec3 p1 = vec3(a0.zw, h.y);
    vec3 p2 = vec3(a1.xy, h.z);
    vec3 p3 = vec3(a1.zw, h.w);

    vec4 norm = taylorInvSqrt(vec4(dot(p0, p0), dot(p1, p1), dot(p2, p2), dot(p3, p3)));
    p0 *= norm.x;
    p1 *= norm.y;
    p2 *= norm.z;
    p3 *= norm.w;

    vec4 m = max(0.6 - vec4(dot(x0, x0), dot(x1, x1), dot(x2, x2), dot(x3, x3)), 0.0);
    m = m * m;
    return 42.0 * dot(m * m, vec4(dot(p0, x0), dot(p1, x1), dot(p2, x2), dot(p3, x3)));
  }

  float fbm(vec3 p) {
    float value = 0.0;
    float amplitude = 0.5;
    float frequency = 1.0;
    for (int i = 0; i < 5; i++) {
      value += amplitude * snoise(p * frequency);
      amplitude *= 0.53;
      frequency *= 2.03;
    }
    return value;
  }

  float fbmMedium(vec3 p) {
    float value = 0.0;
    float amplitude = 0.5;
    float frequency = 1.0;
    for (int i = 0; i < 3; i++) {
      value += amplitude * snoise(p * frequency);
      amplitude *= 0.55;
      frequency *= 2.02;
    }
    return value;
  }

  float fbmLite(vec3 p) {
    float value = 0.0;
    float amplitude = 0.5;
    float frequency = 1.0;
    for (int i = 0; i < 2; i++) {
      value += amplitude * snoise(p * frequency);
      amplitude *= 0.58;
      frequency *= 1.96;
    }
    return value;
  }

  vec2 aspectUv(vec2 uv) {
    vec2 centered = uv - 0.5;
    centered.x *= uResolution.x / max(uResolution.y, 1.0);
    return centered;
  }

  vec2 layeredWarp(vec2 uv, float time, float phase) {
    float lowX = fbmMedium(vec3(uv * 0.48 + vec2(2.2, -1.0), time * 0.05 + phase));
    float lowY = fbmMedium(vec3(uv * 0.58 + vec2(-2.6, 1.6), time * 0.046 - phase));
    float midX = fbmLite(vec3(uv * 1.12 + vec2(4.4, -0.7), time * 0.08 + phase * 1.4));
    float midY = fbmLite(vec3(uv * 1.22 + vec2(-5.0, 2.4), time * 0.078 - phase * 1.2));

    return uv + vec2(
      lowX * 0.12 + midX * 0.032,
      lowY * 0.12 + midY * 0.032
    ) * uDomainWarpStrength;
  }

  float softBlob(vec2 uv, vec2 center, float radius, float feather) {
    float d = length(uv - center);
    return 1.0 - smoothstep(radius - feather, radius + feather, d);
  }

  vec3 trimSaturation(vec3 color, float trim) {
    float luma = dot(color, vec3(0.299, 0.587, 0.114));
    return mix(color, vec3(luma), trim);
  }

  void main() {
    float time = uTime;
    float breathBase = time * (6.2831853 / uBreathPeriod);
    float jitterWarm = snoise(vec3(vUv * 1.3 + 2.8, time * 0.019));
    float jitterCool = snoise(vec3(vUv * 1.08 - 4.8, time * 0.016 + 4.6));

    float warmBreath = sin(breathBase + jitterWarm * uBreathJitter);
    float coolBreath = sin(breathBase * 0.93 + 1.4 + jitterCool * uBreathJitter);
    vec2 uv = aspectUv(vUv);
    vec2 calmCenter = vec2(0.02, -0.02);
    float breathZoneA = smoothstep(1.18, 0.12, length(uv - vec2(-0.44, -0.20)));
    float breathZoneB = smoothstep(1.12, 0.10, length(uv - vec2(0.34, 0.08)));
    float breathZoneC = smoothstep(1.10, 0.10, length(uv - vec2(-0.08, 0.46)));
    float breathZoneD = smoothstep(1.22, 0.16, length(uv - vec2(0.18, -0.52)));
    float breathZoneE = smoothstep(1.08, 0.10, length(uv - vec2(0.02, 0.34)));
    float breathZoneF = smoothstep(1.10, 0.12, length(uv - vec2(-0.04, -0.62)));
    float distributedBreath =
      sin(breathBase * 1.03 + 0.8 + jitterWarm * 0.5) * breathZoneA * 0.28 +
      sin(breathBase * 0.91 + 2.1 + jitterCool * 0.5) * breathZoneB * 0.24 +
      sin(breathBase * 1.08 + 4.0 + (jitterWarm - jitterCool) * 0.4) * breathZoneC * 0.18 +
      sin(breathBase * 0.86 + 5.4 - jitterCool * 0.35) * breathZoneD * 0.14 +
      sin(breathBase * 0.97 + 3.2 + jitterWarm * 0.32 - jitterCool * 0.18) * breathZoneE * 0.16 +
      sin(breathBase * 1.01 + 1.7 - jitterWarm * 0.24 + jitterCool * 0.18) * breathZoneF * 0.14;
    float globalBreath = ((warmBreath * 0.44 + coolBreath * 0.32) * 0.72 + distributedBreath * 0.28) * uGlobalBreathAmplitude;
    uv = (uv - calmCenter) * (1.0 + globalBreath) + calmCenter;

    vec2 backLayer = layeredWarp(uv * 0.88, time * 0.5, 0.35);
    vec2 middleLayer = layeredWarp(uv, time * 0.76, 1.15);
    vec2 frontLayer = layeredWarp(uv * 1.06 + vec2(0.025, -0.015), time * 0.88, 2.15);

    vec2 warmCenterA = vec2(-0.56, -0.18) + vec2(
      fbmLite(vec3(time * 0.056 + 1.2, 2.0, 0.0)),
      fbmLite(vec3(2.8, time * 0.050 + 1.7, 0.0))
    ) * 0.12;
    vec2 warmCenterB = vec2(-0.18, 0.02) + vec2(
      fbmLite(vec3(time * 0.047 + 10.0, 3.0, 0.0)),
      fbmLite(vec3(11.3, time * 0.043 + 2.6, 0.0))
    ) * 0.11;
    vec2 coolCenterA = vec2(0.24, -0.22) + vec2(
      fbmLite(vec3(time * 0.051 + 6.1, 1.0, 0.0)),
      fbmLite(vec3(6.8, time * 0.055 + 1.3, 0.0))
    ) * 0.10;
    vec2 coolCenterB = vec2(-0.10, 0.34) + vec2(
      fbmLite(vec3(time * 0.042 + 15.0, 2.0, 0.0)),
      fbmLite(vec3(15.6, time * 0.045 + 2.4, 0.0))
    ) * 0.13;
    vec2 lowerWarmCenter = vec2(-0.03, -0.64) + vec2(
      fbmLite(vec3(time * 0.034 + 23.0, 5.0, 0.0)),
      fbmLite(vec3(24.0, time * 0.036 + 5.4, 0.0))
    ) * 0.08;
    vec2 upperLeftWarmCenter = vec2(-0.08, 0.30) + vec2(
      fbmLite(vec3(time * 0.039 + 32.0, 4.0, 0.0)),
      fbmLite(vec3(33.1, time * 0.041 + 4.8, 0.0))
    ) * 0.09;
    vec2 upperRightCoolCenter = vec2(0.36, 0.22) + vec2(
      fbmLite(vec3(time * 0.036 + 41.0, 6.0, 0.0)),
      fbmLite(vec3(42.2, time * 0.039 + 6.7, 0.0))
    ) * 0.08;
    vec2 lowerLeftWarmCenter = vec2(-0.42, -0.54) + vec2(
      fbmLite(vec3(time * 0.033 + 51.0, 7.0, 0.0)),
      fbmLite(vec3(52.4, time * 0.031 + 7.5, 0.0))
    ) * 0.07;
    vec2 lowerRightWarmCenter = vec2(0.38, -0.48) + vec2(
      fbmLite(vec3(time * 0.031 + 61.0, 8.0, 0.0)),
      fbmLite(vec3(62.6, time * 0.034 + 8.6, 0.0))
    ) * 0.06;
    vec2 upperLeftCoolCenter = vec2(-0.46, 0.18) + vec2(
      fbmLite(vec3(time * 0.035 + 71.0, 9.0, 0.0)),
      fbmLite(vec3(72.8, time * 0.037 + 9.7, 0.0))
    ) * 0.07;

    float warmBlobA = softBlob(backLayer, warmCenterA, 0.82 + (warmBreath * 0.008 + distributedBreath * 0.005), 0.58);
    float warmBlobB = softBlob(middleLayer, warmCenterB, 0.62 + (warmBreath * 0.006 + distributedBreath * 0.004), 0.34);
    float coolBlobA = softBlob(backLayer, coolCenterA, 0.68 + (coolBreath * 0.006 - distributedBreath * 0.003), 0.38);
    float coolBlobB = softBlob(middleLayer, coolCenterB, 0.72 + (coolBreath * 0.006 - distributedBreath * 0.003), 0.44);
    float lowerWarmBlob = softBlob(frontLayer, lowerWarmCenter, 0.70 + (warmBreath * 0.007 + distributedBreath * 0.004), 0.46);
    float upperLeftWarmBlob = softBlob(middleLayer, upperLeftWarmCenter, 0.62 + (warmBreath * 0.006 + distributedBreath * 0.005), 0.42);
    float upperRightCoolBlob = softBlob(frontLayer, upperRightCoolCenter, 0.64 + (coolBreath * 0.005 - distributedBreath * 0.002), 0.34);
    float lowerLeftWarmBlob = softBlob(backLayer, lowerLeftWarmCenter, 0.66 + (warmBreath * 0.005 + distributedBreath * 0.003), 0.30);
    float lowerRightWarmBlob = softBlob(backLayer, lowerRightWarmCenter, 0.62 + (warmBreath * 0.004 + distributedBreath * 0.003), 0.28);
    float upperLeftCoolBlob = softBlob(frontLayer, upperLeftCoolCenter, 0.60 + (coolBreath * 0.004 - distributedBreath * 0.002), 0.30);

    float warmCirculation = fbmMedium(vec3(middleLayer * 1.34 + vec2(2.2, -1.1), time * 0.13 + 10.0));
    float warmCirculationFine = fbmLite(vec3(frontLayer * 2.18 + vec2(1.4, -2.2), time * 0.165 + 14.0));
    float coolCirculation = fbmMedium(vec3(frontLayer * 1.42 + vec2(-1.6, 2.4), time * 0.11 + 22.0));
    float coolCirculationFine = fbmLite(vec3(middleLayer * 2.08 + vec2(-2.3, 1.2), time * 0.152 + 26.0));
    float tissuePressure = fbmLite(vec3(backLayer * 0.82 + middleLayer * 0.24, time * 0.082 + 31.0));
    float leftCirculation = fbmLite(vec3(middleLayer * 2.45 + vec2(-3.1, 1.8), time * 0.148 + 91.0));
    float leftVein = fbmLite(vec3(frontLayer * 3.8 + vec2(-2.7, -0.3), time * 0.162 + 96.0));
    float upperLifeMask = smoothstep(1.08, 0.12, length((uv - vec2(-0.04, 0.30)) * vec2(1.08, 0.84)));
    float lowerLifeMask = smoothstep(1.12, 0.12, length((uv - vec2(0.00, -0.60)) * vec2(0.96, 0.92)));

    float screenFill = smoothstep(1.84, 0.16, length(uv * vec2(0.76, 0.84)));
    float warmMass = warmBlobA * 0.50 + warmBlobB * 0.34 + lowerWarmBlob * 0.18 + upperLeftWarmBlob * 0.16 + lowerLeftWarmBlob * 0.12 + lowerRightWarmBlob * 0.10;
    float coolMass = coolBlobA * 0.44 + coolBlobB * 0.34 + upperRightCoolBlob * 0.12 + upperLeftCoolBlob * 0.10;
    float partitionNoise = fbmLite(vec3(middleLayer * 1.9 + vec2(0.6, -0.5), time * 0.10 + 42.0));
    float partitionBand = 1.0 - smoothstep(0.035, 0.26, abs(warmMass - coolMass));
    partitionBand *= smoothstep(-0.18, 0.34, partitionNoise);
    float partitionEdge = smoothstep(0.28, 0.78, partitionBand) * (0.68 + partitionNoise * 0.24);
    float seamField = fbmMedium(vec3(middleLayer * 2.7 + vec2(1.8, -1.2), time * 0.12 + 54.0));
    float seamVein = fbmLite(vec3(frontLayer * 3.1 + vec2(-0.4, 1.7), time * 0.14 + 58.0));
    float seamAxis = middleLayer.x * 4.8 - middleLayer.y * 3.6 + seamField * 1.8 + seamVein * 0.8;
    float seamLamella = sin(seamAxis * 6.2831853 + time * 0.028) * 0.5 + 0.5;
    float seamContour = smoothstep(0.72, 0.96, seamLamella) * partitionEdge;
    float seamCore = smoothstep(0.42, 0.86, partitionBand) * (0.62 + seamVein * 0.18);
    float seamTissue = partitionEdge * (0.52 + seamField * 0.2);
    float veinFieldA = fbmLite(vec3(frontLayer * 4.2 + vec2(-2.2, 1.4), time * 0.17 + 63.0));
    float veinFieldB = fbmLite(vec3(middleLayer * 3.7 + vec2(1.5, -2.4), time * 0.15 + 68.0));
    float veinAxis = middleLayer.x * 7.4 + middleLayer.y * -5.2 + veinFieldA * 2.6 - veinFieldB * 1.7;
    float veinRib = abs(sin(veinAxis * 3.14159265 + time * 0.036));
    float veinMask = smoothstep(0.73, 0.96, veinRib) * smoothstep(0.30, 0.88, partitionBand);
    float veinPressure = fbmLite(vec3(backLayer * 2.4 + middleLayer * 0.8 + vec2(0.8, -1.1), time * 0.096 + 74.0));
    float pressurePulseA = sin(time * 0.22 + veinFieldA * 4.2 + middleLayer.x * 3.5) * 0.5 + 0.5;
    float pressurePulseB = sin(time * 0.19 + veinFieldB * 3.6 - middleLayer.y * 2.9 + 1.4) * 0.5 + 0.5;
    float pressureFlow = mix(pressurePulseA, pressurePulseB, 0.46 + veinPressure * 0.12);
    float pressureTide = smoothstep(0.34, 0.86, pressureFlow) * partitionEdge;
    float capillaryNoise = fbmLite(vec3(frontLayer * 6.2 + vec2(-1.0, 2.8), time * 0.18 + 81.0));
    float capillaryAxis = frontLayer.x * -10.5 + frontLayer.y * 8.8 + capillaryNoise * 2.1 + seamField * 0.9;
    float capillaryRib = abs(sin(capillaryAxis * 3.14159265));
    float capillaryMask = smoothstep(0.82, 0.985, capillaryRib) * seamCore * 0.85;
    float seamShadow = smoothstep(0.18, 0.86, partitionBand) * (0.54 + seamField * 0.12);
    float seamWarmRim = smoothstep(0.78, 0.97, seamLamella) * partitionEdge;
    float seamCoolRim = smoothstep(0.78, 0.97, 1.0 - seamLamella) * partitionEdge;
    float quietPocketA = smoothstep(1.12, 0.20, length((uv - vec2(0.58, 0.26)) * vec2(0.86, 1.08)));
    float quietPocketB = smoothstep(1.16, 0.22, length((uv - vec2(-0.60, -0.34)) * vec2(0.94, 1.14)));
    float quietPocket = max(quietPocketA, quietPocketB);

    vec3 color = uBackgroundColor;
    color = mix(color, uWarmWine, warmBlobA * 0.62);
    color = mix(color, uBruisedRose, warmBlobB * 0.30 * uHotspotIntensity);
    color = mix(color, uMutedPlum, warmBlobB * 0.20);
    color = mix(color, uDarkIndigo, coolBlobA * 0.48);
    color = mix(color, uSmokyPurple, coolBlobB * 0.28);
    color = mix(color, uSkinWarmth, lowerWarmBlob * 0.16 * uHotspotIntensity);
    color = mix(color, uBruisedRose * 0.92 + uWarmWine * 0.08, upperLeftWarmBlob * 0.18);
    color = mix(color, uWarmWine * 0.88 + uBruisedRose * 0.12, lowerLeftWarmBlob * 0.12);
    color = mix(color, uDarkIndigo * 0.82 + uSmokyPurple * 0.18, upperRightCoolBlob * 0.12);
    color = mix(color, uSmokedUmber * 0.72 + uWarmWine * 0.28, lowerRightWarmBlob * 0.12);
    color = mix(color, uDarkIndigo * 0.86 + uMutedPlum * 0.14, upperLeftCoolBlob * 0.10);
    color = mix(color, uSmokedUmber * 0.40 + uWarmWine * 0.28 + uDarkIndigo * 0.32, screenFill * 0.09);

    color += vec3(0.019, 0.011, 0.010) * warmCirculation * (warmBlobA * 0.54 + warmBlobB * 0.46);
    color += vec3(0.010, 0.006, 0.008) * warmCirculationFine * warmMass * (uInternalTurbulence * 0.65);
    color += vec3(0.006, 0.010, 0.022) * coolCirculation * (coolBlobA * 0.56 + coolBlobB * 0.44);
    color += vec3(0.005, 0.009, 0.015) * coolCirculationFine * coolMass * (uInternalTurbulence * 0.6);
    color += vec3(0.012, 0.008, 0.012) * tissuePressure * uInternalTurbulence;
    color += mix(uBruisedRose * 0.16, uMutedPlum * 0.10, 0.42 + leftVein * 0.14) * upperLifeMask * (0.42 + leftCirculation * 0.16);
    color += mix(uWarmWine * 0.24, uBruisedRose * 0.20, 0.5 + leftCirculation * 0.12) * upperLeftWarmBlob * 0.28;
    color += mix(uSmokedUmber * 0.16 + uWarmWine * 0.06, uMutedPlum * 0.10, 0.46 + tissuePressure * 0.10) * lowerLifeMask * 0.22;

    vec3 partitionTint = mix(uBruisedRose, uDarkIndigo, 0.52 + partitionNoise * 0.18);
    color = mix(color, partitionTint, partitionBand * 0.18);
    color += partitionTint * partitionEdge * 0.06;
    color += mix(uBruisedRose * 0.60, uDarkIndigo * 0.62, 0.5 + seamField * 0.2) * seamTissue * 0.05;
    color += mix(uWarmWine * 0.72, uBruisedRose * 0.64, 0.46 + seamField * 0.12) * seamWarmRim * 0.15;
    color += mix(uDarkIndigo * 0.72, uMutedPlum * 0.58, 0.40 + seamVein * 0.12) * seamCoolRim * 0.12;
    color += mix(uMutedPlum * 0.44 + uSmokedUmber * 0.06, uWarmWine * 0.28 + uSmokedUmber * 0.12, 0.34 + seamVein * 0.14) * seamCore * 0.08;
    color += mix(uBruisedRose * 0.88, uSkinWarmth * 0.72, 0.42 + veinFieldA * 0.14) * veinMask * 0.082;
    color += mix(uDarkIndigo * 0.88, uMutedPlum * 0.82, 0.38 + veinFieldB * 0.16) * veinMask * 0.068;
    color += mix(uWarmWine * 0.78 + uBruisedRose * 0.12, uDarkIndigo * 0.56 + uMutedPlum * 0.18, 0.42 + veinPressure * 0.18) * pressureTide * 0.22;
    color += mix(uBruisedRose * 0.56 + uSmokedUmber * 0.16, uWarmWine * 0.42 + uSmokedUmber * 0.14, 0.52 + capillaryNoise * 0.08) * capillaryMask * 0.12;
    color -= partitionBand * 0.018;
    color -= vec3(0.030, 0.018, 0.024) * seamShadow * 0.26;
    color = mix(color, color * 0.86 + uBackgroundColor * 0.14, quietPocket * 0.24);

    float calmZone = smoothstep(
      uCalmZoneSoftness + 0.08,
      0.08,
      length((vUv - vec2(0.52, 0.52)) * vec2(0.92, 1.18))
    );
    color = mix(color, color * 0.90 + uBackgroundColor * 0.10, calmZone * 0.44);

    vec3 backDepth = mix(uBackgroundColor * 0.92, color, 0.92);
    vec3 frontMist = mix(uBackgroundColor, uBruisedRose * 0.40 + uDarkIndigo * 0.60, partitionBand * 0.08);
    color = mix(backDepth, color, 0.88);
    color = mix(color, frontMist, 0.1);

    vec2 vignetteUv = (vUv - 0.5) * vec2(1.03, 1.16);
    float vignette = 1.0 - dot(vignetteUv, vignetteUv);
    vignette = smoothstep(-0.10, 0.92, vignette);
    color = mix(uBackgroundColor * 0.84, color, vignette);

    color = trimSaturation(color, uSaturationTrim);
    color *= 1.03;
    color = clamp(color, 0.0, 0.40);
    gl_FragColor = vec4(color, 1.0);
  }
`;

const DESKTOP_PIXEL_RATIO = 1.2;

export function mountLivingGradientBackground(container, { forceMotion = false } = {}) {
  if (!container) return () => {};

  const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
  let reducedMotion = forceMotion ? false : mediaQuery.matches;
  let frameId = 0;
  let startTime = 0;
  let active = true;

  const isMobile = () => window.matchMedia("(max-width: 768px)").matches;

  const renderer = new THREE.WebGLRenderer({
    antialias: false,
    alpha: false,
    powerPreference: isMobile() ? "low-power" : "high-performance",
  });

  renderer.setPixelRatio(Math.min(window.devicePixelRatio, isMobile() ? LIVING_GRADIENT_TUNING.mobileQuality : DESKTOP_PIXEL_RATIO));
  renderer.setSize(container.clientWidth, container.clientHeight, false);
  container.appendChild(renderer.domElement);

  const scene = new THREE.Scene();
  const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
  const material = new THREE.ShaderMaterial({
    uniforms: {
      uTime: { value: 0 },
      uResolution: { value: new THREE.Vector2(container.clientWidth, container.clientHeight) },
      uGlobalBreathAmplitude: { value: LIVING_GRADIENT_TUNING.globalBreathAmplitude },
      uBreathPeriod: { value: LIVING_GRADIENT_TUNING.breathPeriod },
      uBreathJitter: { value: LIVING_GRADIENT_TUNING.breathJitter },
      uPhaseOffsetStrength: { value: LIVING_GRADIENT_TUNING.phaseOffsetStrength },
      uInternalTurbulence: { value: LIVING_GRADIENT_TUNING.internalTurbulence },
      uDomainWarpStrength: { value: LIVING_GRADIENT_TUNING.domainWarpStrength },
      uHotspotIntensity: { value: LIVING_GRADIENT_TUNING.hotspotIntensity },
      uSaturationTrim: { value: LIVING_GRADIENT_TUNING.saturationTrim },
      uCalmZoneSoftness: { value: LIVING_GRADIENT_TUNING.calmZoneSoftness },
      uBackgroundColor: { value: new THREE.Vector3(...PALETTE.background) },
      uWarmWine: { value: new THREE.Vector3(...PALETTE.warmWine) },
      uBruisedRose: { value: new THREE.Vector3(...PALETTE.bruisedRose) },
      uMutedPlum: { value: new THREE.Vector3(...PALETTE.mutedPlum) },
      uSmokyPurple: { value: new THREE.Vector3(...PALETTE.smokyPurple) },
      uDarkIndigo: { value: new THREE.Vector3(...PALETTE.darkIndigo) },
      uSkinWarmth: { value: new THREE.Vector3(...PALETTE.skinWarmth) },
      uSmokedUmber: { value: new THREE.Vector3(...PALETTE.smokedUmber) },
    },
    vertexShader: VERTEX_SHADER,
    fragmentShader: FRAGMENT_SHADER,
    depthWrite: false,
    depthTest: false,
  });

  const geometry = new THREE.PlaneGeometry(2, 2);
  const mesh = new THREE.Mesh(geometry, material);
  scene.add(mesh);

  const renderFrame = (elapsedSeconds) => {
    material.uniforms.uTime.value = elapsedSeconds;
    renderer.render(scene, camera);
  };

  const animate = () => {
    if (active) {
      const elapsedSeconds = (performance.now() - startTime) / 1000;
      renderFrame(elapsedSeconds);
    }
    frameId = requestAnimationFrame(animate);
  };

  const handleResize = () => {
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, isMobile() ? LIVING_GRADIENT_TUNING.mobileQuality : DESKTOP_PIXEL_RATIO));
    renderer.setSize(container.clientWidth, container.clientHeight, false);
    material.uniforms.uResolution.value.set(container.clientWidth, container.clientHeight);
    if (reducedMotion) renderFrame(8.4);
  };

  const handleVisibility = () => {
    active = document.visibilityState === "visible";
  };

  const handleMotionChange = (event) => {
    reducedMotion = forceMotion ? false : event.matches;
  };

  window.addEventListener("resize", handleResize);
  document.addEventListener("visibilitychange", handleVisibility);
  mediaQuery.addEventListener("change", handleMotionChange);

  if (reducedMotion) {
    renderFrame(8.4);
  } else {
    startTime = performance.now();
    frameId = requestAnimationFrame(animate);
  }

  return () => {
    if (frameId) cancelAnimationFrame(frameId);
    window.removeEventListener("resize", handleResize);
    document.removeEventListener("visibilitychange", handleVisibility);
    mediaQuery.removeEventListener("change", handleMotionChange);
    geometry.dispose();
    material.dispose();
    scene.clear();
    renderer.dispose();
    if (renderer.domElement.parentNode === container) container.removeChild(renderer.domElement);
  };
}

let cleanup = null;

if (typeof window !== "undefined" && typeof document !== "undefined") {
  window.addEventListener("DOMContentLoaded", () => {
    const container = document.getElementById("living-gradient-background");
    if (!container) return;
    cleanup = mountLivingGradientBackground(container, { forceMotion: false });
  });

  window.addEventListener("beforeunload", () => {
    if (cleanup) cleanup();
  });
}
