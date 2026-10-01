import { __ } from '@wordpress/i18n';
import { Fragment, useEffect, useMemo } from '@wordpress/element';
import { 
    PanelBody, 
    SelectControl, 
    Spinner, 
    FormTokenField,
    __experimentalToggleGroupControl as ToggleGroupControl,
    __experimentalToggleGroupControlOption as ToggleGroupControlOption
} from '@wordpress/components';
import { useSelect } from '@wordpress/data';
import { decodeEntities } from '@wordpress/html-entities';

const FaqPanelBody = ({ attributes, setAttributes }) => {
    const {
        faqSource, faqSelectionMode = 'specific', faqOrder, faqOrderBy, 
        selectedFaqIds = [], selectedFaqGroups = [], dynamicFaqs = []
    } = attributes;

    const allFaqsPosts = useSelect((select) => select('core').getEntityRecords('postType', 'faq', { per_page: 100, status: 'publish' }), []);
    const allFaqGroups = useSelect((select) => select('core').getEntityRecords('taxonomy', 'faq_group', { per_page: 100 }), []);

    const query = useMemo(() => {
        const baseQuery = { status: 'publish', per_page: 100 }; 
        
        if (faqSelectionMode === 'group') {
            if (selectedFaqGroups.length > 0) {
                baseQuery.faq_group = selectedFaqGroups; 
            }
            baseQuery.orderby = faqOrderBy === 'include' ? 'date' : faqOrderBy; 
        } else {
            if (selectedFaqIds.length > 0) {
                baseQuery.include = selectedFaqIds;
                baseQuery.orderby = faqOrderBy === 'include' ? 'include' : faqOrderBy;
            } else {
                baseQuery.orderby = faqOrderBy === 'include' ? 'date' : faqOrderBy;
            }
        }

        if (baseQuery.orderby !== 'include') {
            baseQuery.order = faqOrder;
        }
        
        return baseQuery;
    }, [faqSelectionMode, selectedFaqIds, selectedFaqGroups, faqOrderBy, faqOrder]);

    const fetchedPosts = useSelect((select) => {
        if (faqSource !== 'postType') return null;
        return select('core').getEntityRecords('postType', 'faq', query);
    }, [faqSource, query]);

    const isFetching = useSelect((select) => select('core').isResolving('core', 'getEntityRecords', ['postType', 'faq', query]), [query]);

    useEffect(() => {
        if (faqSource === 'postType' && fetchedPosts) {
            let finalPosts = [...fetchedPosts];
            if (faqSelectionMode === 'specific' && selectedFaqIds.length > 0 && faqOrderBy === 'include') {
                finalPosts = selectedFaqIds.map(id => fetchedPosts.find(post => post.id === id)).filter(Boolean);
            }

            const mappedFaqs = finalPosts.map(post => ({
                question: decodeEntities(post.title.rendered) || '',
                answer: post.content.rendered || ''
            }));
            setAttributes({ dynamicFaqs: mappedFaqs });
        }
    }, [fetchedPosts, faqSource, faqSelectionMode, selectedFaqIds, faqOrderBy, setAttributes]);

    // Token Field Handlers
    const faqSuggestions = useMemo(() => (allFaqsPosts || []).map(p => decodeEntities(p.title.rendered)), [allFaqsPosts]);
    const selectedFaqTokens = useMemo(() => selectedFaqIds.map(id => {
        const post = (allFaqsPosts || []).find(p => p.id === id);
        return post ? decodeEntities(post.title.rendered) : null;
    }).filter(Boolean), [selectedFaqIds, allFaqsPosts]);

    const handleFaqTokenChange = (tokens) => {
        const newIds = tokens.map(token => {
            const post = (allFaqsPosts || []).find(p => decodeEntities(p.title.rendered) === token);
            return post ? post.id : null;
        }).filter(Boolean);
        setAttributes({ selectedFaqIds: newIds });
    };

    const groupSuggestions = useMemo(() => (allFaqGroups || []).map(g => decodeEntities(g.name)), [allFaqGroups]);
    const selectedGroupTokens = useMemo(() => selectedFaqGroups.map(id => {
        const group = (allFaqGroups || []).find(g => g.id === id);
        return group ? decodeEntities(group.name) : null;
    }).filter(Boolean), [selectedFaqGroups, allFaqGroups]);

    const handleGroupTokenChange = (tokens) => {
        const newIds = tokens.map(token => {
            const group = (allFaqGroups || []).find(g => decodeEntities(g.name) === token);
            return group ? group.id : null;
        }).filter(Boolean);
        setAttributes({ selectedFaqGroups: newIds });
    };

    return (
        <PanelBody title="FAQ Source Settings" initialOpen={true}>
            <ToggleGroupControl label="Select FAQ Source" value={faqSource} isBlock onChange={(val) => setAttributes({ faqSource: val })}>
                <ToggleGroupControlOption value="manual" label="Manual" />
                <ToggleGroupControlOption value="postType" label="Post Type" />
            </ToggleGroupControl>

            {faqSource === 'postType' && (
                <Fragment>
                    <SelectControl
                        label="Fetch FAQs By"
                        value={faqSelectionMode}
                        options={[
                            { label: 'Specific FAQs (Individual)', value: 'specific' },
                            { label: 'FAQ Group (Taxonomy)', value: 'group' }
                        ]}
                        onChange={(v) => setAttributes({ faqSelectionMode: v })}
                    />

                    {faqSelectionMode === 'specific' && (
                        <div className="smp-relationship-wrapper" style={{ marginTop: '10px', marginBottom: '20px' }}>
                            <FormTokenField
                                label="Search & Select Individual FAQs"
                                value={selectedFaqTokens}
                                suggestions={faqSuggestions}
                                onChange={handleFaqTokenChange}
                                __experimentalExpandOnFocus={true}
                            />
                            <p style={{ fontSize: '11px', color: '#666', marginTop: '5px' }}>Leave empty to preview all latest FAQs.</p>
                        </div>
                    )}

                    {faqSelectionMode === 'group' && (
                        <div className="smp-relationship-wrapper" style={{ marginTop: '10px', marginBottom: '20px' }}>
                            <FormTokenField
                                label="Select FAQ Groups"
                                value={selectedGroupTokens}
                                suggestions={groupSuggestions}
                                onChange={handleGroupTokenChange}
                                __experimentalExpandOnFocus={true}
                            />
                            <p style={{ fontSize: '11px', color: '#666', marginTop: '5px' }}>Leave empty to preview all latest FAQs.</p>
                        </div>
                    )}

                    <SelectControl
                        label="Sort Order"
                        value={faqOrderBy}
                        options={[
                            ...(faqSelectionMode === 'specific' ? [{ label: 'Selection Order', value: 'include' }] : []),
                            { label: 'Date Published', value: 'date' },
                            { label: 'Title (A-Z)', value: 'title' },
                            { label: 'Menu Order', value: 'menu_order' }
                        ]}
                        onChange={(v) => setAttributes({ faqOrderBy: v })}
                    />
                    
                    {faqOrderBy !== 'include' && (
                        <SelectControl
                            label="Order Direction"
                            value={faqOrder}
                            options={[
                                { label: 'Descending (Newest First)', value: 'desc' },
                                { label: 'Ascending (Oldest First)', value: 'asc' }
                            ]}
                            onChange={(v) => setAttributes({ faqOrder: v })}
                        />
                    )}
                    {isFetching && <p><Spinner /> Syncing data...</p>}
                </Fragment>
            )}
        </PanelBody>
    );
}

export default FaqPanelBody;