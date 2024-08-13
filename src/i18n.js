
import i18n from 'i18next';
import Backend from 'i18next-http-backend';
import LanguageDetector from 'i18next-browser-languagedetector';
import { initReactI18next } from 'react-i18next';
import { clientName } from '../src/config/constants'; // Ensure this import is 

// Define the default load path
const defaultLoadPath = '/locales/{{lng}}/{{ns}}.json';

// Define a function to handle the load path based on clientName
const getLoadPath = (lng, ns) => {
    // Always use the default path
    let loadPath = defaultLoadPath;

    return loadPath;
};

// Initialize i18next with default backend configuration
i18n
    .use(Backend)
    .use(LanguageDetector)
    .use(initReactI18next)
    .init({
        fallbackLng: 'en', // Fallback language if needed
        ns: [
            'common',
            'RawMaterialMaster',
            'BOPMaster',
            'MachineMaster',
            'OverheadsProfits',
            'OperationMaster',
            'FuelPowerMaster',
            'PartMaster',
            'VendorMaster',
            'Costing',
            'Dashboard',
            'labels'
        ],
        defaultNS: 'common',

        backend: {
            loadPath: (lng, ns) => getLoadPath(lng, ns),
        },

        debug: false,
        interpolation: {
            escapeValue: false // React already handles XSS protection
        },
    });

// Function to manually fetch and merge client-specific translations
const loadClientTranslations = async () => {
    if (!clientName) return;

    const namespaces = i18n.options.ns || [];
    const lng = i18n.language || 'en';

    // Fetch translations from client-specific paths
    await Promise.all(
        namespaces.map(async (ns) => {
            const clientPath = `/locales/client/${clientName}/RmMaster/${ns}.json`;

            try {
                const response = await fetch(clientPath);
                if (response.ok) {
                    const data = await response.json();
                    // Add client-specific translations to i18n
                    i18n.addResourceBundle(lng, ns, data, true, true);
                }
            } catch (error) {
                console.error('Error loading client-specific translations:', error);
            }
        })
    );
};

// Load client-specific translations after i18next is initialized
i18n.on('initialized', loadClientTranslations);

export default i18n;
