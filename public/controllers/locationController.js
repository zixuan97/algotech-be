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
    res.status(400).json({ message: 'Location name already exists' });
  } else if (duplicateLocationNameError) {
    log.error('ERR_LOCATION_CREATE-LOCATION');
    res.json(
      { message: 'Unable to find location name' },
      duplicateLocationNameError.message
    );
  } else {
    const { error } = await common.awaitWrap(
      locationModel.createLocation({
        name,
        address
      })
    );

    if (error) {
      log.error('ERR_LOCATION_CREATE-LOCATION', error.message);
      const e = Error.http(error);
      res.status(e.code).json(e.message);
    } else {
      log.out('OK_LOCATION_CREATE-LOCATION');
      res.json({ message: 'location created' });
    }
  }
};

const getAllLocations = async (req, res) => {
  const { data, error } = await common.awaitWrap(
    locationModel.getAllLocations({})
  );

  if (error) {
    log.error('ERR_LOCATION_GET-ALL-LOCATIONS', error.message);
    const e = Error.http(error);
    res.status(e.code).json(e.message);
  } else {
    log.out('OK_LOCATION_GET-ALL-LOCATIONS');
    res.json(data);
  }
};

const getLocation = async (req, res) => {
  try {
    const { id } = req.params;
    const location = await locationModel.findLocationById({ id });
    log.out('OK_LOCATION_GET-LOCATION-BY-ID');
    res.json(location);
  } catch (error) {
    log.error('ERR_LOCATION_GET-LOCATION', error.message);
    res.status(500).send('Server Error');
  }
};

const getLocationByName = async (req, res) => {
  try {
    const { name } = req.body;
    const location = await locationModel.findLocationByName({ name });
    log.out('OK_LOCATION_GET-LOCATION-BY-ID');
    res.json(location);
  } catch (error) {
    log.error('ERR_LOCATION_GET-LOCATION', error.message);
    res.status(500).send('Server Error');
  }
};

const updateLocation = async (req, res) => {
  const { id, name, stockQuantity, address } = req.body;
  const { data, error: duplicateLocationNameError } = await common.awaitWrap(
    locationModel.findLocationByName({ name })
  );
  if (data && data.id != id) {
    log.error('ERR_LOCATION_CREATE-LOCATION');
    res.status(400).json({ message: 'Location name already exists' });
  } else if (duplicateLocationNameError) {
    log.error('ERR_LOCATION_CREATE-LOCATION');
    res.json(
      { message: 'Unable to find location name' },
      duplicateLocationNameError.message
    );
  } else {
    const { error } = await common.awaitWrap(
      locationModel.updateLocations({ id, name, stockQuantity, address })
    );
    if (error) {
      log.error('ERR_LOCATION_UPDATE-LOCATION', error.message);
      const e = Error.http(error);
      res.status(e.code).json(e.message);
    } else {
      log.out('OK_LOCATION_UPDATE-LOCATION');
      res.json({ message: `Updated location with id:${id}` });
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
    res.status(400).json({ message: 'Location name already exists' });
  } else if (duplicateLocationNameError) {
    log.error('ERR_LOCATION_CREATE-LOCATION');
    res.json(
      { message: 'Unable to find location name' },
      duplicateLocationNameError.message
    );
  } else {
    const { error } = await common.awaitWrap(
      locationModel.updateLocationsWithoutProducts({ id, name, address })
    );
    if (error) {
      log.error('ERR_LOCATION_UPDATE-LOCATION', error.message);
      const e = Error.http(error);
      res.status(e.code).json(e.message);
    } else {
      log.out('OK_LOCATION_UPDATE-LOCATION');
      res.json({ message: `Updated location with id:${id}` });
    }
  }
};

const addProductsToLocation = async (req, res) => {
  const { products, locationId: id } = req.body;
  const { error } = await common.awaitWrap(
    locationModel.addProductsToLocation({ products, id })
  );
  if (error) {
    log.error('ERR_LOCATION_ADD-PRODUCTS', error.message);
    const e = Error.http(error);
    res.status(e.code).json(e.message);
  } else {
    log.out('OK_LOCATION_ADD-PRODUCTS');
    res.json({ message: `Updated location with id:${id}` });
  }
};

const deleteLocation = async (req, res) => {
  const { id } = req.params;
  const { error } = await common.awaitWrap(
    locationModel.deleteLocation({ id })
  );
  if (error) {
    log.error('ERR_LOCATION_DELETE_LOCATION', error.message);
    const e = Error.http(error);
    res.status(e.code).json(e.message);
  } else {
    log.out('OK_LOCATION_DELETE_LOCATION');
    res.json({ message: `Deleted location with id:${id}` });
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
