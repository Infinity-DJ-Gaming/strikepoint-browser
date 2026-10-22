import {applyBlackIce} from './black-ice.mjs?v=20261022-9';
import {gloveMaterial} from './glove-material.mjs?v=20261022-9';
import {textureLease,textureAlphaConstant} from './skin-textures.mjs?v=20261022-9';
import {WEAPON_FINISH_INPUTS} from './weapon-finish-inputs.mjs?v=20261022-9';
import {FINISH_EXTRA_TEXTURES} from './finish-extra-textures.mjs?v=20261022-9';
import * as T from 'three';
const white=new T.DataTexture(new Uint8Array([255,255,255,255]),1,1,T.RGBAFormat);white.needsUpdate=true;
const protectedMaterial=s=>/bare_arm|sleeve|sticker_gaps|scope_lens|shared_scope|glass|lens/i.test(s.name)||s.transparent;
export function disposeNativeFinish(root){
 root.traverse(m=>{if(!m.isMesh)return;for(const material of m.userData.ownedFinishMaterials||[])material.dispose();delete m.userData.ownedFinishMaterials;if(m.userData.originalFinishMaterials)m.material=m.userData.originalFinishMaterials;m.userData.finishApplied=false;});
 root.userData.finishLease?.release();delete root.userData.finishLease;
}
export async function applyNativeFinish(root,skin,item={}){
 if(skin?.paintKit===0)skin=null;const generation=(root.userData.finishGeneration||0)+1;root.userData.finishGeneration=generation;
 if(!skin){disposeNativeFinish(root);return;}
 if(skin.customFinish==='black-ice'){disposeNativeFinish(root);applyBlackIce(root,item);return;}
 const lease=textureLease(),load=lease.load.bind(lease),p=skin.material?.parameters||{},f={...skin.material?.textures,...Object.fromEntries(Object.entries(p).filter(([,v])=>FINISH_EXTRA_TEXTURES[v]).map(([k,v])=>[k,FINISH_EXTRA_TEXTURES[v]]))},style=p.F_PAINT_STYLE??Math.max(0,(skin.style||1)-1),palettePattern=[1,2,4,5,9].includes(style);
 try{
 const pattern=f.g_tPattern||(skin.patternTexture!==f.g_tOverlay?skin.patternTexture:null)||f.g_tSurface1;
 const [makeGlove,paint,regions,wear,normal,roughness,alpha,constantAlpha,overlay,overlayAlpha,ramp,paintMetalness,pearl]=skin.kind==='glove'?[await gloveMaterial(skin,item,load)]:await Promise.all([null,load(pattern,!palettePattern),load(f.g_tPaintByNumberMasks||f.g_tMasks),load(f.g_tWear),load(f.g_tNormal),load(p.F_ROUGHNESS_TEXTURE===0?null:f.g_tPaintRoughness),load(pattern,false,true),textureAlphaConstant(pattern),load(p.F_OVERLAY_TEXTURE===0?null:f.g_tOverlay,true),load(p.F_OVERLAY_TEXTURE===0?null:f.g_tOverlay,false,true),load(f.g_tCaseHardeningColorRamp,true),load(p.F_METALNESS_TEXTURE===1?f.g_tPaintMetalness:null),load(f.g_tPearlescenceMask)]);
 const inputs=new Map();if(!makeGlove){root.traverse(mesh=>{if(!mesh.isMesh)return;const original=mesh.userData.originalFinishMaterials||mesh.material;for(const source of Array.isArray(original)?original:[original]){const recipe=WEAPON_FINISH_INPUTS[source.userData.vmat?.Name];if(recipe&&!protectedMaterial(source))inputs.set(source,recipe);}});await Promise.all([...inputs].map(async([source,recipe])=>inputs.set(source,{...recipe,region:await load(recipe.mask),noPaint:await load(recipe.cavity,false,true),noPaintConstant:await textureAlphaConstant(recipe.cavity)})));}
 if(generation!==root.userData.finishGeneration){lease.release();return;}
 disposeNativeFinish(root);root.userData.finishLease=lease;root.userData.disposeNativeFinish=()=>disposeNativeFinish(root);
 const palette=Array.from({length:4},(_,i)=>{const c=p['g_vColor'+i]||[.6,.6,.6];return new T.Color().setRGB(c[0],c[1],c[2],T.SRGBColorSpace);}),seed=item.seed??1,randomized=[1,2,4,5,7,9].includes(style),offset=p.g_vPatternTexCoordOffset||p.g_fPatternTexCoordOffset||[0,0],rotation=(p.g_flPatternTexCoordRotation??p.g_fPatternTexCoordRotation??0)*Math.PI/180+(randomized?seed*.618:0),scale=p.g_flPatternTexCoordScale??p.g_fPatternTexCoordScale??1;
 root.traverse(mesh=>{if(!mesh.isMesh)return;if(!mesh.userData.originalFinishMaterials)mesh.userData.originalFinishMaterials=mesh.material;const original=mesh.userData.originalFinishMaterials,owned=[];
 const list=(Array.isArray(original)?original:[original]).map(source=>{
  if(protectedMaterial(source))return source;
  let mat;if(makeGlove)mat=makeGlove(source);else if((p.g_flPearlescentScale||p.g_flIridescentStrength||0)>0){mat=new T.MeshPhysicalMaterial();T.MeshStandardMaterial.prototype.copy.call(mat,source);mat.iridescence=Math.min(.6,p.g_flIridescentStrength||p.g_flPearlescentScale*.025);mat.iridescenceMap=pearl;mat.iridescenceIOR=1.3;}else mat=source.clone();owned.push(mat);if(makeGlove)return mat;
  mat.color.set(0xffffff);if(!mat.map)mat.map=paint||white;if(normal){mat.normalMap=normal;mat.normalScale.y=-Math.abs(mat.normalScale.y||1);}mat.roughnessMap=null;
  mat.roughness=source.roughness;mat.roughnessMap=source.roughnessMap;mat.metalness=source.metalness;
  const packedMetal=!!mat.roughnessMap&&source.metalnessMap===mat.roughnessMap,packedAO=!!mat.roughnessMap&&source.aoMap===mat.roughnessMap;if(packedMetal)mat.metalnessMap=null;if(packedAO)mat.aoMap=null;
  const input=inputs.get(source),regionMap=regions||input?.region,fallback=paint||source.map||white,uniform={csPaint:{value:fallback},csRegions:{value:regionMap||fallback},csNoPaint:{value:input?.noPaint||fallback},csSubstrate:{value:new T.Vector2(input?.noPaint?1:0,input?.noPaintConstant??0)},csWear:{value:wear||fallback},csAlpha:{value:alpha||fallback},csRoughness:{value:roughness||fallback},csOverlay:{value:overlay||fallback},csOverlayAlpha:{value:overlayAlpha||fallback},csFlags:{value:new T.Vector4(paint?1:0,regionMap?1:0,wear?1:0,alpha?1:0)},csExtras:{value:new T.Vector4(roughness?1:0,overlay?1:0,overlayAlpha?1:0,constantAlpha??1)},csWearValue:{value:T.MathUtils.clamp(item.wear??skin.wearMin??0,0,1)},csPalette:{value:palette},csStyle:{value:style},csRotation:{value:rotation},csScale:{value:scale*(p.g_bIgnoreWeaponSizeScale?1:input?.uvScale||1)},csOffset:{value:new T.Vector2(offset[0]+(randomized?seed*.013%1:0),offset[1]+(randomized?seed*.037%1:0))},csBrightness:{value:p.g_flColorBrightness??1}};
  uniform.csFinishPbr={value:new T.Vector2(p.g_flPaintRoughness??([3,4,5,7,9].includes(style)?.3:.55),[3,4,5,7,9].includes(style)?1:style===8?.65:p.g_flPaintMetalness??0)};
  uniform.csColorRoughness={value:new T.Vector4(...(p.g_vPaintRoughness||Array(4).fill(uniform.csFinishPbr.value.x)))};uniform.csColorMetalness={value:new T.Vector4(...(p.g_vPaintMetalness||Array(4).fill(uniform.csFinishPbr.value.y)))};uniform.csPerColorPbr={value:p.F_ROUGHNESS_PER_COLOR===1?1:0};
  uniform.csRamp={value:ramp||fallback};uniform.csCase={value:new T.Vector4(ramp?1:0,p.g_flCaseHardeningPatternInfluence??1,p.g_flCaseHardeningGeometricInfluence??1,p.g_flCaseHardeningRampOffset??.5)};uniform.csPaintMetalness={value:paintMetalness||fallback};uniform.csHasMetalness={value:paintMetalness?1:0};
  mat.onBeforeCompile=shader=>{Object.assign(shader.uniforms,uniform);shader.vertexShader='varying vec3 csNativePosition,csNativeNormal;\n'+shader.vertexShader;shader.vertexShader=shader.vertexShader.replace('#include <begin_vertex>','#include <begin_vertex>\ncsNativePosition=position;csNativeNormal=normal;');shader.fragmentShader='varying vec3 csNativePosition,csNativeNormal;uniform sampler2D csPaint,csRegions,csNoPaint,csWear,csAlpha,csRoughness,csOverlay,csOverlayAlpha,csRamp,csPaintMetalness;uniform vec4 csFlags,csExtras,csColorRoughness,csColorMetalness,csCase;uniform float csWearValue,csStyle,csRotation,csScale,csBrightness,csPerColorPbr,csHasMetalness;uniform vec3 csPalette[4];uniform vec2 csOffset,csSubstrate,csFinishPbr;\n'+shader.fragmentShader;
   shader.fragmentShader=shader.fragmentShader.replace('#include <map_fragment>',`#ifdef USE_MAP
    vec4 nativeBase=texture2D(map,vMapUv);vec2 pUv=vMapUv-.5;float cr=cos(csRotation),sr=sin(csRotation);pUv=mat2(cr,-sr,sr,cr)*pUv*csScale+.5+csOffset;
    vec3 pat=texture2D(csPaint,pUv).rgb;float projectedAlpha=csFlags.w>.5?texture2D(csAlpha,pUv).r:csExtras.w;
    if(csStyle==1.||csStyle==5.){vec3 weights=pow(abs(normalize(csNativeNormal)),vec3(4.));weights/=max(dot(weights,vec3(1.)),.0001);vec3 pos=csNativePosition/.4572;vec2 ux=mat2(cr,-sr,sr,cr)*pos.yz*csScale+csOffset,uy=mat2(cr,-sr,sr,cr)*pos.xz*csScale+csOffset,uz=mat2(cr,-sr,sr,cr)*pos.xy*csScale+csOffset;pat=texture2D(csPaint,ux).rgb*weights.x+texture2D(csPaint,uy).rgb*weights.y+texture2D(csPaint,uz).rgb*weights.z;if(csFlags.w>.5)projectedAlpha=texture2D(csAlpha,ux).r*weights.x+texture2D(csAlpha,uy).r*weights.y+texture2D(csAlpha,uz).r*weights.z;}
    vec3 region=texture2D(csRegions,vMapUv).rgb;vec3 painted=csFlags.x>.5?pat:csPalette[0];
    if(csStyle==0.){painted=mix(csPalette[0],csPalette[1],region.r);painted=mix(painted,csPalette[2],region.g);painted=mix(painted,csPalette[3],region.b);if(csFlags.y<.5)painted=csPalette[0];}
    if(csStyle==1.||csStyle==2.||csStyle==4.||csStyle==5.){painted=mix(csPalette[0],csPalette[1],pat.r);painted=mix(painted,csPalette[2],pat.g);painted=mix(painted,csPalette[3],pat.b);if(csFlags.y>.5){painted=mix(painted,csPalette[2],region.g*(1.-region.r));painted=mix(painted,csPalette[3],region.b*(1.-region.r));}}
    if(csStyle==3.)painted=csPalette[0];if(csStyle==9.&&csCase.x>.5){float heat=fract(dot(pat,vec3(.3333))*csCase.y+csNativePosition.z*csCase.z+csCase.w);painted=texture2D(csRamp,vec2(heat,.5)).rgb;}painted*=csBrightness;
    float finishAlpha=projectedAlpha;
    float noPaint=csSubstrate.x>.5?texture2D(csNoPaint,vMapUv).r:csSubstrate.y;
    float coverage=1.-smoothstep(.58-csWearValue*.45,.68-csWearValue*.45,noPaint);if(csFlags.x>.5&&(csStyle==2.||csStyle==4.||csStyle==6.||csStyle==8.)){float masking=clamp(1.-abs(finishAlpha-.751)*4.,0.,1.);coverage*=1.-masking;}
    float durability=csFlags.z>.5?texture2D(csWear,vMapUv*1.6).r:1.;float threshold=csWearValue*.65;if(csStyle==6.&&finishAlpha<.5)threshold*=finishAlpha*2.;coverage*=smoothstep(threshold-.04,threshold+.04,durability);
    if(csExtras.y>.5){float oa=csExtras.z>.5?texture2D(csOverlayAlpha,vMapUv).r:1.;painted=mix(painted,texture2D(csOverlay,vMapUv).rgb,oa);}
    diffuseColor.rgb*=mix(nativeBase.rgb,painted,coverage);
    // Native packed alpha describes finish properties, not a hole in the gun.
   #endif`);
   shader.fragmentShader=shader.fragmentShader.replace('#include <roughnessmap_fragment>',`#include <roughnessmap_fragment>
    #ifdef USE_MAP
    float finishRoughness=csFinishPbr.x;if(csPerColorPbr>.5){finishRoughness=mix(csColorRoughness.x,csColorRoughness.y,region.r);finishRoughness=mix(finishRoughness,csColorRoughness.z,region.g);finishRoughness=mix(finishRoughness,csColorRoughness.w,region.b);}if(csExtras.x>.5)finishRoughness=clamp(texture2D(csRoughness,vMapUv).r,.04,1.);
    else if((csStyle==4.||csStyle==8.)&&csFlags.w>.5){if(finishAlpha<.5)finishRoughness=clamp(1.-finishAlpha*2.,.04,1.);}roughnessFactor=mix(roughnessFactor,finishRoughness,coverage);
    #endif`);
   shader.fragmentShader=shader.fragmentShader.replace('#include <metalnessmap_fragment>','#include <metalnessmap_fragment>\n#ifdef USE_MAP\nfloat finishMetalness=csFinishPbr.y;if(csPerColorPbr>.5){finishMetalness=mix(csColorMetalness.x,csColorMetalness.y,region.r);finishMetalness=mix(finishMetalness,csColorMetalness.z,region.g);finishMetalness=mix(finishMetalness,csColorMetalness.w,region.b);}if(csHasMetalness>.5)finishMetalness=texture2D(csPaintMetalness,vMapUv).r;metalnessFactor=mix(metalnessFactor,finishMetalness,coverage);\n#endif');
   if(packedMetal)shader.fragmentShader=shader.fragmentShader.replace('#include <metalnessmap_fragment>','#include <metalnessmap_fragment>\n#ifdef USE_ROUGHNESSMAP\nmetalnessFactor*=texture2D(roughnessMap,vRoughnessMapUv).b;\n#endif');
   if(packedAO)shader.fragmentShader=shader.fragmentShader.replace('#include <aomap_fragment>','#include <aomap_fragment>\n#ifdef USE_ROUGHNESSMAP\nreflectedLight.indirectDiffuse*=texture2D(roughnessMap,vRoughnessMapUv).r;\n#endif');
  };mat.customProgramCacheKey=()=>skin.id+'-native-channels-v8-'+packedMetal+'-'+packedAO;mat.needsUpdate=true;return mat;
 });mesh.material=Array.isArray(original)?list:list[0];mesh.userData.ownedFinishMaterials=owned;mesh.userData.finishApplied=owned.length>0;
 });
 }catch(error){lease.release();throw error;}
}
