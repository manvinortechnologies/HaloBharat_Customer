const COLORS = {
  // Base
  black: '#000000',
  white: '#FFFFFF',
  whiteSoft: '#FFF5F0',

  // Brand / primary
  primary: '#1C3452',
  primaryMuted: '#1C3D5A',
  primaryDeep: '#1E2A4A',
  primaryDark: '#151F2C',
  steelBlue: '#2C3E50',
  brandBlue: '#007AFF',
  skyBlue: '#9ED2FF',

  // Success & info
  success: '#28A745',
  successBright: '#4CAF50',
  successSoft: '#E8F5E9',
  infoSurface: '#E6EEFA',
  infoBorder: '#E3F2FD',

  // Accents
  accentBronze: '#9E7946',
  accentBronzeTransparent: '#9E794600',
  accentGold: '#DBB005',
  accentGoldBright: '#FFD700',
  accentAmber: '#FCA311',
  accentYellow: '#FFB800',
  accentOrange: '#FF6B35',
  accentCoral: '#F77F6F',
  accentClay: '#D66651',
  accentRed: '#FF4444',
  accentCrimson: '#E53935',
  accentRuby: '#B20808',
  danger: '#FF0000',

  // Grayscale / text
  textDark: '#303030',
  textSemiDark: '#333333',
  textMedium: '#444444',
  textMuted: '#555555',
  textSmoke: '#656565',
  textSubtle: '#666666',
  textAsh: '#696969',
  textCool: '#777777',
  textStone: '#858383',
  gray400: '#999999',
  gray450: '#9E9C9C',
  gray500: '#AAAAAA',
  gray550: '#B6B6B6',
  gray600: '#B8B8B8',
  gray650: '#C2C2C2',
  gray700: '#CCCCCC',
  gray750: '#D9D9D9',
  gray800: '#DDDDDD',
  gray825: '#E0E0E0',
  gray850: '#E0E3E4',
  gray875: '#E3E3E3',
  gray900: '#E5E5E5',
  gray925: '#EEEEEE',
  gray950: '#F0F1F3',
  gray975: '#F1F7F8',
  gray1000: '#F3F3F3',
  gray1025: '#F5F5F5',
  gray1050: '#F8F8F8',
  gray1075: '#F9FBFF',

  // Utility
  overlayStrong: 'rgba(0,0,0,0.5)',
  overlayMedium: 'rgba(0,0,0,0.4)',
  overlayLight: 'rgba(0,0,0,0.3)',
};

export type ColorToken = keyof typeof COLORS;

export default COLORS;
