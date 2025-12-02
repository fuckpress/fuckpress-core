const Handlebars = require('handlebars');

function HandlebarsSetup(){}

HandlebarsSetup.init = function() {
  Handlebars.registerHelper('lookup', function (array, index) {
      // Note: Removed the 'key' argument here
      if (Array.isArray(array) && index >= 0 && index < array.length) {
          // Return the entire object at the index
          return array[index]; 
      }
      return null;
  });
}



module.exports = HandlebarsSetup;
