const origlog = console.log;

function LoggerFactory() { }

LoggerFactory.init = async function () {

  console.log = function (obj, ...argumentArray) {

    var prefix = (new Date()).toISOString() + " [INFO]  ";
    if (typeof obj === 'string') {
      argumentArray.unshift(prefix + obj);
    } else {
      argumentArray.unshift(obj);
      argumentArray.unshift(prefix);
    }
    origlog.apply(this, argumentArray);
  };  

  console.debug = function (obj, ...argumentArray) {
    if (process.env.LOGGER_LEVEL !== "debug") return;    
    var prefix = (new Date()).toISOString() + " [DEBUG] ";
    if (typeof obj === 'string') {
      argumentArray.unshift(prefix + obj);
    } else {
      argumentArray.unshift(obj);
      argumentArray.unshift(prefix);
    }
    origlog.apply(this, argumentArray);
  };

}

module.exports = LoggerFactory;
