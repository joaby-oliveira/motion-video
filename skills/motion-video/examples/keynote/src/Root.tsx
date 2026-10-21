import React from 'react';
import {Composition} from 'remotion';
import {Main} from './Main';
import {layout} from './theme';

// fps and duration come from public/base.mp4 (ffprobe).
const FPS = 24;
const DURATION_S = 89.724;

export const Root: React.FC = () => (
	<Composition
		id="Main"
		component={Main}
		width={layout.width}
		height={layout.height}
		fps={FPS}
		durationInFrames={Math.floor(DURATION_S * FPS)}
	/>
);
