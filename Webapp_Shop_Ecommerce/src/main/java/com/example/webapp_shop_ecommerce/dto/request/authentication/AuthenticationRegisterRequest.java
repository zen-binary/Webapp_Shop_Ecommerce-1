package com.example.webapp_shop_ecommerce.dto.request.authentication;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@NoArgsConstructor
@AllArgsConstructor
@Getter
@Setter
public class AuthenticationRegisterRequest {
    private String customerName;
    private String email;
    private String password;
    private String phone;

}
