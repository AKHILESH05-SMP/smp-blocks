import { BUTTON_STYLE_VALUES } from './constants';

export default function ButtonSave({
  showButton,
  buttonText,
  buttonUrl,
  buttonTarget,
  buttonStyle
}) {
  if (!showButton || !buttonText) {
    return null;
  }

  const safeButtonStyle = BUTTON_STYLE_VALUES.includes(buttonStyle) ? buttonStyle : 'primary';

	const safeTarget = buttonTarget === '_blank' ? '_blank' : '_self';

  return (
    <a
      href={buttonUrl || undefined}
      target={safeTarget}
      rel={safeTarget === '_blank' ? 'noopener noreferrer' : undefined}
      className={`btn btn-${safeButtonStyle}`}
    >
      {buttonText}
    </a>
  );
}