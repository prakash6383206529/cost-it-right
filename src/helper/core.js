import { useTranslation } from 'react-i18next';

export const useLabels = () => {
    // const { t } = useTranslation('MasterLabels');
    const labels = ['MasterLabels', 'Costing', 'AnotherNamespace', 'YetAnotherNamespace'];
    const { t } = useTranslation(labels);
   // Create separate translation functions for each namespace
   const tMasterLabels = t.getFixedT(null, 'MasterLabels');
   const tCosting = t.getFixedT(null, 'Costing');
    // const { t  } = useTranslation(['MasterLabels', 'Costing']);

    return {
        technologyLabel: tMasterLabels('commonFields.technology', { defaultValue: 'Technology' }),
        partTypeLabel: tMasterLabels('commonFields.partType', { defaultValue: 'Part Type' }),
        RMCategoryLabel:tMasterLabels('RMCategoryLabel', { defaultValue: 'Category' }),
        //costing
        hundiDiscount : tCosting('labels.discount', { defaultValue: 'Hundi/Discount' }),
    };
};
