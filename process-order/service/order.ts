import { Order } from '../../graphql';
import { VATChangeInfo } from '../../cirro';
import { axiosClient } from './axios';
import { isCountryInEU } from './utils';

const DEFAULT_HS_CODE = 3923290000;
const EU_HS_CODE = 3923210000;
const ENVIROLUTION_COMPANY_NAME = 'Envirolution Pty Ltd';

interface OrderCreatedResponse {
  ask: string;
  message: string;
  order_code: string;
}

export const createOrder = async (order: Order) => {
  const { id, lines, shippingAddress, shippingMethodName, metadata, userEmail } = order;
  const reference_no = Buffer.from(id, 'base64').toString('utf-8');
  const { country, countryArea, city, streetAddress1, streetAddress2, postalCode, firstName, lastName, phone } =
    shippingAddress || {};
  const hs_code = country?.country && isCountryInEU(country.country) ? EU_HS_CODE : DEFAULT_HS_CODE;
  const vatChangeInfo = country?.country && createVATChangeInfo(country.country);

  const items =
    lines?.map((line) => ({
      product_sku: line.productSku,
      barcode: line.variant?.attributes.find((x) => x.attribute.slug === 'barcode')?.values[0]?.plainText || '',
      quantity: line.quantity,
      hs_code,
    })) || [];

  const warehouse = metadata.find((m) => m.key == 'warehouseCode');

  const body = {
    reference_no,
    shipping_method: shippingMethodName,
    warehouse_code: warehouse?.value,
    country_code: country?.code,
    province: countryArea,
    city,
    address1: streetAddress1,
    address2: streetAddress2,
    zipcode: postalCode,
    name: firstName,
    last_name: lastName,
    items,
    vat_change_info: vatChangeInfo,
    phone,
    email: userEmail,
    verify: 1,
  };

  const {
    data: { ask, message, order_code },
  } = await axiosClient.post<OrderCreatedResponse>('/public_open/order/create_order', body);

  if (ask === 'Failure') {
    throw new Error(`Order ${id} creation failed: ${message}`);
  }
  if (ask === 'Success') {
    console.info(`Order ${id} created successfully. Order code: ${order_code}. Reference number: ${reference_no}`);
  }
};

const createVATChangeInfo = (country: string): VATChangeInfo => {
  let vatChangeInfo = {} as VATChangeInfo;

  if (country === 'United Kingdom') {
    vatChangeInfo = {
      ...vatChangeInfo,
      shipper_vat: 'GB421663612',
      shipper_eori: 'GB421663612000',
      shipper_company_name: ENVIROLUTION_COMPANY_NAME,
    };
  }

  if (isCountryInEU(country)) {
    vatChangeInfo = {
      ...vatChangeInfo,
      shipper_vat: 'DE361260056',
      shipper_company_name: ENVIROLUTION_COMPANY_NAME,
    };
  }

  return vatChangeInfo;
};
