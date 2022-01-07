"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * A class that holds constants used in various parts of the application
 */
class Constants {
    constructor() { }
}
exports.default = Constants;
Constants.SLUG_REGEX = /^[a-z](-?[a-z])*$/;
Constants.itemsTableName = 'items';
Constants.itemsQuantitiesTableName = 'items_quantities';
/**
 * These keys are for the app object store. They are defined here to make the code DRY, so that when a key
 * is marked for change, there wont be need to go through all parts of the application.
 */
Constants.GLOBAL_OBJECT_KEYS = {
    controller: {
        items: 'app.controller.items',
    },
    model: {
        items: 'app.model.items',
    },
    system: {
        mysql: 'app.system.mysql',
    },
};
//# sourceMappingURL=constants.js.map