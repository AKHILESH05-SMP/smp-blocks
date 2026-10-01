import { useBlockProps, RichText } from "@wordpress/block-editor";
import { ImageSave } from "../components/Image";
import { ButtonSave } from "../components/Button";

export default function save({ attributes }) {
    const {
        selectedPaddingOptions = [],
        bgClass = "",

        imageUrl,
        imageAlt,
        aspectRatio = "16x9",
        objectPosition = "center center",
        lazyLoad = false,
        showSubHeading,
        subHeading,
        showHeading,
        headingTag = "h2",
        heading,
        showDescription,
        description,

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

    // Dynamic HTML Tag correctly lowercased for React rendering
    const HeadingTag = headingTag ? headingTag.toLowerCase() : "h2";

    const sectionClasses = [
        "kf-section",
        "text-image-03-container",
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
                    <div className="col-xl-10 mx-auto">
                        <div className="kf-section-heading kf-section-heading-center">
                            
                            {/* Main Heading Wrapper */}
                            {(showSubHeading || showHeading) && (
                                <div className="kf-section-heading-main">
                                    {showSubHeading && subHeading && (
                                        <RichText.Content
                                            tagName="div"
                                            className="kf-eyebrow"
                                            value={subHeading}
                                        />
                                    )}
                                    {showHeading && heading && (
                                        <RichText.Content 
                                            tagName={HeadingTag} 
                                            className={HeadingTag} 
                                            value={heading} 
                                        />
                                    )}
                                </div>
                            )}

                            {/* Description and Desktop Buttons Wrapper */}
                            {(showDescription || showButton || showButton2) && (
                                <div className="kf-section-heading-description">
                                    {showDescription && description && (
                                        <RichText.Content tagName="p" value={description} />
                                    )}
                                    
                                    {/* Show CTAs on Tablet and above */}
                                    {(showButton || showButton2) && (
                                        <div className="d-none d-md-flex flex-column flex-md-row gap-3 gap-md-4 mt-2">
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
                            )}

                        </div>
                    </div>
                </div>
                
                <div className="row">
                    <div className="col-xl-10 mx-auto">
                        <ImageSave
                            imageUrl={imageUrl}
                            imageAlt={imageAlt}
                            aspectRatio={aspectRatio}
                            objectPosition={objectPosition}
                            lazyLoad={lazyLoad}
                            extraWrapperClass="text-image-03-media"
                        />
                        
                        {/* Show CTAs on Mobile Only */}
                        {(showButton || showButton2) && (
                            <div className="w-100 d-flex flex-column d-md-none gap-3 gap-md-4 mt-4">
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
    );
}