import { __ } from "@wordpress/i18n";
import { Fragment } from "@wordpress/element";
import {
	useBlockProps,
	InspectorControls,
	RichText,
} from "@wordpress/block-editor";
import { PanelBody, ToggleControl, SelectControl } from "@wordpress/components";

import { ImagePanelBody, ImageRender } from "../components/Image";
import { ButtonPanelBody, ButtonRender } from "../components/Button";
import { SectionSettingsPanelBody } from "../components/SectionSettings";

export default function Edit({ attributes, setAttributes }) {
	const {
		selectedPaddingOptions = [],
		bgClass = "",

		imageId,
		imageUrl,
		imageAlt,
		imageSize = "full",
		imageSizes = {},
		aspectRatio = "none",
		objectPosition = "center center",
		lazyLoad = false,
		overflowHidden = false,

		showSubHeading,
		subHeading,
		showHeading,
		headingTag = "h2",
		heading,

		// Paragraph 1
		showDescription,
		description,

		// Paragraph 2
		showDescription2,
		description2,

		// Button 1
		showButton,
		buttonText,
		buttonUrl,
		buttonTarget,
		buttonStyle,

		// Button 2
		showButton2,
		buttonText2,
		buttonUrl2,
		buttonTarget2,
		buttonStyle2,
	} = attributes;

	const onSelectImage = (media) => {
		const sizes = media?.sizes || {};
		setAttributes({
			imageId: media?.id || 0,
			imageAlt: media?.alt || "",
			imageSizes: sizes,
			imageSize: "full",
			imageUrl: media?.url || "",
		});
	};

	const onChangeImageSize = (size) => {
		const selected = imageSizes?.[size];
		const fallback =
			imageSizes?.full || imageSizes?.large || imageSizes?.medium;
		setAttributes({
			imageSize: size,
			imageUrl: selected?.url || fallback?.url || imageUrl,
		});
	};

	const onRemoveImage = () =>
		setAttributes({
			imageId: null,
			imageUrl: "",
			imageAlt: "",
			imageSizes: {},
			imageSize: "full",
		});

	const onSelectURL = (url) =>
		setAttributes({
			imageId: 0,
			imageUrl: url,
			imageAlt: "",
			imageSizes: {},
			imageSize: "full",
		});

	const setButton2Attributes = (newAttrs) => {
		const mappedAttrs = {};
		if (newAttrs.showButton !== undefined)
			mappedAttrs.showButton2 = newAttrs.showButton;
		if (newAttrs.buttonText !== undefined)
			mappedAttrs.buttonText2 = newAttrs.buttonText;
		if (newAttrs.buttonUrl !== undefined)
			mappedAttrs.buttonUrl2 = newAttrs.buttonUrl;
		if (newAttrs.buttonTarget !== undefined)
			mappedAttrs.buttonTarget2 = newAttrs.buttonTarget;
		if (newAttrs.buttonStyle !== undefined)
			mappedAttrs.buttonStyle2 = newAttrs.buttonStyle;
		setAttributes(mappedAttrs);
	};

	const sectionClasses = [
		"kf-section",
		"text-image-04-container",
		"position-relative",
		bgClass,
		...selectedPaddingOptions,
	]
		.filter(Boolean)
		.join(" ")
		.trim();

	const HeadingTag = headingTag ? headingTag.toLowerCase() : "h2";

	return (
		<Fragment>
			<InspectorControls>
				<SectionSettingsPanelBody
					bgClass={bgClass}
					selectedPaddingOptions={selectedPaddingOptions}
					setAttributes={setAttributes}
				/>

				<ImagePanelBody
					imageId={imageId}
					imageUrl={imageUrl}
					imageAlt={imageAlt}
					imageSizes={imageSizes}
					imageSize={imageSize}
					aspectRatio={aspectRatio}
					objectPosition={objectPosition}
					lazyLoad={lazyLoad}
					setAttributes={setAttributes}
					overflowHidden={overflowHidden}
					controls={{
						imageUpload: true,
						aspectRatio: false,
						imageSize: true,
						objectPosition: true,
						lazyLoad: true,
						overflowHidden: false,
					}}
					onSelectImage={onSelectImage}
					onChangeImageSize={onChangeImageSize}
					onRemoveImage={onRemoveImage}
				/>
				<PanelBody
					title={__("Content Settings", "smp-blocks")}
					initialOpen={false}
				>
					<ToggleControl
						label={__("Show Sub Heading", "smp-blocks")}
						checked={showSubHeading}
						onChange={(v) => setAttributes({ showSubHeading: v })}
					/>
					<ToggleControl
						label={__("Show Heading", "smp-blocks")}
						checked={showHeading}
						onChange={(v) => setAttributes({ showHeading: v })}
					/>
					{showHeading && (
						<SelectControl
							label={__("Heading Tag", "smp-blocks")}
							value={headingTag}
							options={["h1", "h2", "h3", "h4", "h5", "h6"].map((h) => ({
								label: h.toUpperCase(),
								value: h,
							}))}
							onChange={(val) => setAttributes({ headingTag: val })}
						/>
					)}
					<ToggleControl
						label={__("Show Paragraph 1", "smp-blocks")}
						checked={showDescription}
						onChange={(v) => setAttributes({ showDescription: v })}
					/>
					<ToggleControl
						label={__("Show Paragraph 2", "smp-blocks")}
						checked={showDescription2}
						onChange={(v) => setAttributes({ showDescription2: v })}
					/>
				</PanelBody>

				<ButtonPanelBody
					title={__("Button 1 Settings", "smp-blocks")}
					showButton={showButton}
					buttonText={buttonText}
					buttonUrl={buttonUrl}
					buttonTarget={buttonTarget}
					buttonStyle={buttonStyle}
					setAttributes={setAttributes}
				/>

				<ButtonPanelBody
					title={__("Button 2 Settings", "smp-blocks")}
					showButton={showButton2}
					buttonText={buttonText2}
					buttonUrl={buttonUrl2}
					buttonTarget={buttonTarget2}
					buttonStyle={buttonStyle2}
					setAttributes={setButton2Attributes}
				/>
			</InspectorControls>

			<div {...useBlockProps({ className: sectionClasses })}>
				<div className="container" data-mf-animation="fade-up">
					<div className="row">
						<div className="col-lg-12">
							<ImageRender
								imageUrl={imageUrl}
								imageAlt={imageAlt}
								aspectRatio={aspectRatio}
								objectPosition={objectPosition}
								lazyLoad={lazyLoad}
								onSelectImage={onSelectImage}
								onSelectURL={onSelectURL}
								extraWrapperClass="text-image-04-media"
							/>
						</div>
					</div>

					<div className="row g-4 g-lg-5">
						<div className="col-lg-5">
							<div className="text-image-04-content-left d-flex flex-column align-items-start gap-4">
								{showSubHeading && (
									<RichText
										tagName="div"
										className="kf-eyebrow"
										value={subHeading}
										allowedFormats={[]}
										onChange={(v) => setAttributes({ subHeading: v })}
										placeholder={__("Subheading", "smp-blocks")}
									/>
								)}
								{showHeading && (
									<RichText
										tagName={HeadingTag}
										className="h2"
										value={heading}
										allowedFormats={[
											"core/bold",
											"core/italic",
											"core/text-color",
										]}
										onChange={(v) => setAttributes({ heading: v })}
										placeholder={__("Heading", "smp-blocks")}
									/>
								)}
							</div>
						</div>

						<div className="col-lg-6 ms-auto">
							<div className="text-image-04-content-right d-flex flex-column align-items-start gap-4">
								{(showDescription || showDescription2) && (
									<div className="text-image-04-text kf-lead-text-first kf-text-muted">
										{showDescription && (
											<RichText
												tagName="p"
												value={description}
												allowedFormats={[
													"core/bold",
													"core/italic",
													"core/link",
												]}
												onChange={(v) => setAttributes({ description: v })}
												placeholder={__("First paragraph...", "smp-blocks")}
											/>
										)}
										{showDescription2 && (
											<RichText
												tagName="p"
												value={description2}
												allowedFormats={[
													"core/bold",
													"core/italic",
													"core/link",
												]}
												onChange={(v) => setAttributes({ description2: v })}
												placeholder={__("Second paragraph...", "smp-blocks")}
											/>
										)}
									</div>
								)}
								{/* */}
								{(showButton || showButton2) && (
									<div className="w-100 d-flex flex-column flex-md-row gap-3 gap-md-4 mt-2">
										{showButton && (
											<ButtonRender
												showButton={showButton}
												buttonUrl={buttonUrl}
												buttonTarget={buttonTarget}
												buttonStyle={buttonStyle}
												buttonText={buttonText}
												setAttributes={setAttributes}
											/>
										)}
										{showButton2 && (
											<ButtonRender
												showButton={showButton2}
												buttonUrl={buttonUrl2}
												buttonTarget={buttonTarget2}
												buttonStyle={buttonStyle2}
												buttonText={buttonText2}
												setAttributes={setButton2Attributes}
											/>
										)}
									</div>
								)}
							</div>
						</div>
					</div>
				</div>
			</div>
		</Fragment>
	);
}