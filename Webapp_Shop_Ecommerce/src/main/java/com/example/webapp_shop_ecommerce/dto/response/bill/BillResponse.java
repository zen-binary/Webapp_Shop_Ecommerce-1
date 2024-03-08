package com.example.webapp_shop_ecommerce.dto.response.bill;

import com.example.webapp_shop_ecommerce.dto.response.customer.CustomerResponse;
import jakarta.persistence.Column;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;
import java.util.Date;

@NoArgsConstructor
@AllArgsConstructor
@Getter
@Setter
public class BillResponse {
//    private Long id;
    private String codeBill;
    private String status;
    private String billType;
    private BigDecimal cash;
    private BigDecimal digitalCurrency;
    private BigDecimal totalMoney;
    private BigDecimal intoMoney;
    private Date bookingDate;
    private Date paymentDate;
    private Date DeliveryDate;
    private Date completionDate;
    private String email;
    private String receiverName;
    private String receiverPhone;
    private String receiverDetails;
    private String receiverCommune;
    private String receiverDistrict;
    private String receiverProvince;


    private CustomerResponse customer;

//    private UserDto user;

}
