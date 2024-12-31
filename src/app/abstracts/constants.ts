
/**
 * A class that holds constants used in various parts of the application
 */
export default abstract class Constants{
    private constructor(){}
    static readonly SLUG_REGEX = /^[a-z](-?[a-z])*$/;

    static readonly itemsTableName = 'items';

    static readonly itemsQuantitiesTableName = 'items_quantities';
}