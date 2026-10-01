export default function ImageSave({
	aspectRatio = "4x3",
	imageUrl = "",
	imageSizes = {},
	imageAlt = "",
	objectPosition = "center center",
	lazyLoad = true,
	extraWrapperClass = "",
	isFullHeight = false,
	overflowHidden = true,
}) {
	if (!imageUrl) return null;

	const wrapperClass = [
		!isFullHeight && aspectRatio !== "none" ? `ratio ratio-${aspectRatio}` : "",
		overflowHidden ? "overflow-hidden" : "",
		extraWrapperClass,
	]
	.filter(Boolean)
	.join(" ")
	.trim();

	/**
	 * Build responsive srcset from WordPress generated image sizes.
	 *
	 * Example:
	 * image-150x150.jpg 150w,
	 * image-300x200.jpg 300w,
	 * image-1024x683.jpg 1024w,
	 * image-scaled.jpg 2560w
	 */
	const srcSet = Object.values(imageSizes)
		.filter(
			(size) =>
				size?.url &&
				Number.isFinite(Number(size.width)) &&
				Number(size.width) > 0
		)
		.map((size) => ({
			url: size.url,
			width: Number(size.width),
		}))
		.sort((a, b) => a.width - b.width)
		.filter(
			(size, index, sizes) =>
				index === 0 || size.width !== sizes[index - 1].width
		)
		.map((size) => `${size.url} ${size.width}w`)
		.join(", ");

	/**
	 * Image display width.
	 *
	 * Adjust this if your image column has a different
	 * maximum width at desktop/tablet breakpoints.
	 */
	const imageSizesAttribute = "(max-width: 991px) 100vw, 50vw";

	const imageContent = (
		<img
			src={imageUrl}
			{...(srcSet
				? {
						srcSet,
						sizes: imageSizesAttribute,
				  }
				: {})}
			alt={imageAlt || ""}
			className="w-100 h-100 object-fit-cover"
			style={{ objectPosition }}
			loading={lazyLoad ? "lazy" : "eager"}
			decoding="async"
		/>
	);

	if (!wrapperClass) {
		return imageContent;
	}

	return <div className={wrapperClass}>{imageContent}</div>;
}
