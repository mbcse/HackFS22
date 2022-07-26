const axios = require('axios');
const { validationResult } = require('express-validator');

const qryGenerator = require('../../service/graphQueryGenerator');
const graphUrls = require('../../config/graphUrls');
const responseUtil = require("../../utilities/response");

const queryChainData = async (req, res) => {
  let query;
  let data;
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      throw Error(JSON.stringify(errors.errors));
    }
    const { network, type, first, skip, owner, contract } = req.query;
    const count = first ? first : 1000;
    const offset = skip ? skip : 0;

    switch (type) {
      case 'erc1155':
        query = qryGenerator.erc1155(count, offset, owner, contract);
        break;
      case 'erc721':
        query = qryGenerator.erc721(count, offset, owner, contract);
        break;
      default:
        break;
    }

    const result = await axios.post(graphUrls[network][type], { query });

    if (type === 'erc1155' && result.data.data && result.data.data.balances) {
      data = result.data.data.balances;
    } else if (type === 'erc721' && result.data.data && result.data.data.tokens) {
      data = result.data.data.tokens;
    } else {
      throw Error;
    }

    return responseUtil.successResponse(res, "success", { data });
  } catch (err) {
    console.log(err);
    return responseUtil.serverErrorResponse(res, err);
  }
};

module.exports = {
  queryChainData
};
