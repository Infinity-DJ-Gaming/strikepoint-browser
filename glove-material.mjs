import * as T from 'three';
import {GLOVE_LAYERS} from './glove-layers-data.mjs?v=20261020-7';
// Source 2's material compositor is not available in WebGL. Preserve its native
// layer IDs, pattern enable flags and unpainted skin, instead of tiling a pattern
// over the whole hand. All inputs below are original game textures/parameters.
export async function gloveMaterial(skin,item,load){
 const p=skin.material?.parameters||{},files={...skin.material?.textures,...GLOVE_LAYERS[skin.id]?.textures},modern=!!files.g_tLayerId;
 const patternEnabled=p.F_PATTERN===1||p.F_PATTERN_PAINT===1;
 const [normal,mask,tint,pattern,...surface]=await Promise.all([load(files.g_tNormal),load(files.g_tLayerId||files.g_tLayerMask),load(files.g_tTintIdLegacy||files.g_tTintId),load(patternEnabled?files.g_tPattern:null,true),...Array.from({length:4},(_,i)=>load(modern?files['g_tSurface'+(i+1)]:files.g_tSurface,true))]);
 for(const t of [mask,tint])if(t){t.magFilter=T.NearestFilter;t.minFilter=T.NearestFilter;}
 const color=v=>new T.Color().setRGB(...(v||[1,1,1]).slice(0,3),T.SRGBColorSpace),palette=Array.from({length:8},(_,i)=>color(p['g_vColorTint'+(i+1)]||p['g_vTintColor'+(i+1)])),surfaceTints=Array.from({length:4},(_,i)=>new T.Color().setRGB(...(p['g_vSurfaceColorTint'+(i+1)]||[1,1,1]).slice(0,3)));
 const indices=p.g_vPatternPaletteIndices||[1,2,3,4],patternPalette=indices.map(n=>palette[Math.max(0,Math.min(7,n-1))]);
 return source=>{const m=source.clone();if(normal)m.normalMap=normal;m.color.set(0xffffff);m.metalness=.03;m.roughness=.82;
  if(!m.map)m.map=surface[0]||pattern;
  const uniforms={gMask:{value:mask||m.map},gTint:{value:tint||m.map},gPattern:{value:pattern||m.map},gSurfaces:{value:surface.map(t=>t||m.map)},gModern:{value:modern?1:0},gHasMask:{value:mask?1:0},gHasTint:{value:tint&&p.F_TINT_ID!==0?1:0},gHasPattern:{value:pattern?1:0},gReplace:{value:p.g_nPatternReplaceIndex??0},gPalette:{value:palette},gPatternPalette:{value:patternPalette},gSurfaceTint:{value:surfaceTints},gScale:{value:p.g_fPatternTexCoordScale??1},gRotation:{value:(p.g_fPatternTexCoordRotation??0)*Math.PI/180},gWear:{value:item.wear??.02},gDetailScale:{value:Array.from({length:4},(_,i)=>p['g_vUvScale'+(i+1)]?.[0]??p['g_fSurfaceTexCoordScale'+(i+1)]??1)}};
  m.onBeforeCompile=shader=>{Object.assign(shader.uniforms,uniforms);shader.fragmentShader='uniform sampler2D gMask,gTint,gPattern;uniform sampler2D gSurfaces[4];uniform float gModern,gHasMask,gHasTint,gHasPattern,gReplace,gScale,gRotation,gWear;uniform vec3 gPalette[8],gPatternPalette[4],gSurfaceTint[4];uniform float gDetailScale[4];\n'+shader.fragmentShader;shader.fragmentShader=shader.fragmentShader.replace('#include <map_fragment>',`#ifdef USE_MAP
 vec4 original=texture2D(map,vMapUv);vec3 ids=texture2D(gMask,vMapUv).rgb;
 float region=gModern>.5?(ids.r>.5?0.:ids.g>.5?1.:ids.b>.5?2.:3.):(ids.r>.5?1.:ids.g>.5?2.:ids.b>.5?3.:0.);
 vec3 painted=original.rgb;
 if(gHasMask>.5){
  if(gModern>.5){
   vec3 a=texture2D(gSurfaces[0],vMapUv*gDetailScale[0]).rgb*gSurfaceTint[0];
   vec3 b=texture2D(gSurfaces[1],vMapUv*gDetailScale[1]).rgb*gSurfaceTint[1];
   vec3 c=texture2D(gSurfaces[2],vMapUv*gDetailScale[2]).rgb*gSurfaceTint[2];
   vec3 d=texture2D(gSurfaces[3],vMapUv*gDetailScale[3]).rgb*gSurfaceTint[3];
   painted=region<.5?a:region<1.5?b:region<2.5?c:d;
   if(gHasTint>.5){int tintIndex=int(clamp(floor(texture2D(gTint,vMapUv).r*8.+.5)-1.,0.,7.));painted*=gPalette[tintIndex];}
  }else{int i=int(clamp(floor(texture2D(gTint,vMapUv).r*8.),0.,7.));painted=gPalette[i];float ao=texture2D(gSurfaces[0],vMapUv).r;painted*=mix(.45,1.,ao);}
  float nativeTint=floor(texture2D(gTint,vMapUv).r*8.);
  if(gHasPattern>.5&&(gModern>.5||abs(nativeTint-(gReplace-1.))<.5)){
   vec2 uv=vMapUv-.5;float cr=cos(gRotation),sr=sin(gRotation);uv=mat2(cr,-sr,sr,cr)*uv*gScale+.5;
   vec3 pat=texture2D(gPattern,uv).rgb;
   vec3 mapped=mix(gPatternPalette[0],gPatternPalette[1],pat.r);mapped=mix(mapped,gPatternPalette[2],pat.g);mapped=mix(mapped,gPatternPalette[3],pat.b);
   painted=gModern>.5?pat:mapped;
  }
 }
 // Wear changes the textile finish, never the separate bare fingers or sleeves.
 float grime=dot(original.rgb,vec3(.299,.587,.114));painted=mix(painted,painted*.55+original.rgb*.15,gWear*(1.-grime)*.65);
 diffuseColor*=vec4(painted,original.a);
 #endif`);};m.customProgramCacheKey=()=>skin.id+'-native-glove-layers-v7';m.needsUpdate=true;return m;};
}
