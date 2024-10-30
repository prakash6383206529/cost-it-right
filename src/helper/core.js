import React, { useContext, useEffect, useMemo, useState } from 'react';
import { I18nContext, useTranslation } from 'react-i18next';
import { showLogoFromDataBase } from '../config/constants';
import { getConfigurationKey } from './auth';
import PrimaryLogo from '../assests/images/logo/company-logo.svg';
import SecondaryLogo from '../assests/images/logo/CIRlogo.svg';
import i18next from 'i18next';
import { DefaultLocalizationLabel } from './DefualtLocalizationLabel';

// Company Logo 
export const CompanyLogo = (props) => {
  return <img src={showLogoFromDataBase ? getConfigurationKey().LogoURL : PrimaryLogo} alt={showLogoFromDataBase ? getConfigurationKey().ClientName ?? "LOGO" : 'Softude'} height={props.height ?? ''} />
}
// CIR Logo 
export const CirLogo = (props) => {
  return <img className="logo-second" src={SecondaryLogo} height={props.height ?? ''} alt="Cost It Right" />
}

//
export const useLabels = () => {
  // const { t } = useTranslation('MasterLabels');
  const labels = ['MasterLabels', 'CostingLabels','CommonLabels'];
  const { i18n } = useTranslation(labels);
  // Create separate translation functions for each namespace
  const tMasterLabels = i18n.getFixedT(null, 'MasterLabels');
  const tCosting = i18n.getFixedT(null, 'CostingLabels');
  const tCommon = i18n.getFixedT(null, 'CommonLabels');
  return {
    technologyLabel: tMasterLabels('TechnologyLabel', { defaultValue: 'Technology' }),
    partTypeLabel: tMasterLabels('commonFields.partType', { defaultValue: 'Part Type' }),
    RMCategoryLabel: tMasterLabels('RMCategoryLabel', { defaultValue: 'Category' }),
    discountLabel: tCosting('discount', { defaultValue: 'Hundi/Discount' }),
    toolMaintenanceCostLabel: tCosting('toolMaintenanceCost', { defaultValue: 'Tool Maintenance Cost (per pcs)' }),
    vendorLabel: tMasterLabels('VendorLabel', { defaultValue: 'Vendor' }),
    RMVendorLabel: tMasterLabels('RMVendorLabel', { defaultValue: 'RM Vendor' }),
    vendorBasedLabel: tCommon('VendorBasedLabel', { defaultValue: 'Vendor Based' }),
    zeroBasedLabel: tCommon('ZeroBasedLabel', { defaultValue: 'Zero Based' }),
    customerBasedLabel: tCommon('CustomerBasedLabel', { defaultValue: 'Customer Based' })
  };
};

export const LabelsClass = (t, ns) => {
  return {
    vendorLabel: t('VendorLabel', { ns, defaultValue: 'Vendor' }),
    BOPVendorLabel: t('BOPVendorLabel', { ns, defaultValue: 'BOP Vendor' }),
  }
}


export const useWithLocalization = (dataArray, ns) => {
  const { t } = useTranslation(ns);
  const labels = useLabels();
  return dataArray.map(item => ({
    ...item,
    label: t(item.label, { defaultValue: item.defaultValue })
      .replace(/Technology/g, labels.technologyLabel) //       THIS CODE FOR THE TECHNOLOGY LABEL WILL USE FURTHER IN FUTURE .
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


// export const localizeLabels = (headers, labelMap) => {
//   return headers.map(header => {
//     let newLabel = header.label;

//     Object.entries(labelMap).forEach(([originalTerm, localizedTerm]) => {
//       const regex = new RegExp(originalTerm, 'g');
//       newLabel = newLabel.replace(regex, localizedTerm);
//     });

//     return { ...header, label: newLabel };
//   });
// };

const getLocalizedLabelMap = (t) => {
  const getAllLabels = () => {
    const namespaces = i18next.options.ns;
    const languages = i18next.languages;
    const selectedLanguage = languages[0];
    console.log("selectedLanguage:", selectedLanguage);
    let allLabels = {};

    languages.forEach(lang => {
      allLabels[lang] = {};
      namespaces.forEach(ns => {
        const resources = i18next.getResourceBundle(lang, ns);
        allLabels[lang][ns] = resources;
      });
    });
    return allLabels[selectedLanguage];
  };

  const allLabels = getAllLabels();
  console.log("allLabels:", allLabels);

  const labelMap = {};
  Object.entries(allLabels.MasterLabels ? allLabels.MasterLabels : DefaultLocalizationLabel).forEach(([key, value]) => {
    if (key.includes('Label')) {
      const simplifiedKey = key.replace('Label', '');
      labelMap[simplifiedKey] = t(key);
    }
  });

  return labelMap;
};

const applyLabelMap = (headers, labelMap) => {
  return headers.map(header => {
    let newLabel = header.label;
    Object.entries(labelMap).forEach(([originalTerm, localizedTerm]) => {
      const regex = new RegExp(originalTerm, 'g');
      newLabel = newLabel.replace(regex, localizedTerm);
    });
    return { ...header, label: newLabel };
  });
};

export const localizeHeadersWithLabels = (headers, t) => {
  const labelMap = getLocalizedLabelMap(t);
  return applyLabelMap(headers, labelMap);
};

export const useLocalizedHeaders = (headers) => {
  const { t } = useTranslation(["MasterLabels"]);

  const localizedHeaders = useMemo(() => {
    const labelMap = getLocalizedLabelMap(t);
    return applyLabelMap(headers, labelMap);
  }, [headers, t]);

  return localizedHeaders;
};
