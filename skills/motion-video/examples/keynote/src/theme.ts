import type {CSSProperties} from 'react';
import {interpolate, spring} from 'remotion';
import {loadFont} from '@remotion/google-fonts/Inter';

// Clean, minimal look: lots of empty space, one idea per screen,
// slow and calm motion. No third-party logos, icons or brand marks.

const {fontFamily: inter} = loadFont('normal', {
	weights: ['400', '500', '700', '800'],
	subsets: ['latin', 'latin-ext'],
});

// ---------------------------------------------------------------------------
// Colors — black or pure white background, white/light-gray text, one accent
// ---------------------------------------------------------------------------

export const colors = {
	black: '#000000',
	white: '#FFFFFF',
	textPrimary: '#FFFFFF',
	textSecondary: '#A1A1A6',
	textOnLight: '#0A0A0A',
	textSecondaryOnLight: '#6E6E73',
	accent: '#2F7BFF',
	accentSoft: 'rgba(47, 123, 255, 0.16)',
	hairline: 'rgba(255, 255, 255, 0.14)',
} as const;

// The only gradient allowed — a subtle variation of the accent itself.
export const accentGradient = 'linear-gradient(90deg, #2F7BFF 0%, #6AA8FF 100%)';

export type Surface = 'dark' | 'light';

export const surface = (mode: Surface) =>
	mode === 'dark'
		? {background: colors.black, text: colors.textPrimary, muted: colors.textSecondary}
		: {background: colors.white, text: colors.textOnLight, muted: colors.textSecondaryOnLight};

// ---------------------------------------------------------------------------
// Typography — Inter (Geist as a local fallback), huge bold titles
// ---------------------------------------------------------------------------

export const fonts = {
	sans: `${inter}, Geist, system-ui, sans-serif`,
} as const;

// Sizes in px for a 1920×1080 canvas.
export const type = {
	hero: {fontSize: 180, fontWeight: 800, letterSpacing: '-0.045em', lineHeight: 1.0},
	title: {fontSize: 120, fontWeight: 700, letterSpacing: '-0.035em', lineHeight: 1.05},
	subtitle: {fontSize: 56, fontWeight: 500, letterSpacing: '-0.015em', lineHeight: 1.2},
	body: {fontSize: 40, fontWeight: 400, letterSpacing: '-0.01em', lineHeight: 1.35},
	label: {fontSize: 28, fontWeight: 500, letterSpacing: '0.02em', lineHeight: 1.2},
	number: {fontSize: 220, fontWeight: 800, letterSpacing: '-0.05em', lineHeight: 1.0, fontVariantNumeric: 'tabular-nums'},
} satisfies Record<string, CSSProperties>;

// One idea per screen: keep titles to a handful of words.
export const MAX_WORDS_PER_SCREEN = 6;

// ---------------------------------------------------------------------------
// Layout — generous empty space
// ---------------------------------------------------------------------------

export const layout = {
	width: 1920,
	height: 1080,
	safeX: 160,
	safeY: 120,
	gap: 48,
} as const;

// ---------------------------------------------------------------------------
// Motion — fade + small rise + 0.96 → 1 scale, heavily damped spring.
// No bounce, no rotation, nothing flashy.
// ---------------------------------------------------------------------------

export const springConfig = {
	damping: 200,
	stiffness: 80,
	mass: 1,
	overshootClamping: true,
} as const;

export const motion = {
	riseDistance: 30, // px, within 20–40
	scaleFrom: 0.96,
	transitionSeconds: 0.8, // within 0.6–1s
	staggerSeconds: 0.25,
} as const;

export const seconds = (s: number, fps: number) => Math.round(s * fps);

/** 0 → 1 progress driven by the damped spring. */
export const enterProgress = (frame: number, fps: number, delayFrames = 0) =>
	spring({
		frame: frame - delayFrames,
		fps,
		config: springConfig,
		durationInFrames: seconds(motion.transitionSeconds, fps),
	});

/** Style for the standard entrance: fade + rise + scale. */
export const enterStyle = (frame: number, fps: number, delayFrames = 0): CSSProperties => {
	const p = enterProgress(frame, fps, delayFrames);
	const y = interpolate(p, [0, 1], [motion.riseDistance, 0]);
	const scale = interpolate(p, [0, 1], [motion.scaleFrom, 1]);
	return {opacity: p, transform: `translateY(${y}px) scale(${scale})`};
};

/** Mirror of enterStyle for the exit, starting at `startFrame`. */
export const exitStyle = (frame: number, fps: number, startFrame: number): CSSProperties => {
	const p = enterProgress(frame, fps, startFrame);
	const y = interpolate(p, [0, 1], [0, -motion.riseDistance / 2]);
	const scale = interpolate(p, [0, 1], [1, motion.scaleFrom]);
	return {opacity: 1 - p, transform: `translateY(${y}px) scale(${scale})`};
};

// ---------------------------------------------------------------------------
// Numbers & data — counters that climb to the value, thin-line charts
// ---------------------------------------------------------------------------

/** Value for a counter that climbs from 0 to `to` along the damped spring. */
export const countUp = (
	frame: number,
	fps: number,
	to: number,
	{delayFrames = 0, durationSeconds = 1.6, decimals = 0} = {},
) => {
	const p = spring({
		frame: frame - delayFrames,
		fps,
		config: springConfig,
		durationInFrames: seconds(durationSeconds, fps),
	});
	return (to * p).toFixed(decimals);
};

export const chart = {
	strokeWidth: 3,
	stroke: colors.accent,
	gridStroke: colors.hairline,
	gridStrokeWidth: 1,
	dotRadius: 6,
	drawSeconds: 1.2,
} as const;

// ---------------------------------------------------------------------------
// Presenter video — full screen or shrunk into a rounded card
// ---------------------------------------------------------------------------

export const videoCard = {
	// Card occupies the right side; big text takes the rest.
	width: 600,
	height: 820,
	right: 120,
	top: (layout.height - 820) / 2,
	borderRadius: 40,
	boxShadow: '0 30px 80px rgba(0, 0, 0, 0.45), 0 8px 24px rgba(0, 0, 0, 0.25)',
} as const;

/**
 * Interpolates the presenter video between full screen (p = 0)
 * and the rounded card (p = 1). Drive `p` with enterProgress().
 */
export const videoFrameStyle = (p: number): CSSProperties => ({
	position: 'absolute',
	overflow: 'hidden',
	width: interpolate(p, [0, 1], [layout.width, videoCard.width]),
	height: interpolate(p, [0, 1], [layout.height, videoCard.height]),
	top: interpolate(p, [0, 1], [0, videoCard.top]),
	right: interpolate(p, [0, 1], [0, videoCard.right]),
	borderRadius: interpolate(p, [0, 1], [0, videoCard.borderRadius]),
	boxShadow: p > 0 ? videoCard.boxShadow : 'none',
});

export const theme = {
	colors,
	accentGradient,
	fonts,
	type,
	layout,
	motion,
	springConfig,
	chart,
	videoCard,
} as const;

export default theme;
