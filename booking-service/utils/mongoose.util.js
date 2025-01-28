const NotFoundError = require("../errors/notFound.error");
const { logger } = require("./logging.util");

// check whether document exists 
function isDocExistent(record, path) {
    if (!record) {
      throw new NotFoundError(`${path} not found!`);
    }
    
    return true;
}

function paginate(totalItems, currentPage, itemsPerPage) {
  const numOfPages = Math.ceil(totalItems / itemsPerPage);

  if (currentPage < 1) { currentPage = 1; }
  
  if (currentPage > numOfPages) { currentPage = numOfPages; }
  
  // lowerBound, i.e., skipTo
  let lowerBound = (currentPage - 1) * itemsPerPage; 
  if (lowerBound < 0) { lowerBound = 0 };

  return [lowerBound, numOfPages, currentPage]; 
}

module.exports = {
    isDocExistent, 
    paginate, 
};