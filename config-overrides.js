const {
  override,
  addBabelPlugins,
  addWebpackExternals,
  useBabelRc
} = require('customize-cra');

const isElectron = process.env.BROWSER === 'none';
// TODO: You can customize your env
// TODO: 这里你可以定制自己的env
const isProd = process.env.ENV === 'production';

const sourceMap = () => config => {
  // TODO: Please use 'source-map' in production environment
  // TODO: 建议上发布环境用 'source-map'
  config.devtool = isProd ? 'source-map' : 'cheap-module-eval-source-map'
  return config;
}

module.exports = override(
  sourceMap(),
  isElectron && addWebpackExternals({
    "agora-electron-sdk": "commonjs2 agora-electron-sdk"
  }),
  addBabelPlugins(
    '@babel/plugin-proposal-optional-chaining'
  ),
  useBabelRc()
)
