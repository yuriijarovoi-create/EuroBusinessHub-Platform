import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import type { MapVisualModeProfile } from '../utils/mapVisualModes';

export function useMapVisualModeCopy(profile: MapVisualModeProfile) {
  const { t } = useTranslation('map');

  return useMemo(() => {
    const baseKey = `visualModes.${profile.id}`;
    const tickerMessages = t(`${baseKey}.tickerMessages`, {
      returnObjects: true,
      defaultValue: profile.tickerMessages,
    });

    return {
      panelTitle: t(`${baseKey}.panelTitle`, { defaultValue: profile.panelTitle }),
      recommendation: t(`${baseKey}.recommendation`, { defaultValue: profile.recommendation }),
      tickerEyebrow: t(`${baseKey}.tickerEyebrow`, { defaultValue: profile.tickerEyebrow }),
      tickerMessages: Array.isArray(tickerMessages) ? (tickerMessages as string[]) : profile.tickerMessages,
    };
  }, [profile, t]);
}
