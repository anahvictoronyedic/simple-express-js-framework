
-- WARNING: TIMESTAMPS are subject to the year 2038 problem. A solution can be proffered as time proceeds.

CREATE TABLE IF NOT EXISTS items(
    id INT(11) UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
    slug VARCHAR(255) NOT NULL,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    UNIQUE KEY ( slug ) 
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS item_quantities(
    
    id INT(11) NOT NULL AUTO_INCREMENT PRIMARY KEY,
    item_id INT(11) UNSIGNED NOT NULL,
    quantity INT(11) UNSIGNED NOT NULL,

    -- The expiry considers up to 3 fractional digits for precision
    expiry DATETIME(3) NOT NULL,

    -- if true, the entry is invalid whether the product has expired or not
    obsolete BOOLEAN NOT NULL DEFAULT FALSE ,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    FOREIGN KEY (item_id) REFERENCES items(id),

    INDEX( quantity , expiry , obsolete )
) ENGINE=InnoDB;

-- This procedure uses transaction and rowlocking to make sale for an item
DELIMITER $$
DROP PROCEDURE IF EXISTS sell_by_quantity$$
CREATE PROCEDURE sell_by_quantity( IN _item_id INT(11) , IN _quantity INT(11) , OUT compute_success BOOLEAN )
BEGIN

    DECLARE quantity_sum INT DEFAULT 0;
    DECLARE row_quantity INT;
    DECLARE item_quantity_id INT(11);
    DECLARE noop BOOLEAN DEFAULT FALSE;

    DECLARE sell_row_cur CURSOR FOR
        SELECT id,quantity FROM item_quantities WHERE item_id = _item_id AND expiry > CURRENT_TIMESTAMP AND obsolete = FALSE ORDER BY expiry ASC FOR UPDATE;

    DECLARE EXIT HANDLER FOR SQLEXCEPTION, SQLWARNING
        BEGIN
            ROLLBACK;
            RESIGNAL;
        END;

    DECLARE CONTINUE HANDLER FOR NOT FOUND
        BEGIN
            SET noop = TRUE;
        END;
    
    START TRANSACTION;

    OPEN sell_row_cur;

    SET compute_success = FALSE;

    compute_loop : LOOP

        FETCH NEXT FROM sell_row_cur INTO item_quantity_id,row_quantity;

        IF noop = TRUE THEN
            LEAVE compute_loop;
        ELSE

            SET quantity_sum = quantity_sum + row_quantity;

            -- The logic is to go through rows, summing up there quantities until it equals or exceeds total quantity expected to be sold.
            -- If at the last stage and only a part of that last row quantity is needed, then reduce the quantity of the last row.
            IF quantity_sum <= _quantity THEN
                UPDATE item_quantities SET obsolete = TRUE WHERE id = item_quantity_id;

                IF quantity_sum = _quantity THEN
                    SET compute_success = TRUE;
                    LEAVE compute_loop;
                END IF;
            ELSE
                UPDATE item_quantities SET quantity = quantity_sum - _quantity WHERE id = item_quantity_id;
                SET compute_success = TRUE;
                LEAVE compute_loop;
            END IF;

        END IF;

    END LOOP compute_loop;

    CLOSE sell_row_cur;

    IF compute_success = FALSE THEN
        ROLLBACK;
    ELSE
        COMMIT;
    END IF;

END $$
DELIMITER ;
