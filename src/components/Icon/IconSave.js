/**
 * File: src/components/icon/IconSave.js
 */

const ALLOWED_ROTATIONS = new Set(["90", "180", "270"]);
const ALLOWED_FLIPS = new Set(["horizontal", "vertical", "both"]);

export const isImageUrl = (value) => {
	if (typeof value !== "string" || value.trim() === "") return false;

	const url = value.trim();
	if (url.length > 2048 || url.includes(" ")) return false;
	if (
		/^(?:javascript:|vbscript:|file:|data:text\/html|data:application\/javascript)/i.test(
			url,
		)
	)
		return false;
	if (url.startsWith("//") || url.startsWith("data:")) return false;
	if (url.startsWith("/")) return /^\/[\w\-./~!$&'()*+,;=:@%]+$/i.test(url);

	try {
		const parsed = new URL(url, window.location.origin);
		return (
			(parsed.protocol === "http:" || parsed.protocol === "https:") &&
			!/^[a-z0-9_-]+(?:\s+[a-z0-9_-]+)*$/i.test(url)
		);
	} catch {
		return false;
	}
};

const isIconClassName = (value) =>
	typeof value === "string" &&
	value.length <= 200 &&
	/^[a-z0-9_-]+(?:\s+[a-z0-9_-]+)*$/i.test(value);

export const sanitizeSvgMarkup = (svg) => {
	if (typeof svg !== "string") return "";
	let safe = svg.replace(/<script[\s\S]*?<\/script>/gi, "");
	safe = safe.replace(/on\w+\s*=\s*(?:["'][^"']*["']|[\w\-]+)/gi, "");
	safe = safe.replace(
		/href\s*=\s*(?:["'])?\s*(?:javascript:|vbscript:|data:text\/html)/gi,
		'href=""',
	);
	safe = safe.replace(
		/<\s*(?:script|iframe|object|embed|foreignObject)[\s\S]*?>/gi,
		"",
	);
	return safe;
};

export default function IconSave({ icon, className = "" }) {
	if (!icon) return null;

	const iconData = typeof icon === "string" ? { icon } : icon;
	if (!iconData || typeof iconData !== "object") return null;

	const {
		icon: iconClassOrUrl = "",
		color = "",
		rotation = "",
		flip = "",
	} = iconData;

	if (!iconClassOrUrl) return null;

	const buildClasses = (...args) =>
		args.join(" ").split(/\s+/).filter(Boolean).join(" ");
	const isImg = isImageUrl(iconClassOrUrl);
	if (!isImg && !isIconClassName(iconClassOrUrl)) return null;

	let faFlipClass = "";
	if (flip === "both") faFlipClass = "fa-flip-horizontal fa-flip-vertical";
	else if (ALLOWED_FLIPS.has(flip)) faFlipClass = `fa-flip-${flip}`;

	const faRotateClass = ALLOWED_ROTATIONS.has(rotation)
		? `fa-rotate-${rotation}`
		: "";
	const finalClass = buildClasses(
		!isImg ? iconClassOrUrl : "",
		className,
		"smp-custom-feature-icon",
		faRotateClass,
		faFlipClass,
	);

	const imageTransformStyle = (() => {
		if (!isImg) return undefined;
		const rotate = ALLOWED_ROTATIONS.has(rotation) ? Number(rotation) : 0;
		const flipX = flip === "horizontal" || flip === "both" ? -1 : 1;
		const flipY = flip === "vertical" || flip === "both" ? -1 : 1;
		const transform = `rotate(${rotate}deg) scaleX(${flipX}) scaleY(${flipY})`;
		return { transform, transformOrigin: "center center" };
	})();

	if (isImg) {
		return (
			<img
				src={iconClassOrUrl}
				alt="icon"
				className={finalClass || undefined}
				aria-hidden="true"
				loading="lazy"
				decoding="async"
				referrerPolicy="no-referrer"
				style={imageTransformStyle}
				onError={(event) => {
					event.currentTarget.style.display = "none";
				}}
			/>
		);
	}

	const iconStyle = {};
	if (color && typeof color === "string" && color.trim() !== "") {
		iconStyle.color = color.trim();
	}

	return (
		<i
			className={finalClass || undefined}
			style={Object.keys(iconStyle).length > 0 ? iconStyle : undefined}
			aria-hidden="true"
		></i>
	);
}
