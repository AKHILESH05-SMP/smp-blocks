import {
	useBlockProps,
	RichText
} from "@wordpress/block-editor";

import { ImageSave } from "../components/Image";
import { ButtonSave } from "../components/Button";

export default function save({ attributes }) {
	const {
		selectedPaddingOptions = [],
		bgClass,

		imagePosition,
		imageUrl,
		imageAlt,
		aspectRatio,
		objectPosition,
		lazyLoad,

		showSubHeading,
		subHeading,
		showHeading,
		headingTag,
		heading,
		showDescription,
		description,

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

	const sectionClasses = [
		"kf-section",
		"text-image-01-container",
		"position-relative",
		bgClass,
		...selectedPaddingOptions,
	]
	.filter(Boolean)
	.join(" ");

	const rowClasses = [
		"row",
		"align-items-center",
		"justify-content-between",
		imagePosition === "right" ? "flex-row-reverse" : "",
	]
	.filter(Boolean)
	.join(" ");

	return (
		<div {...useBlockProps.save({ className: sectionClasses })}>
			<div className="container" data-mf-animation="fade-up">
				<div className={rowClasses}>
					<div className="col-lg-6">
						<ImageSave
							imageUrl={imageUrl}
							imageAlt={imageAlt}
							aspectRatio={aspectRatio}
							objectPosition={objectPosition}
							lazyLoad={lazyLoad}
							extraWrapperClass="text-image-01-media"
						/>
					</div>

					<div className="col-xl-5 col-lg-6">
						<div className="text-image-01-content d-flex flex-column align-items-start gap-3">
							{showSubHeading && subHeading && (
								<RichText.Content
									tagName="div"
									className="kf-eyebrow"
									value={subHeading}
								/>
							)}
							{showHeading && heading && (
								<RichText.Content
									tagName={headingTag}
									className="h2"
									value={heading}
								/>
							)}
							{showDescription && description && (
								<div className="text-image-01-text kf-text-muted">
									<RichText.Content
										tagName="p"
										value={description}
									/>
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
