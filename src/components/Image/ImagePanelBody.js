import { __ } from "@wordpress/i18n";
import { MediaUploadCheck, MediaUpload } from "@wordpress/block-editor";
import {
	PanelBody,
	BaseControl,
	Button,
	SelectControl,
	ToggleControl,
	__experimentalToggleGroupControl as ToggleGroupControl,
	__experimentalToggleGroupControlOption as ToggleGroupControlOption,
} from "@wordpress/components";

const ImagePanelBody = ({
	imagePosition,
	imagePositionOptions = [],
	imagePositionLabel = __("Image Position", "smp-blocks"),
	controls = {},
	setAttributes,
	imageSizes = {},
	title,
	imageId,
	imageUrl,
	imageAlt,
	aspectRatio = "4x3",
	imageSize,
	objectPosition = "center center",
	lazyLoad,
	overflowHidden = true, // 🚀 Added prop
	isFullHeight = false,
	onChangeImageSize,
	onSelectImage,
	onRemoveImage,
}) => {
	const enabled = {
		imagePosition: false,
		imageUpload: false,
		aspectRatio: false,
		imageSize: false,
		objectPosition: false,
		lazyLoad: false,
		overflowHidden: false, // 🚀 Default hidden in sidebar unless enabled
		...controls,
	};

	const normalizedOptions = imagePositionOptions.map((opt) =>
		typeof opt === "string" ? { label: opt, value: opt } : opt,
	);

	return (
		<PanelBody
			title={title || __("Image Settings", "smp-blocks")}
			initialOpen={false}
		>
			{enabled.imagePosition &&
				!isFullHeight &&
				normalizedOptions.length > 0 && (
					<ToggleGroupControl
						label={imagePositionLabel}
						value={imagePosition}
						onChange={(val) => setAttributes({ imagePosition: val })}
						isBlock
					>
						{normalizedOptions.map(({ label, value }) => (
							<ToggleGroupControlOption
								key={value}
								value={value}
								label={__(label, "smp-blocks")}
							/>
						))}
					</ToggleGroupControl>
				)}

			{/* 2. Image Upload Box */}
			{enabled.imageUpload && (
				<BaseControl label={__("Image", "smp-blocks")}>
					<MediaUploadCheck>
						<MediaUpload
							onSelect={onSelectImage}
							allowedTypes={["image"]}
							value={imageId}
							render={({ open }) => (
								<div className="border rounded overflow-hidden">
									<div
										className="position-relative bg-light d-flex align-items-center justify-content-center"
										style={{ height: 200, cursor: "pointer" }}
										onClick={open}
									>
										{imageUrl ? (
											<>
												<img
													src={imageUrl}
													alt={imageAlt || ""}
													className="w-100 h-100 object-fit-cover"
												/>
												<Button
													icon="no-alt"
													onClick={(e) => {
														e.stopPropagation();
														onRemoveImage();
													}}
													label={__("Remove Image", "smp-blocks")}
													className="position-absolute top-0 end-0 m-2 bg-white text-dark shadow-sm rounded-pill p-0"
													style={{
														width: "24px",
														height: "24px",
														minWidth: "unset",
													}}
												/>
											</>
										) : (
											<span className="fs-1 text-secondary">+</span>
										)}
									</div>
									<Button
										variant="secondary"
										onClick={open}
										className="w-100 rounded-0 border-top justify-content-center"
									>
										{imageUrl
											? __("Change Image", "smp-blocks")
											: __("Upload Image", "smp-blocks")}
									</Button>
								</div>
							)}
						/>
					</MediaUploadCheck>
				</BaseControl>
			)}

			{enabled.aspectRatio && !isFullHeight && imageUrl && (
				<SelectControl
					label={__("Aspect Ratio / Layout", "smp-blocks")}
					value={aspectRatio || "4x3"}
					options={[
						{ label: "4:3 (Default)", value: "4x3" },
						{ label: "1:1", value: "1x1" },
						{ label: "16:9", value: "16x9" },
						{ label: "21:9", value: "21x9" },
					]}
					onChange={(val) => setAttributes({ aspectRatio: val })}
				/>
			)}

			{/* 4. Resolutions & Other Controls */}
			{enabled.imageSize && (
				<>
					{imageId && Object.keys(imageSizes).length > 0 ? (
						<SelectControl
							label={__("Image Size", "smp-blocks")}
							value={imageSize || "full"}
							options={Object.entries(imageSizes).map(
								([size, data]) => ({
									label:
										size.charAt(0).toUpperCase() + size.slice(1),
									value: size,
								}),
							)}
							onChange={onChangeImageSize}
						/>
					) : (
						imageUrl && (
							<BaseControl
								help={__(
									"Custom/External URLs always use full resolution.",
									"smp-blocks",
								)}
							/>
						)
					)}
				</>
			)}

			{enabled.objectPosition && (
				<SelectControl
					label={__("Object Position", "smp-blocks")}
					value={objectPosition}
					options={[
						{ label: __("Center"), value: "center center" },
						{ label: __("Top"), value: "center top" },
						{ label: __("Bottom"), value: "center bottom" },
						{ label: __("Left"), value: "left center" },
						{ label: __("Right"), value: "right center" },
					]}
					onChange={(v) => setAttributes({ objectPosition: v })}
				/>
			)}

			{enabled.lazyLoad && (
				<ToggleControl
					label={__("Enable lazy loading", "smp-blocks")}
					checked={!!lazyLoad}
					onChange={(v) => setAttributes({ lazyLoad: v })}
				/>
			)}

			{/* 🚀 New Toggle for Overflow Hidden */}
			{enabled.overflowHidden && (
				<ToggleControl
					label={__("Overflow Hidden (Clip image)", "smp-blocks")}
					checked={!!overflowHidden}
					onChange={(v) => setAttributes({ overflowHidden: v })}
				/>
			)}
		</PanelBody>
	);
};

export default ImagePanelBody;
