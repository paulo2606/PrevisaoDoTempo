uniform sampler2D dayTexture;
uniform sampler2D nightTexture;
uniform vec3 lightDirection;
uniform vec3 ambientColor;
uniform vec3 diffuseColor;
uniform vec3 emissiveColor;
uniform float emissiveIntensity;
uniform float specularPower;

varying vec2 vUv;
varying vec3 vNormal; 
varying vec3 vViewPosition;

void main() {
    vec3 normal = normalize(vNormal); 
    vec3 lightDir = normalize(lightDirection); 

    float NdotL = dot(normal, lightDir);
    float diffuseFactor = max(0.0, NdotL);

    vec4 dayColor = texture2D(dayTexture, vUv);
    vec4 nightLightsColor = texture2D(nightTexture, vUv);

    float nightLightStrength = pow(max(0.0, 1.0 - NdotL), 1.0); 

    vec3 cityLights = nightLightsColor.rgb * emissiveColor * emissiveIntensity * nightLightStrength;

    vec3 viewDir = normalize(-vViewPosition); 
    vec3 halfVector = normalize(lightDir + viewDir); 
    float NdotH = max(0.0, dot(normal, halfVector));
    float specularFactor = pow(NdotH, specularPower);

    vec3 finalColor = vec3(0.0);

    finalColor += ambientColor * dayColor.rgb;
    finalColor += diffuseColor * dayColor.rgb * diffuseFactor;
    finalColor += diffuseColor * specularFactor * dayColor.rgb; 
    finalColor += cityLights;

    finalColor = pow(finalColor, vec3(1.0/2.2));

    gl_FragColor = vec4(finalColor, 1.0);
}