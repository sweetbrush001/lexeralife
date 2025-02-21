import { useSettings } from '../context/SettingsContext';

export const useTextStyle = () => {
  const { settings } = useSettings();

  return {
    fontSize: settings.fontSize,
    color: settings.fontColor,
    fontFamily: settings.isDyslexicFriendly ? 'OpenDyslexic-Regular' : undefined,
    opacity: settings.contrast,
  };
}; 