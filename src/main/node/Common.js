function Common(){}

Common.folderExist = async function(folderToValidate) {
  try {
    await fs.promises.access(folderToValidate, fs.constants.F_OK)      
    return true;
  } catch (e) {
    return false;
  }   
}

Common.hasTheMinimalI18nConfiguration = function(config) {
  if(typeof config.i18n === 'undefined') return false;
  if(typeof config.i18n.strategy === 'undefined') return false;

  var strategy = config.i18n.strategy;
  if(strategy!=="ssr"){
    console.log(`Not supported i18n strategy: ${strategy}`);
    return false;
  }

  if(typeof config.i18n.languages === 'undefined') return false;
  if(config.i18n.languages.lenght <2) {
    console.log(`i18n needs at least 2 languages. I18n will not be enabled`);
    return false
  };

  return true;

}


module.exports = Common;
