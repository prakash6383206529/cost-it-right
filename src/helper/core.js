import React from 'react';
import { useTranslation } from 'react-i18next';
import { showLogoFromDataBase } from '../config/constants';
import { getConfigurationKey } from './auth';
import PrimaryLogo from '../assests/images/logo/company-logo.svg';
import SecondaryLogo from '../assests/images/logo/CIRlogo.svg';

export const useLabels = () => {
    // const { t } = useTranslation('MasterLabels');
    const labels = ['MasterLabels', 'CostingLabels'];
    const { i18n } = useTranslation(labels);
    // Create separate translation functions for each namespace
    const tMasterLabels = i18n.getFixedT(null, 'MasterLabels');
    const tCosting = i18n.getFixedT(null, 'CostingLabels');

    return {
        technologyLabel: tMasterLabels('TechnologyLabel', { defaultValue: 'Technology' }),
        partTypeLabel: tMasterLabels('commonFields.partType', { defaultValue: 'Part Type' }),
        RMCategoryLabel: tMasterLabels('RMCategoryLabel', { defaultValue: 'Category' }),
        discountLabel: tCosting('discount', { defaultValue: 'Hundi/Discount' }),
        toolMaintenanceCostLabel: tCosting('toolMaintenanceCost', { defaultValue: 'Tool Maintenance Cost (per pcs)' }),
        vendorLabel : tMasterLabels('VendorLabel', { defaultValue: 'Vendor'}),
        RMVendorLabel : tMasterLabels('RMVendorLabel', { defaultValue: 'RM Vendor'})
    };
};

  export const LabelsClass = (t, ns) => {
    return {
        vendorLabel: t('VendorLabel', { ns }),
        BOPVendorLabel : t('BOPVendorLabel', { ns }),
    }
  }

 
export const useWithLocalization = (dataArray, ns) => {
    const { t } = useTranslation(ns);
    const labels = useLabels();

    return dataArray.map(item => ({
        ...item,
        label: t(item.label, { defaultValue: item.defaultValue })
            // .replace(/Technology/g, labels.technologyLabel) //       THIS CODE FOR THE TECHNOLOGY LABEL WILL USE FURTHER IN FUTURE .

            .replace(/Vendor/g, labels.vendorLabel)
            // .replace(/Category/g, labels.RMCategoryLabel)
        // Add more .replace() calls for other labels as needed
    }));
};
export const withLocalization = (dataArray, t, ns) => {
    return dataArray.map(item => ({
        ...item,
        label: t(item.label, { defaultValue: item.defaultValue, ns: ns })
    }));
};
export const CompanyLogo = (props) => {
    return <img src={showLogoFromDataBase ? getConfigurationKey().LogoURL : PrimaryLogo} alt={showLogoFromDataBase ? getConfigurationKey().ClientName ?? "LOGO" : 'Softude'} height={props.height ?? ''} />
}

export const CirLogo = (props) => {
    return <img className="logo-second" src={SecondaryLogo} height={props.height ?? ''} alt="Cost It Right" />
}


  export const localizeLabels = (headers, labelMap) => {
    return headers.map(header => {
      let newLabel = header.label;
      
      Object.entries(labelMap).forEach(([originalTerm, localizedTerm]) => {
        const regex = new RegExp(originalTerm, 'g');
        newLabel = newLabel.replace(regex, localizedTerm);
      });
      
      return { ...header, label: newLabel };
    });
  };