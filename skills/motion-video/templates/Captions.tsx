import React from 'react';
import type {CSSProperties} from 'react';
import {AbsoluteFill, Easing, interpolate, useCurrentFrame, useVideoConfig} from 'remotion';

// Word-level captions in six models. Render it as the LAST layer of the composition.

export type Word = {text: string; start: number; end: number};

export type CaptionModel = 'reels' | 'karaoke' | 'pilula' | 'gigante' | 'cinema' | 'marca-texto';

export type CaptionTheme = {
	fontFamily: string;
	text: string; // main caption color
	accent: string; // highlight color (karaoke word, keywords, marker)
	ink: string; // dark text for the "marca-texto" strip
};

type Block = {words: Word[]; start: number; end: number};

const MAX_WORDS: Record<CaptionModel, number> = {
	reels: 2,
	karaoke: 4,
	pilula: 6,
	gigante: 1,
	cinema: 12,
	'marca-texto': 6,
};

const UPPERCASE: Record<CaptionModel, boolean> = {
	reels: true,
	karaoke: true,
	pilula: false,
	gigante: true,
	cinema: false,
	'marca-texto': false,
};

const PAUSE_BREAK_S = 0.35;
const HOLD_S = 0.3;

const endsSentence = (w: string) => /[.!?;:,]$/.test(w);
const clean = (w: string) => w.toLowerCase().replace(/[^\p{L}\p{N}]/gu, '');

/** Groups words into on-screen blocks: by size, punctuation and pauses. */
export const buildBlocks = (words: Word[], model: CaptionModel): Block[] => {
	const blocks: Block[] = [];
	let current: Word[] = [];
	const flush = () => {
		if (current.length === 0) return;
		blocks.push({words: current, start: current[0].start, end: current[current.length - 1].end});
		current = [];
	};
	words.forEach((w, i) => {
		if (current.length > 0 && w.start - words[i - 1].end >= PAUSE_BREAK_S) flush();
		current.push(w);
		if (current.length >= MAX_WORDS[model] || endsSentence(w.text)) flush();
	});
	flush();
	return blocks;
};

const display = (text: string, model: CaptionModel) =>
	UPPERCASE[model] ? text.replace(/[,;:.]+$/, '').toUpperCase() : text;

export const Captions: React.FC<{
	words: Word[];
	model: CaptionModel;
	theme: CaptionTheme;
	/** Words (any case, no punctuation needed) that get the accent in gigante / marca-texto. */
	keywords?: string[];
	/** Return true while a big-text scene owns the screen. */
	hidden?: (t: number) => boolean;
}> = ({words, model, theme, keywords = [], hidden}) => {
	const frame = useCurrentFrame();
	const {fps, width, height} = useVideoConfig();
	const t = frame / fps;
	const blocks = React.useMemo(() => buildBlocks(words, model), [words, model]);

	if (hidden?.(t)) return null;
	const index = blocks.findIndex(
		(b, i) => t >= b.start && t < Math.min(b.end + HOLD_S, i + 1 < blocks.length ? blocks[i + 1].start : Infinity),
	);
	if (index < 0) return null;
	const block = blocks[index];
	const age = t - block.start;

	// Sizes are authored for a 1080 px short side.
	const k = Math.min(width, height) / 1080;
	const vertical = height > width;
	const isKey = (w: string) => keywords.some((kw) => clean(kw) === clean(w));

	const position: CSSProperties =
		model === 'gigante'
			? {justifyContent: 'center'}
			: {justifyContent: 'flex-end', paddingBottom: vertical ? height * 0.32 : 72 * k};

	const base: CSSProperties = {
		fontFamily: theme.fontFamily,
		color: theme.text,
		textAlign: 'center',
		maxWidth: width * 0.8,
		margin: 0,
		lineHeight: 1.15,
	};

	let content: React.ReactNode;

	if (model === 'reels') {
		content = (
			<p style={{...base, fontSize: 64 * k, fontWeight: 800, WebkitTextStroke: `${6 * k}px #000`, paintOrder: 'stroke fill'}}>
				{block.words.map((w) => display(w.text, model)).join(' ')}
			</p>
		);
	} else if (model === 'karaoke') {
		const active = block.words.reduce((acc, w, i) => (t >= w.start ? i : acc), -1);
		content = (
			<p style={{...base, fontSize: 62 * k, fontWeight: 800, WebkitTextStroke: `${5 * k}px #000`, paintOrder: 'stroke fill'}}>
				{block.words.map((w, i) => (
					<span
						key={i}
						style={{
							display: 'inline-block',
							margin: `0 ${0.12}em`,
							color: i === active ? theme.accent : theme.text,
							transform: `scale(${i === active ? 1.06 : 1})`,
						}}
					>
						{display(w.text, model)}
					</span>
				))}
			</p>
		);
	} else if (model === 'pilula') {
		const p = interpolate(age, [0, 0.15], [0, 1], {extrapolateRight: 'clamp', easing: Easing.out(Easing.cubic)});
		content = (
			<p
				style={{
					...base,
					fontSize: 44 * k,
					fontWeight: 600,
					background: 'rgba(0, 0, 0, 0.7)',
					borderRadius: 999,
					padding: `${14 * k}px ${30 * k}px`,
					opacity: p,
					transform: `translateY(${(1 - p) * 8 * k}px)`,
				}}
			>
				{block.words.map((w) => w.text).join(' ')}
			</p>
		);
	} else if (model === 'gigante') {
		const w = block.words[0];
		const s = interpolate(age, [0, 0.15], [0.8, 1], {extrapolateRight: 'clamp', easing: Easing.out(Easing.back(1.4))});
		content = (
			<p
				style={{
					...base,
					fontSize: 140 * k,
					fontWeight: 900,
					letterSpacing: '-0.02em',
					color: isKey(w.text) ? theme.accent : theme.text,
					textShadow: '0 6px 30px rgba(0,0,0,0.55)',
					transform: `scale(${s})`,
				}}
			>
				{display(w.text, model)}
			</p>
		);
	} else if (model === 'cinema') {
		const p = interpolate(age, [0, 0.2], [0, 1], {extrapolateRight: 'clamp'});
		content = (
			<p
				style={{
					...base,
					fontSize: 46 * k,
					fontWeight: 500,
					opacity: p,
					textShadow: '0 2px 14px rgba(0,0,0,0.75), 0 0 2px rgba(0,0,0,0.9)',
				}}
			>
				{block.words.map((w) => w.text).join(' ')}
			</p>
		);
	} else {
		// marca-texto: dark text on a light strip; keywords get a marker sweeping left to right.
		const sweep = interpolate(age, [0.05, 0.45], [0, 100], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
		content = (
			<p
				style={{
					...base,
					fontSize: 46 * k,
					fontWeight: 600,
					color: theme.ink,
					background: 'rgba(255, 255, 255, 0.92)',
					borderRadius: 12 * k,
					padding: `${12 * k}px ${24 * k}px`,
				}}
			>
				{block.words.map((w, i) => (
					<span
						key={i}
						style={
							isKey(w.text)
								? {
										backgroundImage: `linear-gradient(${theme.accent}, ${theme.accent})`,
										backgroundRepeat: 'no-repeat',
										backgroundSize: `${sweep}% 100%`,
										padding: `0 ${4 * k}px`,
									}
								: undefined
						}
					>
						{w.text}
						{i < block.words.length - 1 ? ' ' : ''}
					</span>
				))}
			</p>
		);
	}

	return <AbsoluteFill style={{alignItems: 'center', ...position}}>{content}</AbsoluteFill>;
};
