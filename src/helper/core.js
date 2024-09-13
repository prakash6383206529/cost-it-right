import { useTranslation } from 'react-i18next';

export const useLabels = () => {
    // const { t } = useTranslation('MasterLabels');
    const labels = ['MasterLabels', 'CostingLabels'];
    const { i18n } = useTranslation(labels);
    // Create separate translation functions for each namespace
    const tMasterLabels = i18n.getFixedT(null, 'MasterLabels');
    const tCosting = i18n.getFixedT(null, 'CostingLabels');

    return {
        technologyLabel: tMasterLabels('Technology', { defaultValue: 'Technology' }),
        partTypeLabel: tMasterLabels('commonFields.partType', { defaultValue: 'Part Type' }),
        RMCategoryLabel: tMasterLabels('RMCategoryLabel', { defaultValue: 'Category' }),
        discountLabel: tCosting('discount', { defaultValue: 'Hundi/Discount' }),
    };
};
export const useWithLocalization = (dataArray, ns) => {
    const { t } = useTranslation(ns); // Adjust the namespace as needed

    return dataArray.map(item => ({
        ...item,
        label: t(item.label, { defaultValue: item.defaultValue })
    }));
};
export const withLocalization = (dataArray, t, ns) => {
    return dataArray.map(item => ({
        ...item,
        label: t(item.label, { defaultValue: item.defaultValue, ns: ns })
    }));
};