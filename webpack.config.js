const createExpoWebpackConfigAsync = require('@expo/webpack-config');

module.exports = async function (env, argv) {
  const config = await createExpoWebpackConfigAsync(
    {
      ...env,
      babel: {
        dangerouslyAddModulePathsToTranspile: ['react-native-reanimated'],
      },
    },
    argv
  );
  
  // Adicionar alias para react-native-reanimated na web
  config.resolve.alias = {
    ...config.resolve.alias,
    'react-native-reanimated': require.resolve('./src/utils/reanimated-web-mock.js'),
  };

  return config;
};
