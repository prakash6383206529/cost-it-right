import { useTranslation } from 'react-i18next';

export const useLabels = () => {
    const { t } = useTranslation('MasterLabels');

    return {
        technologyLabel: t('commonFields.technology', { defaultValue: 'Technology' }),
        partTypeLabel: t('commonFields.partType', { defaultValue: 'Part Type' }),
    };
};