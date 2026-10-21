import React from 'react';
import type {CSSProperties} from 'react';
import {
	AbsoluteFill,
	OffthreadVideo,
	interpolate,
	staticFile,
	useCurrentFrame,
	useVideoConfig,
} from 'remotion';
import scenesData from './scenes.json';
import words from './words.json';
import {Captions} from './Captions';
import {
	accentGradient,
	colors,
	enterProgress,
	fonts,
	layout,
	motion,
	seconds,
	type,
	videoCard,
	videoFrameStyle,
} from './theme';

type Scene = {
	id: number;
	start: number;
	end: number;
	type: string;
	video_mode: 'card' | 'full';
	cues: {t: number}[];
};

const scenes = scenesData.scenes as unknown as Scene[];

// Text column to the left of the video card.
const TEXT_LEFT = layout.safeX;
const TEXT_WIDTH = layout.width - layout.safeX - videoCard.width - videoCard.right - 100;

// ---------------------------------------------------------------------------
// Timing helpers
// ---------------------------------------------------------------------------

// Visual start of a scene: the first on-screen cue, never earlier than the scene start.
const sceneIn = (s: Scene) => Math.max(s.start, s.cues[0].t) - 0.2;

/** Combined entrance/exit: fade + rise + 0.96 → 1 scale, damped spring. */
const fx = (frame: number, fps: number, inS: number, outS?: number): CSSProperties => {
	const pIn = enterProgress(frame, fps, seconds(inS, fps));
	const pOut = outS === undefined ? 0 : enterProgress(frame, fps, seconds(outS, fps));
	const y = motion.riseDistance * (1 - pIn) - (motion.riseDistance / 2) * pOut;
	const scale = 1 - (1 - motion.scaleFrom) * (1 - pIn) - (1 - motion.scaleFrom) * pOut;
	return {opacity: pIn * (1 - pOut), transform: `translateY(${y}px) scale(${scale})`};
};

/** Sum of in/out springs over the scenes matching `mode`: 0 outside, 1 inside. */
const modeProgress = (frame: number, fps: number, mode: Scene['video_mode']) =>
	Math.min(
		1,
		scenes
			.filter((s) => s.video_mode === mode)
			.reduce(
				(acc, s) =>
					acc +
					enterProgress(frame, fps, seconds(sceneIn(s), fps)) -
					enterProgress(frame, fps, seconds(s.end, fps)),
				0,
			),
	);

// ---------------------------------------------------------------------------
// Building blocks
// ---------------------------------------------------------------------------

const base: CSSProperties = {fontFamily: fonts.sans, color: colors.textPrimary, margin: 0};

const accentText: CSSProperties = {
	backgroundImage: accentGradient,
	WebkitBackgroundClip: 'text',
	backgroundClip: 'text',
	color: 'transparent',
};

/** Left text column used while the video is a card. */
const Column: React.FC<{children: React.ReactNode; style?: CSSProperties}> = ({children, style}) => (
	<AbsoluteFill
		style={{
			left: TEXT_LEFT,
			width: TEXT_WIDTH,
			justifyContent: 'center',
			...style,
		}}
	>
		{children}
	</AbsoluteFill>
);

/** Centered layer over the dimmed full-screen video. */
const Center: React.FC<{children: React.ReactNode}> = ({children}) => (
	<AbsoluteFill style={{justifyContent: 'center', alignItems: 'center', textAlign: 'center', padding: layout.safeX}}>
		{children}
	</AbsoluteFill>
);

// ---------------------------------------------------------------------------
// Scenes (times are absolute seconds on the output timeline)
// ---------------------------------------------------------------------------

type SceneProps = {frame: number; fps: number; end: number};

const S1TitleDefinition: React.FC<SceneProps> = ({frame, fps, end}) => (
	<>
		<Column>
			<h1 style={{...base, ...type.title, ...fx(frame, fps, 4.18, 6.6)}}>O que é uma LLM?</h1>
		</Column>
		<Column>
			<h1 style={{...base, ...type.title, fontSize: 104, ...fx(frame, fps, 6.78, end)}}>Large Language Model</h1>
			<p style={{...base, ...type.subtitle, marginTop: 36, ...fx(frame, fps, 9.34, end)}}>
				<span style={accentText}>Grande Modelo de Linguagem</span>
			</p>
		</Column>
	</>
);

const S2List: React.FC<SceneProps> = ({frame, fps, end}) => {
	const items: [string, number][] = [
		['Livros', 15.16],
		['Códigos', 15.9],
		['Artigos', 16.64],
		['Músicas', 17.84],
	];
	return (
		<>
			<Column>
				{items.map(([label, t]) => (
					<p key={label} style={{...base, ...type.title, fontSize: 96, lineHeight: 1.15, ...fx(frame, fps, t, 19.2)}}>
						{label}
					</p>
				))}
			</Column>
			<Column>
				<h1 style={{...base, ...type.title, ...fx(frame, fps, 19.44, end)}}>
					Tudo que existe na <span style={accentText}>internet</span>
				</h1>
			</Column>
		</>
	);
};

const S3KeyPhrase: React.FC<SceneProps> = ({frame, fps, end}) => (
	<Center>
		<h1 style={{...base, ...type.hero, ...fx(frame, fps, 30.72, end)}}>Padrões e palavras.</h1>
	</Center>
);

const SuggestionBar: React.FC<{style: CSSProperties}> = ({style}) => {
	const words = ['dia', 'demais', 'trabalho'];
	return (
		<div style={{marginTop: 32, ...style}}>
			<p style={{...base, ...type.label, color: colors.textSecondary, marginBottom: 14}}>
				Bom<span style={{color: colors.accent}}>|</span>
			</p>
			<div
				style={{
					display: 'flex',
					border: `1px solid ${colors.hairline}`,
					borderRadius: 18,
					overflow: 'hidden',
					width: 560,
				}}
			>
				{words.map((w, i) => (
					<div
						key={w}
						style={{
							...base,
							...type.label,
							flex: 1,
							padding: '18px 0',
							textAlign: 'center',
							color: i === 0 ? colors.textPrimary : colors.textSecondary,
							borderLeft: i === 0 ? 'none' : `1px solid ${colors.hairline}`,
						}}
					>
						{w}
					</div>
				))}
			</div>
		</div>
	);
};

const S4Comparison: React.FC<SceneProps> = ({frame, fps, end}) => {
	const lineP = enterProgress(frame, fps, seconds(42.5, fps));
	return (
		<Column>
			<h2 style={{...base, ...type.title, fontSize: 84, ...fx(frame, fps, 36.74, end)}}>Seu teclado</h2>
			<p style={{...base, ...type.body, color: colors.textSecondary, marginTop: 12, ...fx(frame, fps, 37.48, end)}}>
				sugere a próxima palavra
			</p>
			<SuggestionBar style={fx(frame, fps, 37.88, end)} />
			<div
				style={{
					height: 1,
					background: colors.hairline,
					margin: '56px 0',
					width: interpolate(lineP, [0, 1], [0, 560]),
					opacity: 1 - enterProgress(frame, fps, seconds(end, fps)),
				}}
			/>
			<h2 style={{...base, ...type.title, fontSize: 84, ...fx(frame, fps, 42.78, end)}}>
				<span style={accentText}>LLM</span>
			</h2>
			<p style={{...base, ...type.body, color: colors.textSecondary, marginTop: 12, ...fx(frame, fps, 43.38, end)}}>
				da mesma forma
			</p>
		</Column>
	);
};

const S5KeyPhrase: React.FC<SceneProps> = ({frame, fps, end}) => {
	const words: [string, number][] = [
		['Palavra', 44.84],
		['por', 45.12],
		['palavra.', 45.44],
	];
	return (
		<>
			<Center>
				<h1 style={{...base, ...type.hero, fontSize: 150}}>
					{words.map(([w, t]) => (
						<span key={w} style={{display: 'inline-block', marginRight: '0.25em', ...fx(frame, fps, t, 48.0)}}>
							{w}
						</span>
					))}
				</h1>
			</Center>
			<Center>
				<h1 style={{...base, ...type.title, ...fx(frame, fps, 48.28, end)}}>
					Não é inteligente <span style={{color: colors.textSecondary}}>de fato.</span>
				</h1>
			</Center>
		</>
	);
};

const S6MythFact: React.FC<SceneProps> = ({frame, fps, end}) => {
	const strikeP = enterProgress(frame, fps, seconds(63.32, fps));
	const mythStyle = fx(frame, fps, 55.78, end);
	return (
		<Column>
			<div style={{position: 'relative', alignSelf: 'flex-start', ...mythStyle}}>
				<h2
					style={{
						...base,
						...type.title,
						fontSize: 96,
						color: colors.textSecondary,
						opacity: interpolate(strikeP, [0, 1], [1, 0.45]),
					}}
				>
					Vai tomar o mundo?
				</h2>
				<div
					style={{
						position: 'absolute',
						left: 0,
						top: '50%',
						height: 4,
						borderRadius: 2,
						background: colors.textPrimary,
						width: `${strikeP * 100}%`,
					}}
				/>
			</div>
			<h1 style={{...base, ...type.title, marginTop: 56, ...fx(frame, fps, 63.6, end)}}>Não é consciente.</h1>
		</Column>
	);
};

const S7KeyPhrase: React.FC<SceneProps> = ({frame, fps, end}) => (
	<Column>
		<h1 style={{...base, ...type.title, ...fx(frame, fps, 66.48, end)}}>
			Ela só <span style={accentText}>prevê</span> palavras.
		</h1>
	</Column>
);

const S8List: React.FC<SceneProps> = ({frame, fps, end}) => {
	const names: [string, number][] = [
		['ChatGPT', 76.38],
		['Claude', 77.16],
		['Codex', 77.86],
		['Gemini', 79.28],
	];
	return (
		<Column>
			<p style={{...base, ...type.subtitle, color: colors.textSecondary, marginBottom: 40, ...fx(frame, fps, 74.04, end)}}>
				Você já usou uma LLM?
			</p>
			{names.map(([n, t]) => (
				<h2 key={n} style={{...base, ...type.title, fontSize: 96, lineHeight: 1.15, ...fx(frame, fps, t, end)}}>
					{n}
				</h2>
			))}
		</Column>
	);
};

const S9Cta: React.FC<SceneProps> = ({frame, fps}) => (
	<Column>
		<h1 style={{...base, ...type.title, fontSize: 104, ...fx(frame, fps, 85.34)}}>
			Qual é a próxima <span style={accentText}>palavra?</span>
		</h1>
		<p style={{...base, ...type.subtitle, color: colors.textSecondary, marginTop: 36, ...fx(frame, fps, 86.8)}}>
			Comenta aqui embaixo.
		</p>
	</Column>
);

const SCENE_COMPONENTS: Record<number, React.FC<SceneProps>> = {
	1: S1TitleDefinition,
	2: S2List,
	3: S3KeyPhrase,
	4: S4Comparison,
	5: S5KeyPhrase,
	6: S6MythFact,
	7: S7KeyPhrase,
	8: S8List,
	9: S9Cta,
};

// ---------------------------------------------------------------------------
// Composition
// ---------------------------------------------------------------------------

export const Main: React.FC = () => {
	const frame = useCurrentFrame();
	const {fps} = useVideoConfig();
	const t = frame / fps;

	const cardP = modeProgress(frame, fps, 'card');
	const dimP = modeProgress(frame, fps, 'full');

	const exitS = motion.transitionSeconds + 0.2;
	const active = scenes.filter((s) => t >= sceneIn(s) - 0.05 && t < s.end + exitS);

	return (
		<AbsoluteFill style={{backgroundColor: colors.black}}>
			<div
				style={{
					...videoFrameStyle(cardP),
					border: cardP > 0.01 ? `1px solid ${colors.hairline}` : 'none',
				}}
			>
				<OffthreadVideo
					src={staticFile('base.mp4')}
					style={{width: '100%', height: '100%', objectFit: 'cover'}}
				/>
			</div>

			<AbsoluteFill style={{backgroundColor: colors.black, opacity: dimP * 0.62}} />

			{active.map((s) => {
				const C = SCENE_COMPONENTS[s.id];
				return <C key={s.id} frame={frame} fps={fps} end={s.end} />;
			})}

			<Captions
				words={words}
				model="pilula"
				theme={{fontFamily: fonts.sans, text: colors.textPrimary, accent: colors.accent, ink: colors.textOnLight}}
				hidden={(time) => scenes.some((s) => time >= sceneIn(s) - 0.1 && time < s.end + motion.transitionSeconds)}
			/>
		</AbsoluteFill>
	);
};
