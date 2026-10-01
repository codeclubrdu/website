// AI-coded (Claude) under the owner's /live exemption — see CONTRIBUTING.md
//
// Build-time QR: the Discord invite as an inline SVG string (uqr, no runtime dep, no CDN).
// Monochrome to match the chrome; the paper frame comes from the host element's CSS.

import { renderSVG } from 'uqr';
import { DISCORD_INVITE } from '../../data/links';

export const DISCORD_QR_SVG = renderSVG(DISCORD_INVITE, {
	ecc: 'M',
	border: 0,
	blackColor: '#050505',
	whiteColor: '#f4f4f4',
});
