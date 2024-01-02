import { Order } from '../../graphql';
import { Item, VATChangeInfo } from '../../cirro';
import { axiosClient } from './axios';
import { isCountryInEU } from './utils';

interface OrderCreatedResponse {
  ask: string;
  message: string;
  order_code: string;
}
export const createOrder = async ({ id, lines, shippingAddress, shippingMethodName, userEmail }: Order) => {
  const { country, countryArea, city, streetAddress1, streetAddress2, postalCode, firstName, lastName, phone } =
    shippingAddress || {};
  let hs_code = 3923290000;
  if (country?.country && isCountryInEU(country.country)) {
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

  let vat_change_info: VATChangeInfo = {
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

  if (country?.country === 'United Kingdom') {
    vat_change_info = {
      ...vat_change_info,
      shipper_vat: 'GB421663612',
      shipper_eori: 'GB421663612000',
      shipper_company_name: 'Envirolution Pty Ltd',
    };
  }
  if (country?.country && isCountryInEU(country.country)) {
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
    warehouse_code: country?.code,
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

  const {
    data: { ask, message, order_code },
  } = await axiosClient.post<OrderCreatedResponse>('/public_open/order/create_order', body);
  if (ask === 'Failure') {
    throw new Error(`order ${id} created failed, error message: ${message}`);
  } else {
    console.log(`order ${id} created successful, order code is ${order_code}`);
  }
};
