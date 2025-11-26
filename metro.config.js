// Learn more https://docs.expo.io/guides/customizing-metro
const { getDefaultConfig } = require('expo/metro-config');
const { withNativeWind } = require("nativewind/metro");

/** @type {import('expo/metro-config').MetroConfig} */
const config = getDefaultConfig(__dirname);

// Expo Router가 components 폴더를 라우트로 인식하지 않도록 설정
config.resolver.sourceExts = [...config.resolver.sourceExts, 'tsx', 'ts'];
config.watchFolders = [__dirname];

module.exports = withNativeWind(config, { input: "./app/global.css" });