export type Item = {
    product_sku: string;
    quantity: number;
    item_id: string;
    //  transaction_id: string;
    //  fba_product_code: string;
    //  hs_code: string;
    //  product_declared_value: string;
};

export type ConsigneeInfo = {
    name: string;
    last_name: string;
    country: string;
    province: string;
    city: string;
    address1: string;
    address2: string;
    zipcode: string;
    phone: string;
    cell_phone: string;
    email: string;
    company: string;
    doorplate: string;
};

export type VATChangeInfo = {
    ioss_number: string;
    shipper_vat: string;
    shipper_eori: string;
    shipper_company_name: string;
    recipient_vat: string;
    recipient_eori: string;
    pid_number: string;
    recipient_vat_country: string;
    recipient_eori_country: string;
};

export type ExtendInfo = {
    property_label: string;
};

export type TruckInfo = {
    reference_id: string;
    seller_name: string;
    fba_warehouse_code: string;
};

export type OrderItems = {
    items: Item[];
    consignee_info: ConsigneeInfo;
    vat_change_info: VATChangeInfo;
    extend_info: ExtendInfo;
    customer_package_requirement: number;
    truck_info: TruckInfo;
    attachment_ids: string[];
};
