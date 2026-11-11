import { useEffect, useRef, useState } from 'react';
import { useOrrery } from './OrreryContext';

const TWITTER_VIA = 'lagrange_mtl';

/** link to the current view, to copy or share */
export default function ShareWidget({ onClose }: { onClose: () => void }) {
	const orrery = useOrrery();
	const [link] = useState(() => orrery.getShareUrl());
	const [copied, setCopied] = useState(false);
	const inputRef = useRef<HTMLInputElement>(null);
	const widgetRef = useRef<HTMLDivElement>(null);

	useEffect(() => {
		inputRef.current?.select();
		//close when clicking anywhere else
		const onDocumentClick = (e: MouseEvent) => {
			if (widgetRef.current && !widgetRef.current.contains(e.target as Node)) onClose();
		};
		const onKeyDown = (e: KeyboardEvent) => {
			if (e.key === 'Escape') onClose();
		};
		document.addEventListener('click', onDocumentClick);
		document.addEventListener('keydown', onKeyDown);
		return () => {
			document.removeEventListener('click', onDocumentClick);
			document.removeEventListener('keydown', onKeyDown);
		};
	}, [onClose]);

	const copy = () => {
		navigator.clipboard?.writeText(link).then(() => setCopied(true), () => inputRef.current?.select());
	};

	const tweetUrl = `https://twitter.com/intent/tweet?${new URLSearchParams({ url: link, via: TWITTER_VIA }).toString()}`;

	return (
		<div id="shareWidget" className="shown" ref={widgetRef}>
			Direct link url
			<input type="text" id="shareUrl" ref={inputRef} value={link} readOnly onFocus={e => e.currentTarget.select()} />
			<div id="social">
				<a role="button" tabIndex={0} onClick={copy} onKeyDown={e => e.key === 'Enter' && copy()}>{copied ? 'Copied!' : 'Copy link'}</a>
				<a href={tweetUrl} target="_blank" rel="noopener noreferrer">Tweet</a>
			</div>
		</div>
	);
}
