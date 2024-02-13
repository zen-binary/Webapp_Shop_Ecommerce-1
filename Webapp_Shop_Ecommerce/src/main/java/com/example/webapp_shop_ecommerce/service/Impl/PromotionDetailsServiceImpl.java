package com.example.webapp_shop_ecommerce.service.Impl;

import com.example.webapp_shop_ecommerce.entity.Promotion;
import com.example.webapp_shop_ecommerce.entity.PromotionDetails;
import com.example.webapp_shop_ecommerce.repositories.IPromotionDetailsRepository;
import com.example.webapp_shop_ecommerce.repositories.IPromotionRepository;
import com.example.webapp_shop_ecommerce.service.IPromotionDetailsService;
import com.example.webapp_shop_ecommerce.service.IPromotionService;
import org.springframework.stereotype.Service;

@Service
public class PromotionDetailsServiceImpl extends BaseServiceImpl<PromotionDetails, Long, IPromotionDetailsRepository> implements IPromotionDetailsService {

}
