import { Order } from '../../graphql';
import { Item } from '../../cirro';
import { axiosClient } from './axios';

export const createOrder = async ({ id, lines, shippingAddress, shippingMethodName, userEmail }: Order) => {
    const { country, countryArea, city, streetAddress1, streetAddress2, postalCode, firstName, lastName, phone } =
        shippingAddress || {};
    let hs_code = 3923290000;
    if (country?.country == 'EU') {
        hs_code = 3923210000;
    }
    const items: Item[] =
        lines?.map((line) => ({
            // product_sku: line.barcode as string,
            product_sku: line.productSku as string,
            quantity: line.quantity,
            item_id: line.productVariantId as string,
            hs_code,
        })) || [];

    let vat_change_info = {
        ioss_number: '',
        shipper_vat: '',
        shipper_eori: '',
        shipper_company_name: '',
        recipient_vat: '',
        recipient_eori: '',
        pid_number: '',
        recipient_vat_country: '',
        recipient_eori_country: '',
    };

    if (country?.country === 'UK') {
        vat_change_info = {
            ...vat_change_info,
            shipper_vat: 'GB421663612',
            shipper_eori: 'GB421663612000',
            shipper_company_name: 'Envirolution Pty Ltd',
        };
    }
    if (country?.country === 'EU') {
        vat_change_info = {
            ...vat_change_info,
            shipper_vat: 'DE361260056',
            shipper_company_name: 'Envirolution Pty Ltd',
        };
    }

    const body = {
        // Mandatory params
        reference_no: id,
        // check
        shipping_method: shippingMethodName,
        // check
        // warehouse_code: order.availableCollectionPoints,
        country_code: country?.code,
        province: countryArea,
        city,
        address1: streetAddress1,
        address2: streetAddress2,
        zipcode: postalCode,
        name: firstName,
        last_name: lastName,
        items,
        vat_change_info,

        // Optional params
        phone,
        email: userEmail,
    };

    await axiosClient.post('/v1/order/create', body);
};
