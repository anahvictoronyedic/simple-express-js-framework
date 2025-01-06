
/**
 * A class that holds constants used in various parts of the application
 */
export default abstract class Constants{

    private constructor(){}

    static readonly SLUG_REGEX = /^[a-z](-?[a-z])*$/;

    static readonly itemsTableName = 'items';
    static readonly itemsQuantitiesTableName = 'item_quantities';

    /**
     * These keys are for the app object store. They are defined here to make the code DRY, so that when a key
     * is marked for change, there wont be need to go through all parts of the application.
     */
    static GLOBAL_OBJECT_KEYS = {
        controller : {
            items : 'app.controller.items',
        },
        model : {
            items : 'app.model.items',
        },
        system:{
            mysql:'app.system.mysql',
        },
    };
}