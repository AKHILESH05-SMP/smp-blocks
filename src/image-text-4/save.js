import { useBlockProps, RichText } from "@wordpress/block-editor";
import { ImageSave } from "../components/Image";
import { ButtonSave } from "../components/Button";

export default function save({ attributes }) {
	const {
		selectedPaddingOptions = [],
		bgClass = "",
		imageUrl,
		imageAlt,
		aspectRatio = "none",
		objectPosition = "center center",
		lazyLoad = false,
		showSubHeading,
		subHeading,
		showHeading,
		headingTag = "h2",
		heading,
		
		showDescription,
		description,
		showDescription2,
		description2,
		overflowHidden = false,

		showButton,
		buttonText,
		buttonUrl,
		buttonTarget,
		buttonStyle,

		showButton2,
		buttonText2,
		buttonUrl2,
		buttonTarget2,
		buttonStyle2,
	} = attributes;

	const HeadingTag = headingTag ? headingTag.toLowerCase() : "h2";

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

	return (
		<div {...useBlockProps.save({ className: sectionClasses })}>
			<div className="container" data-mf-animation="fade-up">
				<div className="row">
					<div className="col-lg-12">
						<ImageSave
							imageUrl={imageUrl}
							imageAlt={imageAlt}
							aspectRatio={aspectRatio}
							objectPosition={objectPosition}
							lazyLoad={lazyLoad}
							overflowHidden={overflowHidden}
							extraWrapperClass="text-image-04-media"
						/>
					</div>
				</div>

				<div className="row g-4 g-lg-5">
					<div className="col-lg-5">
						<div className="text-image-04-content-left d-flex flex-column align-items-start gap-4">
							{showSubHeading && subHeading && (
								<RichText.Content
									tagName="div"
									className="kf-eyebrow"
									value={subHeading}
								/>
							)}
							{showHeading && heading && (
								<RichText.Content tagName={HeadingTag} className="h2" value={heading} />
							)}
						</div>
					</div>

					<div className="col-lg-6 ms-auto">
						<div className="text-image-04-content-right d-flex flex-column align-items-start gap-4">
							{(showDescription || showDescription2) && (
								<div className="text-image-04-text kf-lead-text-first kf-text-muted">
									{showDescription && description && (
										<RichText.Content tagName="p" value={description} />
									)}
									{showDescription2 && description2 && (
										<RichText.Content tagName="p" value={description2} />
									)}
								</div>
							)}
							{(showButton || showButton2) && (
								<div className="w-100 d-flex flex-column flex-md-row gap-3 gap-md-4 mt-2">
									{showButton && (
										<ButtonSave
											showButton={showButton}
											buttonUrl={buttonUrl}
											buttonTarget={buttonTarget}
											buttonStyle={buttonStyle}
											buttonText={buttonText}
										/>
									)}
									{showButton2 && (
										<ButtonSave
											showButton={showButton2}
											buttonUrl={buttonUrl2}
											buttonTarget={buttonTarget2}
											buttonStyle={buttonStyle2}
											buttonText={buttonText2}
										/>
									)}
								</div>
							)}
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}