import { __ } from '@wordpress/i18n';
import { __experimentalLinkControl as LinkControl } from '@wordpress/block-editor';
import { PanelBody, BaseControl, ToggleControl, SelectControl } from '@wordpress/components';

import { BUTTON_STYLES } from './constants';

const ButtonPanelBody = ({
  title = __('Button Settings', 'smp-blocks'),
  showButton,
  buttonUrl,
  buttonTarget,
  buttonStyle,
  setAttributes
}) => (
  <PanelBody title={title} initialOpen={false}>
    <ToggleControl
      label={__('Show Button', 'smp-blocks')}
      checked={showButton}
      onChange={(v) => setAttributes({ showButton: v })}
    />
    {showButton && (
      <>
        <BaseControl label={__('Link', 'smp-blocks')}>
          <div className="smp-link-control">

            <LinkControl
              value={
                buttonUrl
                  ? {
                      url: buttonUrl,
                      opensInNewTab: buttonTarget === '_blank',
                    }
                  : undefined
              }
              settings={[
                {
                  id: 'opensInNewTab',
                  title: __('Open in new tab', 'smp-blocks'),
                },
              ]}
              onChange={({ url, opensInNewTab }) => {
                setAttributes({
                  buttonUrl: url || '',
                  buttonTarget: opensInNewTab ? '_blank' : '_self',
                });
              }}
            onRemove={() => { setAttributes({ buttonUrl: '', buttonTarget: '_self' }); }}
            />

          </div>
        </BaseControl>
        <SelectControl
          label={__('Style', 'smp-blocks')}
          value={buttonStyle}
          onChange={(v) => setAttributes({ buttonStyle: v })}
          options={BUTTON_STYLES.map(
            (style) => ({
              label: __(
                style.label,
                'smp-blocks'
              ),
              value: style.value,
            })
          )}
        />
      </>
    )}
  </PanelBody>
);

export default ButtonPanelBody;