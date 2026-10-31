import React from 'react';
import {Composition} from 'remotion';
import {Answers} from './Answers';
import {GetFound} from './GetFound';
import {BuildTrust} from './BuildTrust';
import {FPS,FRAMES,FOUND_FRAMES,TRUST_FRAMES,SIZE} from './motion';
export const Root:React.FC=()=> <>
  <Composition id="AnswersLoop" component={Answers} durationInFrames={FRAMES} fps={FPS} width={SIZE} height={SIZE}/>
  <Composition id="GetFoundLoop" component={GetFound} durationInFrames={FOUND_FRAMES} fps={FPS} width={SIZE} height={SIZE}/>
  <Composition id="BuildTrustLoop" component={BuildTrust} durationInFrames={TRUST_FRAMES} fps={FPS} width={SIZE} height={SIZE}/>
</>;
