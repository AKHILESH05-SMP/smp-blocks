import { MediaPlaceholder } from "@wordpress/block-editor";

const ImageRender = ({
	aspectRatio = "4x3",
	imageUrl,
	onSelectImage,
	onSelectURL,
	imageAlt,
	objectPosition = "center center",
	lazyLoad = true,
	extraWrapperClass = "",
	isFullHeight = false,
	overflowHidden = true,
}) => {
	
	const wrapperClass = [
		!isFullHeight
			? `rounded-4 ${
					aspectRatio !== "none" ? `ratio ratio-${aspectRatio}` : ""
			  }`
			: "",
		overflowHidden ? "overflow-hidden" : "",
		extraWrapperClass,
	]
	.filter(Boolean)
	.join(" ")
	.trim();

	const imageContent = !imageUrl ? (
		<MediaPlaceholder
			icon="format-image"
			labels={{ title: "Image", instructions: "Upload or Select Image" }}
			onSelect={onSelectImage}
			onSelectURL={(url) => onSelectURL?.(url)}
			allowedTypes={["image"]}
		/>
	) : (
		<img
			src={imageUrl}
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
};

export default ImageRender;
