const locationModel = require('../models/locationModel');
const common = require('@kelchy/common');
const Error = require('../helpers/error');
const { log } = require('../helpers/logger');

const createLocation = async (req, res) => {
  const { name, address } = req.body;
  const { data, error: duplicateLocationNameError } = await common.awaitWrap(
    locationModel.findLocationByName({ name })
  );
  if (data) {
    log.error('ERR_LOCATION_CREATE-LOCATION');

    return res.status(400).json({ message: 'Location name already exists' });
  } else if (duplicateLocationNameError) {
    log.error('ERR_LOCATION_CREATE-LOCATION', {
      err: duplicateLocationNameError.message,
      req: { body: req.body, params: req.params }
    });
    return res.status(400).json({ message: 'Unable to find location name' });
  } else {
    const { error } = await common.awaitWrap(
      locationModel.createLocation({
        name,
        address
      })
    );

    if (error) {
      log.error('ERR_LOCATION_CREATE-LOCATION', {
        err: error.message,
        req: { body: req.body, params: req.params }
      });
      const e = Error.http(error);
      return res.status(e.code).json(e.message);
    } else {
      log.out('OK_LOCATION_CREATE-LOCATION', {
        req: { body: req.body, params: req.params },
        res: { message: 'location created' }
      });
      return res.json({ message: 'location created' });
    }
  }
};

const getAllLocations = async (req, res) => {
  const { data, error } = await common.awaitWrap(
    locationModel.getAllLocations({})
  );

  if (error) {
    log.error('ERR_LOCATION_GET-ALL-LOCATIONS', {
      err: error.message,
      req: { body: req.body, params: req.params }
    });
    const e = Error.http(error);
    return res.status(e.code).json(e.message);
  } else {
    log.out('OK_LOCATION_GET-ALL-LOCATIONS', {
      req: { body: req.body, params: req.params },
      res: JSON.stringify(data)
    });
    return res.json(data);
  }
};

const getLocation = async (req, res) => {
  try {
    const { id } = req.params;
    const location = await locationModel.findLocationById({ id });
    log.out('OK_LOCATION_GET-LOCATION-BY-ID', {
      req: { body: req.body, params: req.params },
      res: JSON.stringify(location)
    });
    return res.json(location);
  } catch (error) {
    log.error('ERR_LOCATION_GET-LOCATION-BY-ID', {
      err: error.message,
      req: { body: req.body, params: req.params }
    });
    return res.status(400).send('Error getting location');
  }
};

const getLocationByName = async (req, res) => {
  try {
    const { name } = req.body;
    const location = await locationModel.findLocationByName({ name });
    log.out('OK_LOCATION_GET-LOCATION-BY-NAME', {
      req: { body: req.body, params: req.params },
      res: JSON.stringify(location)
    });
    return res.json(location);
  } catch (error) {
    log.error('ERR_LOCATION_GET-LOCATION-BY-NAME', {
      err: error.message,
      req: { body: req.body, params: req.params }
    });
    return res.status(400).send('Error getting location by name');
  }
};

const updateLocation = async (req, res) => {
  const { id, name, stockQuantity, address } = req.body;
  const { data, error: duplicateLocationNameError } = await common.awaitWrap(
    locationModel.findLocationByName({ name })
  );
  if (data && data.id != id) {
    log.error('ERR_LOCATION_CREATE-LOCATION');
    return res.status(400).json({ message: 'Location name already exists' });
  } else if (duplicateLocationNameError) {
    log.error('ERR_LOCATION_CREATE-LOCATION');
    return res.status(400).json({ message: 'Unable to find location name' });
  } else {
    const { error } = await common.awaitWrap(
      locationModel.updateLocations({ id, name, stockQuantity, address })
    );
    if (error) {
      log.error('ERR_LOCATION_UPDATE-LOCATION', {
        err: error.message,
        req: { body: req.body, params: req.params }
      });
      const e = Error.http(error);
      return res.status(e.code).json(e.message);
    } else {
      log.out('OK_LOCATION_UPDATE-LOCATION', {
        req: { body: req.body, params: req.params },
        res: { message: `Updated location with id:${id}` }
      });
      return res.json({ message: `Updated location with id:${id}` });
    }
  }
};

const updateLocationWithoutProducts = async (req, res) => {
  const { id, name, address } = req.body;
  const { data, error: duplicateLocationNameError } = await common.awaitWrap(
    locationModel.findLocationByName({ name })
  );
  if (data && data.id != id) {
    log.error('ERR_LOCATION_CREATE-LOCATION');
    return res.status(400).json({ message: 'Location name already exists' });
  } else if (duplicateLocationNameError) {
    log.error('ERR_LOCATION_CREATE-LOCATION');
    return res.status(400).json({ message: 'Unable to find location name' });
  } else {
    const { error } = await common.awaitWrap(
      locationModel.updateLocationsWithoutProducts({ id, name, address })
    );
    if (error) {
      log.error('ERR_LOCATION_UPDATE-LOCATION', {
        err: error.message,
        req: { body: req.body, params: req.params }
      });
      const e = Error.http(error);
      return res.status(e.code).json(e.message);
    } else {
      log.out('OK_LOCATION_UPDATE-LOCATION', {
        req: { body: req.body, params: req.params },
        res: { message: `Updated location with id:${id}` }
      });
      return res.json({ message: `Updated location with id:${id}` });
    }
  }
};

const addProductsToLocation = async (req, res) => {
  const { products, locationId: id } = req.body;
  const { error } = await common.awaitWrap(
    locationModel.addProductsToLocation({ products, id })
  );
  if (error) {
    log.error('ERR_LOCATION_ADD-PRODUCTS-TO-LOCATION', {
      err: error.message,
      req: { body: req.body, params: req.params }
    });
    const e = Error.http(error);
    return res.status(e.code).json(e.message);
  } else {
    log.out('OK_LOCATION_ADD-PRODUCTS', {
      req: { body: req.body, params: req.params },
      res: { message: `Updated location with id:${id}` }
    });
    return res.json({ message: `Updated location with id:${id}` });
  }
};

const deleteLocation = async (req, res) => {
  const { id } = req.params;
  const { error } = await common.awaitWrap(
    locationModel.deleteLocation({ id })
  );
  if (error) {
    log.error('ERR_LOCATION_DELETE_LOCATION', {
      err: error.message,
      req: { body: req.body, params: req.params }
    });
    const e = Error.http(error);
    return res.status(e.code).json(e.message);
  } else {
    log.out('OK_LOCATION_DELETE_LOCATION', {
      req: { body: req.body, params: req.params },
      res: { message: `Deleted location with id:${id}` }
    });
    return res.json({ message: `Deleted location with id:${id}` });
  }
};

exports.createLocation = createLocation;
exports.getAllLocations = getAllLocations;
exports.updateLocation = updateLocation;
exports.deleteLocation = deleteLocation;
exports.getLocation = getLocation;
exports.getLocationByName = getLocationByName;
exports.addProductsToLocation = addProductsToLocation;
exports.updateLocationWithoutProducts = updateLocationWithoutProducts;
