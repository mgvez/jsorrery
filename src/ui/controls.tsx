import { useState, type KeyboardEvent, type ReactNode } from 'react';
import type { Range, SelectOption } from '../state/types';

/** calls the handler on Enter / Space, for elements that act as buttons */
export function onActivateKey(handler: () => void) {
	return (e: KeyboardEvent) => {
		if (e.key === 'Enter' || e.key === ' ') {
			e.preventDefault();
			handler();
		}
	};
}

interface HelpButtonProps {
	target: string;
	onToggle: (target: string) => void;
	id?: string;
	children?: ReactNode;
}

/** the "?" icon that opens a help panel */
export function HelpButton({ target, onToggle, id, children }: HelpButtonProps) {
	const toggle = () => onToggle(target);
	return (
		<span
			id={id}
			className="help fa fa-question-circle"
			role="button"
			tabIndex={0}
			aria-label={children ? undefined : 'Help'}
			onClick={(e) => {
				//help icons are inside labels: don't focus the label's input
				e.preventDefault();
				toggle();
			}}
			onKeyDown={onActivateKey(toggle)}
		>
			{children ?? ' '}
		</span>
	);
}

interface FieldProps {
	id: string;
	label: ReactNode;
	help?: string;
	onHelp?: (target: string) => void;
	isDropdown?: boolean;
	children: ReactNode;
}

/** a labelled control of the GUI */
export function Field({ id, label, help, onHelp, isDropdown, children }: FieldProps) {
	return (
		<label id={`${id}Label`} className="shown">
			<div>
				{label}
				{help && onHelp && <> <HelpButton target={help} onToggle={onHelp} /></>}
			</div>
			<div id={`${id}Cont`} className={`inputContainer${isDropdown ? ' dropdown' : ''}`}>
				{children}
			</div>
		</label>
	);
}

interface DropdownProps {
	id: string;
	options: SelectOption[];
	value: string | null;
	onChange: (value: string) => void;
}

/** list of options, shown on hover */
export function Dropdown({ id, options, value, onChange }: DropdownProps) {
	const selected = options.find(option => option.value === value) ?? options[0];
	return (
		<>
			<div className="display">{selected ? selected.label : ' '}</div>
			<ul id={id} role="listbox">
				{options.map(option => {
					const select = () => onChange(option.value);
					return (
						<li
							key={option.value}
							data-value={option.value}
							role="option"
							tabIndex={0}
							aria-selected={option === selected}
							className={option === selected ? 'selected' : undefined}
							onClick={(e) => {
								e.preventDefault();
								select();
							}}
							onKeyDown={onActivateKey(select)}
						>
							{option.label}
						</li>
					);
				})}
			</ul>
		</>
	);
}

interface TextFieldProps {
	/** value to display when the field is not being edited */
	value: string;
	onCommit: (value: string) => void;
	'aria-label'?: string;
}

/** text input that commits its value on Enter or when it loses focus, and follows `value` otherwise */
export function TextField({ value, onCommit, ...rest }: TextFieldProps) {
	//text typed by the user, until it is committed (null when not edited)
	const [draft, setDraft] = useState<string | null>(null);
	const commit = () => {
		if (draft !== null) onCommit(draft);
		setDraft(null);
	};
	return (
		<input
			type="text"
			value={draft ?? value}
			onChange={(e) => setDraft(e.target.value)}
			onBlur={commit}
			onKeyDown={(e) => {
				if (e.key === 'Enter') {
					commit();
					e.currentTarget.blur();
				} else if (e.key === 'Escape') {
					setDraft(null);
					e.currentTarget.blur();
				}
			}}
			{...rest}
		/>
	);
}

interface RangeFieldProps {
	range: Range;
	value: number;
	onChange: (value: number) => void;
	'aria-label'?: string;
}

export function RangeField({ range, value, onChange, ...rest }: RangeFieldProps) {
	return (
		<input
			type="range"
			min={range.min}
			max={range.max}
			step={range.step ?? 1}
			value={value}
			onChange={(e) => onChange(Number(e.target.value))}
			{...rest}
		/>
	);
}
