module.exports = function (api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    // Must stay last in the plugins list.
    plugins: ['react-native-worklets/plugin'],
  };
};
