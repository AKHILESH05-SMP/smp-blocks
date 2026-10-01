import { RichText } from '@wordpress/block-editor';

import { BUTTON_STYLE_VALUES } from './constants';

const ButtonRender = ({
	showButton,
	buttonUrl,
	buttonTarget,
	buttonStyle,
	buttonText,
	setAttributes,
}) => {
	if (!showButton) {
		return null;
	}

	const safeButtonStyle = BUTTON_STYLE_VALUES.includes(buttonStyle) ? buttonStyle : 'primary';

	const safeTarget = buttonTarget === '_blank' ? '_blank' : '_self';

	return (
		<RichText
			tagName="a"
			href={buttonUrl || undefined}
			target={safeTarget}
			rel={
				safeTarget === '_blank'
					? 'noopener noreferrer'
					: undefined
			}
			className={`btn btn-${safeButtonStyle}`}
			value={buttonText}
			onChange={(v) =>
				setAttributes({ buttonText: v })
			}
			placeholder="Button text..."
			allowedFormats={[]}
		/>
	);
};

export default ButtonRender;